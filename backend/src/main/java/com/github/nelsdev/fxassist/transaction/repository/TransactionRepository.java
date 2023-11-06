package com.github.nelsdev.fxassist.transaction.repository;

import com.github.nelsdev.fxassist.transaction.entity.Transaction;
import com.github.nelsdev.fxassist.transaction.entity.Transaction.TransactionType;
import java.util.List;
import java.util.Set;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TransactionRepository extends MongoRepository<Transaction, String> {

  List<Transaction> findAllByUserIdAndTypeInOrderByCreatedAtDesc(String userId, Set<TransactionType> types);
}
