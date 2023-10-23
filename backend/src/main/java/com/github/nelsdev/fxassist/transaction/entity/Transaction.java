package com.github.nelsdev.fxassist.transaction.entity;

import com.github.nelsdev.fxassist.common.types.Currency;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("transactions")
@Data
public class Transaction {

  @Id private String id;
  private String userId;
  private Instant createdAt;
  private Currency fromCurrency;
  private Currency toCurrency;

  private BigDecimal fromAmount;
  private BigDecimal toAmount;
  private BigDecimal rate;
  private TransactionType type;
  private boolean userInputtedRate;

  public enum TransactionType {
    TRADE,
    DEPOSIT,
    WITHDRAWAL
  }
}
