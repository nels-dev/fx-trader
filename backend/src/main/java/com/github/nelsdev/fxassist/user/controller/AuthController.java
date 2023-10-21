package com.github.nelsdev.fxassist.user.controller;

import com.github.nelsdev.fxassist.user.dto.LoginRequest;
import com.github.nelsdev.fxassist.user.dto.LoginResponse;
import com.github.nelsdev.fxassist.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthController {

  private final UserService userService;
  @PostMapping("/login")
  public LoginResponse login(@RequestBody LoginRequest loginRequest){
    return userService.authenticate(loginRequest);
  }
}
