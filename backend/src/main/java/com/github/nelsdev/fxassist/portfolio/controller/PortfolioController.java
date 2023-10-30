package com.github.nelsdev.fxassist.portfolio.controller;

import com.github.nelsdev.fxassist.common.exception.ApplicationError;
import com.github.nelsdev.fxassist.common.types.Currency;
import com.github.nelsdev.fxassist.portfolio.dto.CreatePortfolioRequest;
import com.github.nelsdev.fxassist.portfolio.dto.PortfolioResponse;
import com.github.nelsdev.fxassist.portfolio.exception.ActivePortfolioExistException;
import com.github.nelsdev.fxassist.portfolio.service.PortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

  private final PortfolioService service;

  @PostMapping
  public void createPortfolio(@RequestBody @Valid CreatePortfolioRequest request) {
    service.createPortfolio(request);
  }

  @GetMapping
  public PortfolioResponse getPortfolio() {
    return service.getPortfolio();
  }

  @GetMapping("/allowed-currencies")
  public Currency[] getAllowableCurrencies(){
    return Currency.values();
  }

  @ExceptionHandler(ActivePortfolioExistException.class)
  public ResponseEntity<ApplicationError> handleActivePortfolioExist() {
    return ResponseEntity.status(HttpStatus.CONFLICT.value())
        .body(ApplicationError.builder().message("You already have an active portfolio").build());
  }
}
