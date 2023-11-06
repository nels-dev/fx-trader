package com.github.nelsdev.fxassist.portfolio.entity;

import com.github.nelsdev.fxassist.common.types.Currency;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("snapshot")
public class UserPortfolioSnapshot {
  @Id private String id;
  private String portfolioId;
  private String userId;
  private Currency baseCurrency;
  private Instant snapshotTime;
  private BigDecimal totalValue;
}
