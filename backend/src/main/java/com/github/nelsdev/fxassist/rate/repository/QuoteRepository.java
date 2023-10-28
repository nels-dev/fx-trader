package com.github.nelsdev.fxassist.rate.repository;

import com.github.nelsdev.fxassist.common.types.Currency;
import com.github.nelsdev.fxassist.rate.entity.Quote;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface QuoteRepository extends MongoRepository<Quote, String> {

  Quote findByCurrency(Currency currency);
}
