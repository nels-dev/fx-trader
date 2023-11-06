package com.github.nelsdev.fxassist.portfolio.service;

import com.github.nelsdev.fxassist.common.exception.ResourceNotFoundException;
import com.github.nelsdev.fxassist.common.types.Currency;
import com.github.nelsdev.fxassist.portfolio.dto.CreatePortfolioRequest;
import com.github.nelsdev.fxassist.portfolio.dto.PortfolioResponse;
import com.github.nelsdev.fxassist.portfolio.entity.UserPortfolio;
import com.github.nelsdev.fxassist.portfolio.entity.UserPortfolio.Balance;
import com.github.nelsdev.fxassist.portfolio.entity.UserPortfolio.CashFlow;
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
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
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
    portfolio.setActive(true);
    portfolio.setUserId(userId);
    portfolio
        .getCashFlow()
        .add(
            new CashFlow(Instant.now(), BigDecimal.ZERO, request.getAmount(), request.getAmount()));
    portfolioRepository.save(portfolio);

  }

  public void depositToActivePortfolio(Currency currency, BigDecimal amount) {
    String userId = userService.getCurrentUser().getId();
    UserPortfolio userPortfolio =
        portfolioRepository
            .findByUserIdAndActive(userId, true)
            .orElseThrow(ResourceNotFoundException::new);
    BigDecimal totalValueBeforeCashFlow = getPortfolioTotalValueInBase(userPortfolio);
    // Add to currency balance
    Optional<Balance> curBalance =
        userPortfolio.getBalances().stream().filter(bal -> bal.getCurrency() == currency).findAny();
    if (curBalance.isPresent()) {
      curBalance.get().setAmount(curBalance.get().getAmount().add(amount));
    } else {
      userPortfolio.getBalances().add(new Balance(currency, amount));
    }

    // Add to total deposit
    BigDecimal totalValueAfterCashFlow = getPortfolioTotalValueInBase(userPortfolio);

    userPortfolio
        .getCashFlow()
        .add(
            new CashFlow(
                Instant.now(),
                totalValueBeforeCashFlow,
                totalValueAfterCashFlow,
                totalValueAfterCashFlow.subtract(totalValueBeforeCashFlow)));
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
    BigDecimal totalValueBeforeCashFlow = getPortfolioTotalValueInBase(userPortfolio);
    curBalance.setAmount(curBalance.getAmount().subtract(amount));

    // Add to total withdrawal
    BigDecimal totalValueAfterCashFlow = getPortfolioTotalValueInBase(userPortfolio);
    userPortfolio
        .getCashFlow()
        .add(
            new CashFlow(
                Instant.now(),
                totalValueBeforeCashFlow,
                totalValueAfterCashFlow,
                totalValueAfterCashFlow.subtract(totalValueBeforeCashFlow)));
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

    final BigDecimal balanceInBase = getPortfolioTotalValueInBase(userPortfolio);
    final BigDecimal percentageChange =
        holdingPeriodReturn(userPortfolio.getCashFlow(), balanceInBase).subtract(BigDecimal.ONE);
    var balancesMap =
        userPortfolio.getBalances().stream()
            .collect(Collectors.toMap(Balance::getCurrency, Balance::getAmount));
    return PortfolioResponse.builder()
        .baseCurrency(userPortfolio.getBaseCurrency())
        .createdAt(userPortfolio.getCreatedAt().atOffset(ZoneOffset.UTC))
        .balanceInBaseCurrency(balanceInBase)
        .percentageChange(percentageChange)
        .balances(balancesMap)
        .allowedCurrencies(Set.of(Currency.values()))
        .build();
  }

  BigDecimal holdingPeriodReturn(List<CashFlow> cashFlows, BigDecimal periodEndValue) {
    if (cashFlows.isEmpty()) {
      return BigDecimal.ONE;
    } else {
      CashFlow lastCf = cashFlows.get(cashFlows.size() - 1);
      BigDecimal lastPeriodReturn =
          periodEndValue
              .subtract(lastCf.getPostCashFlowValue())
              .divide(lastCf.getPostCashFlowValue(), 4, RoundingMode.HALF_UP)
              .add(BigDecimal.ONE);
      log.info(
          "Period start: {}, Period end: {}, percentage: {}",
          lastCf.getPostCashFlowValue(),
          periodEndValue,
          lastPeriodReturn);
      return holdingPeriodReturn(
              cashFlows.subList(0, cashFlows.size() - 1), lastCf.getPreCashFlowValue())
          .multiply(lastPeriodReturn);
    }
  }

  private BigDecimal getPortfolioTotalValueInBase(UserPortfolio userPortfolio) {
    return userPortfolio.getBalances().stream()
        .map(
            balance ->
                rateService.convert(
                    balance.getCurrency(), userPortfolio.getBaseCurrency(), balance.getAmount()))
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }
}
