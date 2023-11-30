package com.github.nelsdev.fxassist.notification.entity;

import com.github.nelsdev.fxassist.common.types.Currency;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Data;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("notification_rule")
public class NotificationRule {
  @Id private String id;
  private String userId;
  Currency buyCurrency;
  Currency sellCurrency;
  TargetType targetType;
  BigDecimal target;
  BigDecimal reactivate;
  Instant createdAt;
  Instant lastTriggeredAt;
  Integer timesTriggered;
  boolean active;
  boolean oneTime;

  @Getter
  public enum TargetType {
    UPPER("upper"),
    LOWER("lower");
    private final String codeValue;

    TargetType(String codeValue) {
      this.codeValue = codeValue;
    }
  }
}
