package com.github.nelsdev.fxassist.rate.repository;

import com.github.nelsdev.fxassist.common.types.Currency;
import com.github.nelsdev.fxassist.rate.entity.Quote;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface QuoteRepository extends MongoRepository<Quote, String> {

  Quote findByCurrency(Currency currency);

  List<Quote> findAllByCurrencyIsIn(List<Currency> currencies);
}
