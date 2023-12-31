package com.github.nelsdev.fxassist.user.service;

import com.github.nelsdev.fxassist.common.exception.ResourceNotFoundException;
import com.github.nelsdev.fxassist.config.JwtConfig;
import com.github.nelsdev.fxassist.user.dto.LoginRequest;
import com.github.nelsdev.fxassist.user.dto.LoginResponse;
import com.github.nelsdev.fxassist.user.dto.UserRegistrationRequest;
import com.github.nelsdev.fxassist.user.entity.User;
import com.github.nelsdev.fxassist.user.exception.UserAlreadyExistException;
import com.github.nelsdev.fxassist.user.repository.UserRepository;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.time.OffsetDateTime;
import java.util.Date;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {
  private final UserRepository userRepository;
  private final JwtConfig jwtConfig;
  private final PasswordEncoder passwordEncoder;

  @SneakyThrows
  public LoginResponse authenticate(LoginRequest loginRequest) {
    try {
      User user =
          userRepository
              .findByEmail(loginRequest.getEmail())
              .orElseThrow(() -> new UsernameNotFoundException("User not found"));

      if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
        throw new BadCredentialsException("Password not match");
      }

      JWTClaimsSet claimsSet =
          new JWTClaimsSet.Builder()
              .subject(user.getEmail())
              .issueTime(new Date())
              .expirationTime(Date.from(OffsetDateTime.now().plusDays(1).toInstant()))
              .build();
      SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claimsSet);
      signedJWT.sign(new MACSigner(jwtConfig.getSecretKey()));
      String accessToken = signedJWT.serialize();
      return LoginResponse.builder()
          .success(true)
          .firstName(user.getFirstName())
          .lastName(user.getLastName())
          .accessToken(accessToken)
          .build();
    } catch (AuthenticationException e) {
      // Failed authentication
      return LoginResponse.builder().success(false).build();
    }
  }

  public void register(UserRegistrationRequest request) throws UserAlreadyExistException {
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new UserAlreadyExistException();
    }

    User user = new User();
    user.setFirstName(request.getFirstName());
    user.setLastName(request.getLastName());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    userRepository.save(user);
  }

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
  }

  public void saveUser(User user) {
    userRepository.save(user);
  }

  public User getCurrentUser() {
    return userRepository
        .findByEmail(SecurityContextHolder.getContext().getAuthentication().getName())
        .orElse(null);
  }

  public User getById(String id) {
    return userRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
  }
}
