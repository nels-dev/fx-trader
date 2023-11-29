package com.github.nelsdev.fxassist.rate.service;

import com.github.nelsdev.fxassist.common.exception.ResourceNotFoundException;
import com.github.nelsdev.fxassist.common.types.Currency;
import com.github.nelsdev.fxassist.rate.dto.PredictionResponse;
import com.github.nelsdev.fxassist.rate.dto.QuoteHistoryResponse;
import com.github.nelsdev.fxassist.rate.dto.QuoteHistoryResponse.QuoteHistory;
import com.github.nelsdev.fxassist.rate.dto.QuoteResponse;
import com.github.nelsdev.fxassist.rate.entity.Quote;
import com.github.nelsdev.fxassist.rate.repository.PredictionRepository;
import com.github.nelsdev.fxassist.rate.repository.QuoteHistoryRepository;
import com.github.nelsdev.fxassist.rate.repository.QuoteRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateService {

  public static final int CACHE_EXPIRY_SECONDS = 300;
  private final QuoteRepository quoteRepository;
  private final QuoteHistoryRepository quoteHistoryRepository;
  private final PredictionRepository predictionRepository;

  private static final Map<Currency, Pair<Quote, Instant>> CACHE = new ConcurrentHashMap<>();

  private Quote getQuote(Currency currency) {
    if (!CACHE.containsKey(currency) || CACHE.get(currency).getSecond().isBefore(Instant.now())) {
      var newQuote =
          Pair.of(
              quoteRepository.findByCurrency(currency),
              Instant.now().plusSeconds(CACHE_EXPIRY_SECONDS));
      CACHE.put(currency, newQuote);
      return newQuote.getFirst();
    } else {
      return CACHE.get(currency).getFirst();
    }
  }

  public BigDecimal convert(Currency from, Currency to, BigDecimal amount) {
    if (from == to) {
      return amount;
    }

    if (from == Currency.USD) {
      Quote quote = getQuote(to);
      return quote.getRate().multiply(amount);
    } else if (to == Currency.USD) {
      Quote quote = getQuote(from);
      return amount.divide(quote.getRate(), 4, RoundingMode.HALF_UP);
    } else {
      return convert(Currency.USD, to, convert(from, Currency.USD, amount));
    }
  }

  public QuoteResponse getQuote(Currency from, Currency to) {
    BigDecimal rate = convert(from, to, BigDecimal.ONE);
    BigDecimal reverseRate = BigDecimal.ONE.divide(rate, 4, RoundingMode.HALF_UP);
    return QuoteResponse.builder().from(from).to(to).rate(rate).reverseRate(reverseRate).build();
  }

  public QuoteHistoryResponse getHistory(Currency currency) {
    var history =
        quoteHistoryRepository
            .getHistoryForCurrency(Instant.now().minus(30L, ChronoUnit.DAYS), currency)
            .stream()
            .map(
                quoteHistory ->
                    new QuoteHistory(
                        quoteHistory.getUpdated(), quoteHistory.getRates().get(0).getRate()))
            .collect(Collectors.toList());
    return QuoteHistoryResponse.builder().quoteHistory(history).build();
  }

  public PredictionResponse getPrediction(Currency currency) {
    return predictionRepository
        .findFirstByCurrencyOrderByDateDesc(currency)
        .map(
            prediction -> {
              return PredictionResponse.builder()
                  .predictedZScore(prediction.getPrediction())
                  .date(prediction.getDate().atOffset(ZoneOffset.UTC).toLocalDate())
                  .currency(prediction.getCurrency())
                  .build();
            })
        .orElseThrow(ResourceNotFoundException::new);
  }

  public List<Quote> getQuotes() {
    return quoteRepository.findAllByCurrencyIsIn(Arrays.asList(Currency.values()));
  }
}
