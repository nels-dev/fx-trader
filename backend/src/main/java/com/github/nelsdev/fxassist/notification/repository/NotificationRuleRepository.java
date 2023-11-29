package com.github.nelsdev.fxassist.notification.repository;

import com.github.nelsdev.fxassist.notification.entity.NotificationRule;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRuleRepository extends MongoRepository<NotificationRule, String> {

  List<NotificationRule> findByUserId(String userId);
}
