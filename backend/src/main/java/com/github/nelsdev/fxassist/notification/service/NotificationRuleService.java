package com.github.nelsdev.fxassist.notification.service;

import com.github.nelsdev.fxassist.common.exception.ResourceNotFoundException;
import com.github.nelsdev.fxassist.notification.dto.AddNotificationRuleRequest;
import com.github.nelsdev.fxassist.notification.dto.NotificationRulesResponse;
import com.github.nelsdev.fxassist.notification.dto.brevo.CreateContactRequest;
import com.github.nelsdev.fxassist.notification.dto.brevo.EmailDto;
import com.github.nelsdev.fxassist.notification.dto.brevo.EmailDto.Party;
import com.github.nelsdev.fxassist.notification.entity.NotificationRule;
import com.github.nelsdev.fxassist.notification.entity.NotificationRule.TargetType;
import com.github.nelsdev.fxassist.notification.repository.NotificationRuleRepository;
import com.github.nelsdev.fxassist.rate.dto.QuoteResponse;
import com.github.nelsdev.fxassist.rate.service.RateService;
import com.github.nelsdev.fxassist.user.entity.User;
import com.github.nelsdev.fxassist.user.service.UserService;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationRuleService {

  private final NotificationRuleRepository repository;
  private final UserService userService;
  private final RateService rateService;
  private final BrevoApiClient emailClient;

  public void addRule(AddNotificationRuleRequest request) {
    String userId = userService.getCurrentUser().getId();
    NotificationRule rule = new NotificationRule();
    rule.setBuyCurrency(request.getBuyCurrency());
    rule.setSellCurrency(request.getSellCurrency());
    rule.setReactivate(request.getReactivate());
    rule.setTarget(request.getTarget());
    rule.setTargetType(TargetType.valueOf(request.getTargetType().toUpperCase()));
    rule.setActive(true);
    rule.setCreatedAt(Instant.now());
    rule.setUserId(userId);
    rule.setTimesTriggered(0);
    repository.save(rule);
  }

  public void deleteRule(String id) {
    String userId = userService.getCurrentUser().getId();
    var toBeDeleted =
        repository
            .findById(id)
            .filter(rule -> rule.getUserId().equals(userId))
            .orElseThrow(ResourceNotFoundException::new);
    repository.delete(toBeDeleted);
  }

  public NotificationRulesResponse getAllRulesByUser() {
    String userId = userService.getCurrentUser().getId();
    List<NotificationRulesResponse.NotificationRuleDto> rules =
        repository.findByUserId(userId).stream()
            .map(
                rule ->
                    NotificationRulesResponse.NotificationRuleDto.builder()
                        .id(rule.getId())
                        .buyCurrency(rule.getBuyCurrency())
                        .sellCurrency(rule.getSellCurrency())
                        .createdAt(rule.getCreatedAt().atOffset(ZoneOffset.UTC))
                        .active(rule.isActive())
                        .reactivate(rule.getReactivate())
                        .target(rule.getTarget())
                        .lastTriggeredAt(
                            Optional.ofNullable(rule.getLastTriggeredAt())
                                .map(time -> time.atOffset(ZoneOffset.UTC))
                                .orElse(null))
                        .targetType(rule.getTargetType().getCodeValue())
                        .timesTriggered(rule.getTimesTriggered())
                        .build())
            .toList();

    return NotificationRulesResponse.builder().rules(rules).build();
  }

  public void sendNotification() {
    repository.findAll().forEach(this::handleNotificationRule);
  }

  private void handleNotificationRule(NotificationRule rule) {
    try {
      if (rule.isActive()) {
        QuoteResponse quote = rateService.getQuote(rule.getSellCurrency(), rule.getBuyCurrency());
        if (rule.getTargetType() == TargetType.UPPER) {
          // reactivate when actual falls below threshold
          if (quote.getRate().compareTo(rule.getTarget()) >= 0) notify(rule, quote);
        } else {
          // reactivate when actual rise above threshold
          if (quote.getRate().compareTo(rule.getTarget()) <= 0) notify(rule, quote);
        }
      } else {
        reactivateRule(rule);
      }
    } catch (Exception e) {
      log.error("Unable to process rule" + rule.getId(), e);
    }
  }

  private void notify(NotificationRule rule, QuoteResponse quote) {
    User user = userService.getById(rule.getUserId());
    EmailDto dto =
        EmailDto.builder()
            .sender(new Party("FXAssist", "fxassist.csis4495@gmail.com"))
            .to(List.of(new Party(user.getFirstName(), user.getEmail())))
            .subject(
                String.format(
                    "FXAssist: %s/%s %s %s",
                    rule.getBuyCurrency(),
                    rule.getSellCurrency(),
                    rule.getTargetType() == TargetType.UPPER ? "above" : "below",
                    rule.getTarget().toPlainString()))
            .htmlContent(
                String.format(
                    """
          <html>
            <body>
               <h1>Price notification</h1>
               <p>Hi %s, This is a notification sent by FXAssist platform.</p>
               <p>
                Currency Pair: <strong>%s/%s</strong><br/>
                Current Price: <strong>%s</strong>
                Your Target Price: <strong>%s</strong>
               </p>
               <p>
                The notification rule is now deactivated and will be reactivated when the price reaches %s
                
               </p>
               <p>Thank you for using FXAssist!</p>
               <hr/>
            </body>
          <html>

         """,
                    user.getFirstName(),
                    rule.getBuyCurrency(),
                    rule.getSellCurrency(),
                    quote.getRate().setScale(4, RoundingMode.HALF_UP).toPlainString(),
                    rule.getTarget().setScale(4, RoundingMode.HALF_UP).toPlainString(),
                    rule.getReactivate().setScale(4, RoundingMode.HALF_UP).toPlainString()))
            .build();
    if (!user.isEmailRegisteredWithBrevo()) {
      emailClient.registerContact(
          CreateContactRequest.builder()
              .email(user.getEmail())
              .listIds(List.of(2)) // Default list
              .attributes(
                  Map.of(
                      "FIRSTNAME", user.getFirstName(),
                      "LASTNAME", user.getLastName(),
                      "EMAIL", user.getEmail()))
              .extId(user.getId())
              .build());
      user.setEmailRegisteredWithBrevo(true);
      userService.saveUser(user);
    }
    emailClient.sendEmail(dto);
    rule.setActive(false);
    rule.setTimesTriggered(rule.getTimesTriggered() + 1);
    rule.setLastTriggeredAt(Instant.now());
    repository.save(rule);
  }

  private void reactivateRule(NotificationRule rule) {
    QuoteResponse quote = rateService.getQuote(rule.getSellCurrency(), rule.getBuyCurrency());
    if (rule.getTargetType() == TargetType.UPPER) {
      // reactivate when actual falls below threshold
      if (quote.getRate().compareTo(rule.getReactivate()) < 0) rule.setActive(true);
    } else {
      // reactivate when actual rise above threshold
      if (quote.getRate().compareTo(rule.getReactivate()) > 0) rule.setActive(true);
    }
    repository.save(rule);
  }
}
