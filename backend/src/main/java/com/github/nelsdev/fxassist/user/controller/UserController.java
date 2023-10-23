package com.github.nelsdev.fxassist.user.controller;

import com.github.nelsdev.fxassist.common.exception.ApplicationError;
import com.github.nelsdev.fxassist.user.dto.UserRegistrationRequest;
import com.github.nelsdev.fxassist.user.exception.UserAlreadyExistException;
import com.github.nelsdev.fxassist.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class UserController {

  private final UserService userService;

  @PostMapping("/user")
  public void register(@RequestBody UserRegistrationRequest request) {
    userService.register(request);
  }

  @ExceptionHandler(UserAlreadyExistException.class)
  public ResponseEntity<ApplicationError> handleUserAlreadyExist() {
    return ResponseEntity.status(HttpStatus.CONFLICT.value())
        .body(ApplicationError.builder().message("User already exist").build());
  }
}
