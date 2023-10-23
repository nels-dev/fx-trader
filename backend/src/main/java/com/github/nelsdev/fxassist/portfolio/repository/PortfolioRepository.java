package com.github.nelsdev.fxassist.portfolio.repository;

import com.github.nelsdev.fxassist.portfolio.entity.UserPortfolio;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PortfolioRepository extends MongoRepository<UserPortfolio, String> {

  Optional<UserPortfolio> findByUserIdAndActive(String userId, boolean active);
}
