package com.github.nelsdev.fxassist.user.dto;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class LoginResponse {
  boolean success;
  String lastName;
  String accessToken;
}
