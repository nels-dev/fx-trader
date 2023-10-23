package com.github.nelsdev.fxassist.rate.service;

import com.github.nelsdev.fxassist.common.types.Currency;
import com.github.nelsdev.fxassist.rate.entity.Quote;
import com.github.nelsdev.fxassist.rate.repository.QuoteRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RateService {

  private final QuoteRepository quoteRepository;

  public BigDecimal convert(Currency from, Currency to, BigDecimal amount) {
    if (from == to) return amount;

    if (from == Currency.USD) {
      Quote quote = quoteRepository.findByCurrency(to);
      return quote.getRate().multiply(amount);
    } else if (to == Currency.USD) {
      Quote quote = quoteRepository.findByCurrency(from);
      return amount.divide(quote.getRate(), 4, RoundingMode.HALF_UP);
    } else {
      return convert(Currency.USD, to, convert(from, Currency.USD, amount));
    }
  }
}
