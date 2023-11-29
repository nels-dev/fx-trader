package com.github.nelsdev.fxassist.notification.task;

import com.github.nelsdev.fxassist.notification.service.NotificationRuleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Profile("!development")
@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationScheduledTask {
  private final NotificationRuleService notificationRuleService;

  /**
   * For fast prototyping purpose it is implemented as a standalone scheduled job, not scalable when
   * multiple instances come into play
   */
  @Scheduled(cron = "10 0 * * * *")
  public void sendNotification() {
    log.info("Job started");
    notificationRuleService.sendNotification();
  }
}
