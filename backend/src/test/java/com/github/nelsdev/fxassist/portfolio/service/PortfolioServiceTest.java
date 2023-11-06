package com.github.nelsdev.fxassist.portfolio.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import com.github.nelsdev.fxassist.portfolio.entity.UserPortfolio.CashFlow;
import com.github.nelsdev.fxassist.portfolio.repository.PortfolioRepository;
import com.github.nelsdev.fxassist.rate.service.RateService;
import com.github.nelsdev.fxassist.user.service.UserService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

class PortfolioServiceTest {

  @Mock PortfolioRepository portfolioRepository;
  @Mock UserService userService;

  @Mock RateService rateService;

  private PortfolioService portfolioService;

  @BeforeEach
  void setup() {
    portfolioService = new PortfolioService(portfolioRepository, userService, rateService);
  }

  @Test
  void holdingPeriodReturn() {
    // Example from https://www.fool.com/about/how-to-calculate-investment-returns/
    List<CashFlow> cashFlows =
        List.of(
            new CashFlow(null, new BigDecimal(0), new BigDecimal(20300), new BigDecimal(20300)),
            new CashFlow(null, new BigDecimal(21773), new BigDecimal(22273), new BigDecimal(500)),
            new CashFlow(null, new BigDecimal(23937), new BigDecimal(24437), new BigDecimal(500)),
            new CashFlow(null, new BigDecimal(22823), new BigDecimal(22573), new BigDecimal(-250)),
            new CashFlow(null, new BigDecimal(24518), new BigDecimal(25018), new BigDecimal(500)));
    BigDecimal hpr =
        portfolioService
            .holdingPeriodReturn(cashFlows, new BigDecimal(25992))
            .subtract(BigDecimal.ONE);
    assertThat(hpr.setScale(4, RoundingMode.HALF_UP)).isEqualByComparingTo("0.2149");
  }
}
