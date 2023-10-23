package com.github.nelsdev.fxassist.transaction.repository;

import com.github.nelsdev.fxassist.transaction.entity.Transaction;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TransactionRepository extends MongoRepository<Transaction, String> {

  List<Transaction> findAllByUserIdOrderByCreatedAtDesc(String userId);
}
