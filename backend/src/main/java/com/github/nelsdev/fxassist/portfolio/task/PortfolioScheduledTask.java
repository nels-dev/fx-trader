package com.github.nelsdev.fxassist.portfolio.task;

import com.github.nelsdev.fxassist.portfolio.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component()
@Slf4j
@RequiredArgsConstructor
public class PortfolioScheduledTask {
  private final PortfolioService portfolioService;

  /**
   * For fast prototyping purpose it is implemented as a standalone scheduled job, not scalable when
   * multiple instances come into play
   */
  @Scheduled(cron = "5 0 * * * *")
  public void takePortfolioSnapshot() {
    portfolioService.takeSnapshotForAllActivePortfolio();
  }
}
