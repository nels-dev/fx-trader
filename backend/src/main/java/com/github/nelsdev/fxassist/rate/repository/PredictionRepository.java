package com.github.nelsdev.fxassist.rate.repository;

import com.github.nelsdev.fxassist.common.types.Currency;
import com.github.nelsdev.fxassist.rate.entity.Prediction;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PredictionRepository extends MongoRepository<Prediction, String> {

  Optional<Prediction> findFirstByCurrencyOrderByDateDesc(Currency currency);
}
