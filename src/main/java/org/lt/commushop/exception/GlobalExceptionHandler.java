package org.lt.commushop.exception;

import org.lt.commushop.common.Result;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(DuplicateProductException.class)
    public Result<Object> handleDuplicateProductException(DuplicateProductException e) {
        return Result.error(e.getMessage());
    }
}
