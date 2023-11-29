package com.github.nelsdev.fxassist.rate.dto;

import com.github.nelsdev.fxassist.common.types.Currency;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class PredictionResponse {

  BigDecimal predictedZScore;
  Currency currency;
  LocalDate date;
}
