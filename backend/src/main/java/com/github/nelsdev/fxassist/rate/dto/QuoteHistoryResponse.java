package com.github.nelsdev.fxassist.rate.dto;

import com.github.nelsdev.fxassist.rate.entity.QuoteHistory;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class QuoteHistoryResponse {

  List<QuoteHistory> quoteHistory;

  @AllArgsConstructor
  @Value
  public static class QuoteHistory {
    Instant updated;
    BigDecimal rate;
  }
}
