package com.github.nelsdev.fxassist.rate.controller;

import com.github.nelsdev.fxassist.common.types.Currency;
import com.github.nelsdev.fxassist.rate.dto.QuoteResponse;
import com.github.nelsdev.fxassist.rate.entity.Quote;
import com.github.nelsdev.fxassist.rate.service.RateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
public class QuotesController {

  private final RateService rateService;
  @GetMapping("/{from}_{to}")
  public QuoteResponse getQuote(@PathVariable Currency from, @PathVariable Currency to){
      return rateService.getQuote(from, to);
  }
}
