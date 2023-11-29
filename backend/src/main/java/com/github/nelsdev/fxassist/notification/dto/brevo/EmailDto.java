package com.github.nelsdev.fxassist.notification.dto.brevo;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class EmailDto {

  Party sender;
  List<Party> to;

  String subject;
  String htmlContent;

  @AllArgsConstructor
  @Value
  public static class Party {
    String name;
    String email;
  }
}
