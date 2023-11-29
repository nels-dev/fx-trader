package com.github.nelsdev.fxassist.notification.dto.brevo;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class CreateContactRequest {
  String email;

  @JsonProperty("ext_id")
  String extId;

  Map<String, String> attributes;
  boolean emailBlacklisted;
  boolean smsBlacklisted;
  boolean updateEnabled;
  List<Integer> listIds;
}
