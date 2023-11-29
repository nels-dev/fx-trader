package com.github.nelsdev.fxassist.notification.controller;

import com.github.nelsdev.fxassist.notification.dto.AddNotificationRuleRequest;
import com.github.nelsdev.fxassist.notification.dto.NotificationRulesResponse;
import com.github.nelsdev.fxassist.notification.service.NotificationRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

  private final NotificationRuleService notificationRuleService;

  @GetMapping
  public NotificationRulesResponse getRules() {
    return notificationRuleService.getAllRulesByUser();
  }

  @PostMapping
  public void addRule(@RequestBody AddNotificationRuleRequest request) {
    notificationRuleService.addRule(request);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable String id) {
    notificationRuleService.deleteRule(id);
  }
}
