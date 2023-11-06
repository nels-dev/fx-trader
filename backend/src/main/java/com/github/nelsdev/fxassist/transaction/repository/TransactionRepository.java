package com.github.nelsdev.fxassist.transaction.repository;

import com.github.nelsdev.fxassist.transaction.entity.Transaction;
import com.github.nelsdev.fxassist.transaction.entity.Transaction.TransactionType;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TransactionRepository extends MongoRepository<Transaction, String> {

  default List<Transaction> getTransfers(String userId, Instant from) {
    return findAllByUserIdAndTypeInAndCreatedAtAfterOrderByCreatedAtDesc(
        userId, Set.of(TransactionType.DEPOSIT, TransactionType.WITHDRAWAL), from);
  }

  default List<Transaction> getTrades(String userId, Instant from) {
    return findAllByUserIdAndTypeInAndCreatedAtAfterOrderByCreatedAtDesc(
        userId, Set.of(TransactionType.TRADE), from);
  }

  List<Transaction> findAllByUserIdAndTypeInAndCreatedAtAfterOrderByCreatedAtDesc(
      String userId, Set<TransactionType> types, Instant from);
}
