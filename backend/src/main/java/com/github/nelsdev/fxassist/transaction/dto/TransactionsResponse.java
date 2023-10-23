package com.github.nelsdev.fxassist.transaction.dto;

import com.github.nelsdev.fxassist.common.types.Currency;
import com.github.nelsdev.fxassist.transaction.entity.Transaction.TransactionType;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class TransactionsResponse {

  List<Transaction> transactions;

  @Builder
  @Value
  public static class Transaction {
    OffsetDateTime createdAt;
    Currency fromCurrency;
    Currency toCurrency;

    BigDecimal fromAmount;
    BigDecimal toAmount;
    BigDecimal rate;
    TransactionType type;
    boolean userInputtedRate;
  }
}
