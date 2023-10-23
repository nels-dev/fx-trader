package com.github.nelsdev.fxassist.transaction.controller;

import com.github.nelsdev.fxassist.transaction.dto.DepositRequest;
import com.github.nelsdev.fxassist.transaction.dto.TradeRequest;
import com.github.nelsdev.fxassist.transaction.dto.TransactionsResponse;
import com.github.nelsdev.fxassist.transaction.dto.WithdrawRequest;
import com.github.nelsdev.fxassist.transaction.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/transactions")
public class TransactionController {

  private final TransactionService transactionService;

  @GetMapping
  public TransactionsResponse getTransactions() {
    return transactionService.getUserTransactions();
  }

  @PostMapping("/deposit")
  public void deposit(@RequestBody @Valid DepositRequest depositRequest) {
    transactionService.deposit(depositRequest);
  }

  @PostMapping("/withdrawal")
  public void deposit(@RequestBody @Valid WithdrawRequest withdrawRequest) {
    transactionService.withdraw(withdrawRequest);
  }

  @PostMapping("/trade")
  public void deposit(@RequestBody @Valid TradeRequest tradeRequest) {
    transactionService.trade(tradeRequest);
  }
}
