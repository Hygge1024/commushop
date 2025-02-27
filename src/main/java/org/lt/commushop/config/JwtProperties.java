package org.lt.commushop.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    /**
     * JWT密钥
     */
    private String secret = "commushop-jwt-secret-key-must-be-at-least-32-bytes";
    
    /**
     * Token过期时间（默认24小时）
     */
    private long expiration = 86400000;
    
    /**
     * Token前缀
     */
    private String tokenPrefix = "Bearer ";
    
    /**
     * 存放Token的Header Key
     */
    private String headerKey = "Authorization";
    /**
     * RefreshToken过期时间（默认7天）
     */
    private long refreshTokenExpiration = 604800000;

    /**
     * 服务启动时间戳，用于使服务重启后之前的token失效
     */
    private final long serviceStartTime = System.currentTimeMillis();

    /**
     * 获取服务启动时间戳
     */
    public long getServiceStartTime() {
        return serviceStartTime;
    }
}
