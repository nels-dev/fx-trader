package com.github.nelsdev.fxassist.transaction.dto;

import com.github.nelsdev.fxassist.common.types.Currency;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Jacksonized
@Builder
@Value
public class DepositRequest {
  Currency currency;
  BigDecimal amount;
}
