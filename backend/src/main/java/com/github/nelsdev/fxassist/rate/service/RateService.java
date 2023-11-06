package com.github.nelsdev.fxassist.rate.service;

import com.github.nelsdev.fxassist.common.types.Currency;
import com.github.nelsdev.fxassist.rate.entity.Quote;
import com.github.nelsdev.fxassist.rate.repository.QuoteRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
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
    if (from == to) return amount;

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
}
