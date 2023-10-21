package com.github.nelsdev.fxassist.user.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserRegistrationRequest {

  String firstName;
  String lastName;
  String userName;
  String email;
  String password;
}
