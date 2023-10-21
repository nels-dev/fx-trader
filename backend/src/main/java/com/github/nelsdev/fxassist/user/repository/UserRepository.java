package com.github.nelsdev.fxassist.user.repository;

import com.github.nelsdev.fxassist.user.entity.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface UserRepository extends MongoRepository<User, UUID> {

  Optional<User> findByEmail(String email);

  boolean existsByUsernameAndEmail(String userName, String email);
}
