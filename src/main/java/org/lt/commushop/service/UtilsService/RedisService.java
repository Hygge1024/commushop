package org.lt.commushop.service.UtilsService;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class RedisService {
    @Resource
    private RedisTemplate<String, List<Map<String, String>>> redisTemplate;

    /**
     * 存储用户上下文-覆盖操作
     */
    public void saveUserContext(String username, List<Map<String, String>> context) {
        String key = "chat:context:" + username;
        redisTemplate.opsForValue().set(key, context);//永久保存
//        redisTemplate.opsForValue().set(key, context, 24, TimeUnit.HOURS); // 保存24小时
    }

    /**
     * 获取用户上下文
     */
    public List<Map<String, String>> getUserContext(String username) {
        String key = "chat:context:" + username;
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * 删除用户上下文
     */
    public void deleteUserContext(String username) {
        String key = "chat:context:" + username;
        redisTemplate.delete(key);
    }
}
