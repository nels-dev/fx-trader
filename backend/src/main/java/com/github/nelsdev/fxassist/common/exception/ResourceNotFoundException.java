package com.github.nelsdev.fxassist.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "Requested resources cannot be found")
public class ResourceNotFoundException extends ApplicationException {}
