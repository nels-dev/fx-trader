package com.github.nelsdev.fxassist.portfolio.repository;

import com.github.nelsdev.fxassist.portfolio.entity.UserPortfolioSnapshot;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PortfolioSnapshotRepository
    extends MongoRepository<UserPortfolioSnapshot, String> {

  List<UserPortfolioSnapshot> findByUserIdAndPortfolioId(String userId, String portfolioId);
}
