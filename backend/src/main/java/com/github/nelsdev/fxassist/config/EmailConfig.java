package com.github.nelsdev.fxassist.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@ConfigurationProperties(prefix = "email")
@Configuration
@Data
public class EmailConfig {

  private String apiKey;
  private String sender;
}
