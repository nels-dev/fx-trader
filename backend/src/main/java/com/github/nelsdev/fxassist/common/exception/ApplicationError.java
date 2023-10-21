package com.github.nelsdev.fxassist.common.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Value;

@Builder
@Value
@AllArgsConstructor
public class ApplicationError {
  String reason;
}
