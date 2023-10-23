package com.github.nelsdev.fxassist.rate.entity;

import com.github.nelsdev.fxassist.common.types.Currency;
import java.math.BigDecimal;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("quotes")
@Data
public class Quote {
  @Id private String id;
  private Currency currency;
  private BigDecimal rate;
}
