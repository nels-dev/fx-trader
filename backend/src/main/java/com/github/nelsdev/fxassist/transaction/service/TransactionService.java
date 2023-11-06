package com.github.nelsdev.fxassist.transaction.service;

import com.github.nelsdev.fxassist.common.types.Currency;
import com.github.nelsdev.fxassist.portfolio.service.PortfolioService;
import com.github.nelsdev.fxassist.rate.service.RateService;
import com.github.nelsdev.fxassist.transaction.dto.DepositRequest;
import com.github.nelsdev.fxassist.transaction.dto.TradeRequest;
import com.github.nelsdev.fxassist.transaction.dto.TransactionsResponse;
import com.github.nelsdev.fxassist.transaction.dto.WithdrawRequest;
import com.github.nelsdev.fxassist.transaction.entity.Transaction;
import com.github.nelsdev.fxassist.transaction.entity.Transaction.TransactionType;
import com.github.nelsdev.fxassist.transaction.repository.TransactionRepository;
import com.github.nelsdev.fxassist.user.entity.User;
import com.github.nelsdev.fxassist.user.service.UserService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TransactionService {

  private final UserService userService;
  private final TransactionRepository repository;
  private final PortfolioService portfolioService;
  private final RateService rateService;

  public void deposit(DepositRequest depositRequest) {
    portfolioService.depositToActivePortfolio(
        depositRequest.getCurrency(), depositRequest.getAmount());
    User user = userService.getCurrentUser();
    final Transaction transaction =
        createTransactionRecord(
            TransactionType.DEPOSIT,
            depositRequest.getCurrency(),
            depositRequest.getAmount(),
            user);
    repository.save(transaction);
  }

  private static Transaction createTransactionRecord(
      TransactionType deposit, Currency currency, BigDecimal amount, User user) {
    Transaction transaction = new Transaction();
    transaction.setCreatedAt(Instant.now());
    transaction.setType(deposit);
    transaction.setFromCurrency(currency);
    transaction.setToCurrency(currency);
    transaction.setFromAmount(amount);
    transaction.setToAmount(amount);
    transaction.setRate(BigDecimal.ONE);
    transaction.setUserId(user.getId());
    return transaction;
  }

  public void withdraw(WithdrawRequest withdrawRequest) {
    portfolioService.withdrawFromActivePortfolio(
        withdrawRequest.getCurrency(), withdrawRequest.getAmount());
    User user = userService.getCurrentUser();
    final Transaction transaction =
        createTransactionRecord(
            TransactionType.WITHDRAWAL,
            withdrawRequest.getCurrency(),
            withdrawRequest.getAmount(),
            user);
    repository.save(transaction);
  }

  public void trade(TradeRequest tradeRequest) {

    User user = userService.getCurrentUser();
    Transaction transaction = new Transaction();
    transaction.setCreatedAt(Instant.now());
    transaction.setUserId(user.getId());
    transaction.setType(TransactionType.TRADE);
    transaction.setToCurrency(tradeRequest.getToCurrency());
    transaction.setFromCurrency(tradeRequest.getFromCurrency());
    if (tradeRequest.getFromAmount() != null && tradeRequest.getToAmount() != null) {
      // User inputted both from and to amount.
      // We will take this to calculate the implied rate
      transaction.setUserInputtedRate(true);
      transaction.setFromAmount(tradeRequest.getFromAmount());
      transaction.setToAmount(tradeRequest.getToAmount());
    } else if (tradeRequest.getFromAmount() != null) {
      // User inputted just the from amount
      // We will calculate the to amount using live rate
      transaction.setFromAmount(tradeRequest.getFromAmount());
      BigDecimal toAmount =
          rateService.convert(
              tradeRequest.getFromCurrency(),
              tradeRequest.getToCurrency(),
              tradeRequest.getFromAmount());
      transaction.setToAmount(toAmount);
    } else if (tradeRequest.getToAmount() != null) {
      // User inputted just the to amount
      // We will calculate the from amount using live rate
      transaction.setToAmount(tradeRequest.getToAmount());
      BigDecimal fromAmount =
          rateService.convert(
              tradeRequest.getToCurrency(),
              tradeRequest.getFromCurrency(),
              tradeRequest.getToAmount());
      transaction.setFromAmount(fromAmount);
    }
    // Effective rate
    transaction.setRate(
        transaction.getToAmount().divide(transaction.getFromAmount(), 6, RoundingMode.HALF_UP));

    portfolioService.recordTradeTransaction(transaction);
    repository.save(transaction);
  }

  public TransactionsResponse getUserTransactions() {
    User user = userService.getCurrentUser();
    var transactions =
        repository.findAllByUserIdAndTypeInOrderByCreatedAtDesc(user.getId(), Set.of(TransactionType.DEPOSIT, TransactionType.WITHDRAWAL)).stream()
            .map(TransactionService::map)
            .collect(Collectors.toList());

    return TransactionsResponse.builder().transactions(transactions).build();
  }

  public TransactionsResponse getTrades() {
    User user = userService.getCurrentUser();
    var transactions =
        repository.findAllByUserIdAndTypeInOrderByCreatedAtDesc(user.getId(), Set.of(TransactionType.TRADE)).stream()
                  .map(TransactionService::map)
                  .collect(Collectors.toList());

    return TransactionsResponse.builder().transactions(transactions).build();
  }


  private static TransactionsResponse.Transaction map(Transaction t) {
    return TransactionsResponse.Transaction.builder()
                                           .rate(t.getRate())
                                           .toAmount(t.getToAmount())
                                           .fromAmount(t.getFromAmount())
                                           .fromCurrency(t.getFromCurrency())
                                           .toCurrency(t.getToCurrency())
                                           .createdAt(t.getCreatedAt()
                                                       .atOffset(ZoneOffset.UTC))
                                           .type(t.getType())
                                           .userInputtedRate(t.isUserInputtedRate())
                                           .build();
  }

}
