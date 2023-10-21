package com.github.nelsdev.fxassist.user.dto;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Builder
@Value
@Jacksonized
public class LoginRequest {
  String email;
  String password;
}
