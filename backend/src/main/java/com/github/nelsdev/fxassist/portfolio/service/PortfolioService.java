package com.github.nelsdev.fxassist.portfolio.service;

import com.github.nelsdev.fxassist.common.exception.ResourceNotFoundException;
import com.github.nelsdev.fxassist.common.types.Currency;
import com.github.nelsdev.fxassist.portfolio.dto.CreatePortfolioRequest;
import com.github.nelsdev.fxassist.portfolio.dto.PortfolioResponse;
import com.github.nelsdev.fxassist.portfolio.entity.UserPortfolio;
import com.github.nelsdev.fxassist.portfolio.entity.UserPortfolio.Balance;
import com.github.nelsdev.fxassist.portfolio.exception.ActivePortfolioExistException;
import com.github.nelsdev.fxassist.portfolio.repository.PortfolioRepository;
import com.github.nelsdev.fxassist.rate.service.RateService;
import com.github.nelsdev.fxassist.transaction.entity.Transaction;
import com.github.nelsdev.fxassist.transaction.exception.InsufficientBalanceException;
import com.github.nelsdev.fxassist.user.service.UserService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PortfolioService {
  private final PortfolioRepository portfolioRepository;
  private final UserService userService;
  private final RateService rateService;

  public void createPortfolio(CreatePortfolioRequest request) {
    String userId = userService.getCurrentUser().getId();
    if (portfolioRepository.findByUserIdAndActive(userId, true).isPresent()) {
      throw new ActivePortfolioExistException();
    }

    UserPortfolio portfolio = new UserPortfolio();
    portfolio.setCreatedAt(Instant.now());
    portfolio.setBaseCurrency(request.getCurrency());
    portfolio.setAmountDeposited(request.getAmount());
    portfolio.getBalances().add(new Balance(request.getCurrency(), request.getAmount()));
    portfolio.setActive(true);
    portfolio.setUserId(userId);
    portfolio.setAmountWithdrawn(BigDecimal.ZERO);
    portfolioRepository.save(portfolio);
  }

  public void depositToActivePortfolio(Currency currency, BigDecimal amount) {
    String userId = userService.getCurrentUser().getId();
    UserPortfolio userPortfolio =
        portfolioRepository
            .findByUserIdAndActive(userId, true)
            .orElseThrow(ResourceNotFoundException::new);

    // Add to currency balance
    Optional<Balance> curBalance =
        userPortfolio.getBalances().stream().filter(bal -> bal.getCurrency() == currency).findAny();
    if (curBalance.isPresent()) {
      curBalance.get().setAmount(curBalance.get().getAmount().add(amount));
    } else {
      userPortfolio.getBalances().add(new Balance(currency, amount));
    }

    // Add to total deposit
    BigDecimal amountInBase =
        rateService.convert(currency, userPortfolio.getBaseCurrency(), amount);
    userPortfolio.setAmountDeposited(userPortfolio.getAmountDeposited().add(amountInBase));
    portfolioRepository.save(userPortfolio);
  }

  public void withdrawFromActivePortfolio(Currency currency, BigDecimal amount) {
    String userId = userService.getCurrentUser().getId();
    UserPortfolio userPortfolio =
        portfolioRepository
            .findByUserIdAndActive(userId, true)
            .orElseThrow(ResourceNotFoundException::new);

    Balance curBalance =
        userPortfolio.getBalances().stream()
            .filter(bal -> bal.getCurrency() == currency)
            .filter(bal -> bal.getAmount().compareTo(amount) >= 0)
            .findFirst()
            .orElseThrow(InsufficientBalanceException::new);

    curBalance.setAmount(curBalance.getAmount().subtract(amount));

    // Add to total withdrawal
    BigDecimal amountInBase =
        rateService.convert(currency, userPortfolio.getBaseCurrency(), amount);
    userPortfolio.setAmountWithdrawn(userPortfolio.getAmountWithdrawn().add(amountInBase));
    portfolioRepository.save(userPortfolio);
  }

  public void recordTradeTransaction(Transaction transaction) {
    String userId = userService.getCurrentUser().getId();
    UserPortfolio userPortfolio =
        portfolioRepository
            .findByUserIdAndActive(userId, true)
            .orElseThrow(ResourceNotFoundException::new);

    Balance fromBalance = null;
    Balance toBalance = null;
    for (Balance bal : userPortfolio.getBalances()) {
      if (bal.getCurrency() == transaction.getFromCurrency()) {
        fromBalance = bal;
      }
      if (bal.getCurrency() == transaction.getToCurrency()) {
        toBalance = bal;
      }
    }

    if (fromBalance == null || fromBalance.getAmount().compareTo(transaction.getFromAmount()) < 0) {
      throw new InsufficientBalanceException();
    }

    if (toBalance == null) {
      toBalance = new Balance(transaction.getToCurrency(), BigDecimal.ZERO);
      userPortfolio.getBalances().add(toBalance);
    }

    fromBalance.setAmount(fromBalance.getAmount().subtract(transaction.getFromAmount()));
    toBalance.setAmount(toBalance.getAmount().add(transaction.getToAmount()));
    portfolioRepository.save(userPortfolio);
  }

  public PortfolioResponse getPortfolio() {
    String userId = userService.getCurrentUser().getId();
    UserPortfolio userPortfolio =
        portfolioRepository
            .findByUserIdAndActive(userId, true)
            .orElseThrow(ResourceNotFoundException::new);

    BigDecimal balanceInBase =
        userPortfolio.getBalances().stream()
            .map(
                balance ->
                    rateService.convert(
                        balance.getCurrency(),
                        userPortfolio.getBaseCurrency(),
                        balance.getAmount()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal totalDepositWithdrawal = userPortfolio.getAmountDeposited().add(userPortfolio.getAmountWithdrawn());
    BigDecimal percentageChange =
        balanceInBase
            .add(userPortfolio.getAmountWithdrawn())
            .subtract(totalDepositWithdrawal)
            .divide(totalDepositWithdrawal, 4, RoundingMode.HALF_UP);
    var balancesMap =
        userPortfolio.getBalances().stream()
            .collect(Collectors.toMap(Balance::getCurrency, Balance::getAmount));
    return PortfolioResponse.builder()
        .amountDeposited(userPortfolio.getAmountDeposited())
        .amountWithdrawn(userPortfolio.getAmountWithdrawn())
        .baseCurrency(userPortfolio.getBaseCurrency())
        .createdAt(userPortfolio.getCreatedAt().atOffset(ZoneOffset.UTC))
        .balanceInBaseCurrency(balanceInBase)
        .percentageChange(percentageChange)
        .balances(balancesMap)
        .allowedCurrencies(Set.of(Currency.values()))
                            .build();
  }
}
