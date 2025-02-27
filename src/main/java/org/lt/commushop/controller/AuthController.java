package org.lt.commushop.controller;

import org.lt.commushop.utils.JwtTokenUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

/**
 * 认证相关的控制器
 * 处理token刷新等认证相关请求
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Resource
    private JwtTokenUtil jwtTokenUtil;
    
    /**
     * 刷新访问令牌
     * 使用refreshToken获取新的accessToken
     *
     * @param request 包含refreshToken的请求体
     * @return 新的accessToken或错误信息
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body(createErrorResponse("Refresh token is required"));
        }
        
        // 验证refreshToken并生成新的accessToken
        String newAccessToken = jwtTokenUtil.generateNewAccessTokenFromRefreshToken(refreshToken);
        if (newAccessToken == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid or expired refresh token"));
        }
        
        return ResponseEntity.ok(createSuccessResponse(newAccessToken));
    }
    
    /**
     * 创建成功响应
     */
    private Map<String, Object> createSuccessResponse(String newAccessToken) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("code", 200);
        
        Map<String, Object> data = new HashMap<>();
        data.put("token", newAccessToken);
        data.put("message", "Token refreshed successfully");
        
        response.put("data", data);
        return response;
    }
    
    /**
     * 创建错误响应
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("code", 401);
        response.put("message", message);
        return response;
    }
}