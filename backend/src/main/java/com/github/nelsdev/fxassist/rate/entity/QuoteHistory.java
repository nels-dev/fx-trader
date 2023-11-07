package com.github.nelsdev.fxassist.rate.entity;

import java.time.Instant;
import java.util.List;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("quotes_history")
@Data
public class QuoteHistory {
  @Id private String id;
  private Instant updated;
  private List<Quote> rates;
}
