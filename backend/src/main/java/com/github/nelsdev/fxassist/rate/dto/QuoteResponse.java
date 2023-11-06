package com.github.nelsdev.fxassist.rate.dto;

import com.github.nelsdev.fxassist.common.types.Currency;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class QuoteResponse {

  Currency from;
  Currency to;
  BigDecimal rate;
  BigDecimal reverseRate;
}
