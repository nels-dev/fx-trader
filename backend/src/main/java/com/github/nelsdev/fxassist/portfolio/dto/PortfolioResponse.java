package com.github.nelsdev.fxassist.portfolio.dto;

import com.github.nelsdev.fxassist.common.types.Currency;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Set;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PortfolioResponse {

  OffsetDateTime createdAt;
  Map<Currency, BigDecimal> balances;

  Currency baseCurrency;
  BigDecimal balanceInBaseCurrency;

  BigDecimal amountDeposited;
  BigDecimal amountWithdrawn;
  BigDecimal percentageChange;
  Set<Currency> allowedCurrencies;
}
