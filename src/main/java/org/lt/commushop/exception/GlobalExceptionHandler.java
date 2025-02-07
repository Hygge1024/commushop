package org.lt.commushop.exception;

import org.lt.commushop.common.Result;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理类
 * 自动拦截所有Controller抛出的异常
 */

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(DuplicateProductException.class)
    public Result<Object> handleDuplicateProductException(DuplicateProductException e) {
        return Result.error(e.getMessage());
    }

    @ExceptionHandler(BusinessException.class)
    public Result<Object> handleBusinessException(BusinessException e) {
        return Result.error(e.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public Result<Object> handleRuntimeException(RuntimeException e) {
        return Result.error("操作失败：" + e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public Result<Object> handleException(Exception e) {
        return Result.error("服务器内部错误：" + e.getMessage());
    }
}

