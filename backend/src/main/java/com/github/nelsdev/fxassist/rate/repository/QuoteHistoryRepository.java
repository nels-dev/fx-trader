package com.github.nelsdev.fxassist.rate.repository;

import com.github.nelsdev.fxassist.common.types.Currency;
import com.github.nelsdev.fxassist.rate.entity.QuoteHistory;
import java.time.Instant;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface QuoteHistoryRepository extends MongoRepository<QuoteHistory, String> {
  @Query(
      value = "{updated: {$gt: ?0}}",
      fields = "{updated: 1, rates:  {$elemMatch:  {currency: ?1}}}",
      sort = "{updated: -1}")
  List<QuoteHistory> getHistoryForCurrency(Instant instant, Currency currency);
}
