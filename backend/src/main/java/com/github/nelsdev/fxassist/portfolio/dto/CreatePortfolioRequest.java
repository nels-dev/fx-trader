package com.github.nelsdev.fxassist.portfolio.dto;

import com.github.nelsdev.fxassist.common.types.Currency;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Builder
@Value
@Jacksonized
public class CreatePortfolioRequest {
  @NotNull Currency currency;
  @NotNull @Positive BigDecimal amount;
}
