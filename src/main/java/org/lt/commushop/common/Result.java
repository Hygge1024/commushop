package org.lt.commushop.common;

import java.io.Serializable;
import org.lt.commushop.common.ResultCode;

public class Result<T> implements Serializable {
    private static final long serialVersionUID = 1L;
    /**
     * 状态码
     */
    private Integer code;

    /**
     * 消息
     */
    private String message;

    /**
     * 数据
     */
    private T data;

    /**
     * 是否成功
     */
    private Boolean success;

    /**
     * 时间戳
     */
    private Long timestamp;

    /**
     * 私有构造方法，禁止直接创建
     */
    private Result() {
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * 成功返回结果
     */
    public static <T> Result<T> success() {
        return success(null);// success(null, "操作成功");调用第二个success方法
    }

    /**
     * 成功返回结果
     * 
     * @param data 获取的数据
     */
    public static <T> Result<T> success(T data) {
        return success(data, "操作成功");// success(data, "操作成功");调用第三个success方法
    }

    /**
     * 成功返回结果
     * 
     * @param data    获取的数据
     * @param message 提示信息
     */
    public static <T> Result<T> success(T data, String message) {
        Result<T> result = new Result<>();
        result.setCode(ResultCode.SUCCESS.getCode());
        result.setMessage(message);
        result.setData(data);
        result.setSuccess(true);
        return result;
    }

    /**
     * 失败返回结果
     */
    public static <T> Result<T> error() {
        return error(ResultCode.ERROR.getMessage());
    }

    /**
     * 失败返回结果
     * 
     * @param message 提示信息
     */
    public static <T> Result<T> error(String message) {
        return error(message, ResultCode.ERROR.getCode());
    }

    /**
     * 失败返回结果
     * 
     * @param message 提示信息
     * @param code    错误码
     */
    public static <T> Result<T> error(String message, Integer code) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        result.setSuccess(false);
        return result;
    }

    /**
     * 失败返回结果
     * 
     * @param resultCode 错误码
     */
    public static <T> Result<T> error(ResultCode resultCode) {
        Result<T> result = new Result<>();
        result.setCode(resultCode.getCode());
        result.setMessage(resultCode.getMessage());
        result.setSuccess(false);
        return result;
    }

    /**
     * 参数验证失败返回结果
     */
    public static <T> Result<T> validateFailed() {
        return error(ResultCode.VALIDATE_FAILED);
    }

    /**
     * 参数验证失败返回结果
     * 
     * @param message 提示信息
     */
    public static <T> Result<T> validateFailed(String message) {
        return error(message, ResultCode.VALIDATE_FAILED.getCode());
    }

    /**
     * 未登录返回结果
     */
    public static <T> Result<T> unauthorized() {
        return error(ResultCode.UNAUTHORIZED);
    }

    /**
     * 未授权返回结果
     */
    public static <T> Result<T> forbidden() {
        return error(ResultCode.FORBIDDEN);
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setData(T data) {
        this.data = data;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    public Integer getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

    public Boolean getSuccess() {
        return success;
    }

    public Long getTimestamp() {
        return timestamp;
    }
}
