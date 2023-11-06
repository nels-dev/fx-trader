package com.github.nelsdev.fxassist.portfolio.entity;

import com.github.nelsdev.fxassist.common.types.Currency;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("portfolio")
public class UserPortfolio {
  @Id private String id;
  private Currency baseCurrency;
  private String userId;
  private List<Balance> balances = new ArrayList<>();
  private Instant createdAt;
  private boolean active;
  private List<CashFlow> cashFlow = new ArrayList<>();

  @Data
  @AllArgsConstructor
  public static class Balance {
    private Currency currency;
    private BigDecimal amount;
  }

  @Data
  @AllArgsConstructor
  public static class CashFlow {
    private Instant transactionTime;
    private BigDecimal preCashFlowValue;
    private BigDecimal postCashFlowValue;
    private BigDecimal cashFlowValueInBase;
  }
}
