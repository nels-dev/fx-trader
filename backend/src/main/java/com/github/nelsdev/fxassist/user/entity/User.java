package com.github.nelsdev.fxassist.user.entity;

import java.util.UUID;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("users")
@Data
public class User {
  @Id
  private String id;
  private String username;
  private String password;
  private String email;
  private String firstName;
  private String lastName;
}
