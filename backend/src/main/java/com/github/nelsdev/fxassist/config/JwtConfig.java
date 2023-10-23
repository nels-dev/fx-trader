package com.github.nelsdev.fxassist.config;

import java.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@ConfigurationProperties(prefix = "jwt")
@Configuration
@Data
public class JwtConfig {

  private String secret;

  public SecretKey getSecretKey() {
    byte[] decodedKey = Base64.getDecoder().decode(secret);
    return new SecretKeySpec(decodedKey, 0, decodedKey.length, "AES");
  }
}
