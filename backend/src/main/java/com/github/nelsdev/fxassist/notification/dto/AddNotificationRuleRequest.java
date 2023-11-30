package com.github.nelsdev.fxassist.notification.dto;

import com.github.nelsdev.fxassist.common.types.Currency;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Builder
@Jacksonized
@Value
public class AddNotificationRuleRequest {

  Currency buyCurrency;
  Currency sellCurrency;
  String targetType;
  BigDecimal target;
  BigDecimal reactivate;
  boolean oneTime;
}
