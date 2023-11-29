package com.github.nelsdev.fxassist.rate.entity;

import com.github.nelsdev.fxassist.common.types.Currency;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("predictions")
@Data
public class Prediction {
  @Id private String id;
  private Currency currency;
  private Instant date;
  private BigDecimal prediction;
}
