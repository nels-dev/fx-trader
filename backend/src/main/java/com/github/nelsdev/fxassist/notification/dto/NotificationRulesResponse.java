package com.github.nelsdev.fxassist.notification.dto;

import com.github.nelsdev.fxassist.common.types.Currency;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class NotificationRulesResponse {

  List<NotificationRuleDto> rules;

  @Builder
  @Value
  public static class NotificationRuleDto {
    String id;
    Currency buyCurrency;
    Currency sellCurrency;
    String targetType;
    BigDecimal target;
    BigDecimal reactivate;
    OffsetDateTime createdAt;
    OffsetDateTime lastTriggeredAt;
    Integer timesTriggered;
    boolean active;
    boolean oneTime;
  }
}
