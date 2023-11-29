package com.github.nelsdev.fxassist.notification.service;

import com.github.nelsdev.fxassist.config.EmailConfig;
import com.github.nelsdev.fxassist.notification.dto.brevo.CreateContactRequest;
import com.github.nelsdev.fxassist.notification.dto.brevo.EmailDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class BrevoApiClient {

  private final RestClient restClient = RestClient.create();
  private final EmailConfig emailConfig;

  public void sendEmail(EmailDto email) {
    var response =
        restClient
            .post()
            .uri("https://api.brevo.com/v3/smtp/email")
            .header("api-key", emailConfig.getApiKey())
            .accept(MediaType.APPLICATION_JSON)
            .contentType(MediaType.APPLICATION_JSON)
            .body(email)
            .retrieve()
            .toEntity(String.class);
    log.info("Status:" + response.getStatusCode());
    log.info(response.getBody());
  }

  public void registerContact(CreateContactRequest request) {
    var response =
        restClient
            .post()
            .uri("https://api.brevo.com/v3/contacts")
            .header("api-key", emailConfig.getApiKey())
            .accept(MediaType.APPLICATION_JSON)
            .contentType(MediaType.APPLICATION_JSON)
            .body(request)
            .retrieve()
            .toEntity(String.class);
    log.info("Status:" + response.getStatusCode());
    log.info(response.getBody());
  }
}
