package org.lt.commushop.service.UtilsService;

import lombok.extern.slf4j.Slf4j;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.entity.User;
import org.lt.commushop.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ChatService {
    @Autowired
    private DeepSeekService deepSeekService;
    @Autowired
    private RedisService redisService;
    @Autowired
    private CozeService cozeService;
    @Autowired
    private IntentClassifierService intentClassifierService;
    @Autowired
    private QueryExecutorService queryExecutorService;
    @Autowired
    private IUserService userService;

    @Value("${chat.service.type:deepseek}")
    private String chatServiceType;

    /**
     * 获取用户的对话历史
     */
    public Result<List<Map<String, String>>> getChatHistory(String username) {
        List<Map<String, String>> history = redisService.getUserContext(username);
        if (history == null || history.isEmpty()) {
            return Result.error("暂无对话记录");
        }
        return Result.success(history);
    }

    /**
     * 处理用户消息并生成AI回复
     */
    public Result<String> handleUserMessage(String username, String userMessage) {
        // 获取用户上下文
        List<Map<String, String>> context = redisService.getUserContext(username);

        if (context == null) {
            context = new ArrayList<>();
        }
        
        // 保存用户消息到上下文
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        context.add(userMsg);
        
        // 通过username获取userId
        Integer userId = null;
        try {
            User user = userService.getUserName(username);
            if (user != null) {
                userId = user.getUserId();
                log.info("获取到用户ID: {}, 用户名: {}", userId, username);
            }
        } catch (Exception e) {
            log.warn("获取用户ID失败: {}", e.getMessage());
            // 继续处理，userId为null时将无法执行特定用户的数据库查询
        }
        
        // 首先进行意图识别
        Map<String, Object> intentResult = intentClassifierService.classifyIntent(userMessage);
        String intentType = (String) intentResult.get("intentType");
        Map<String, String> params = (Map<String, String>) intentResult.get("params");
        
        // 如果是特定查询意图，执行数据库查询
        String aiResponse = null;
        if (!"general_query".equals(intentType)) {
            aiResponse = queryExecutorService.executeQuery(intentType, params, userId);
        }
        
        // 如果数据库查询无法处理或返回null，则调用AI模型
        if (aiResponse == null) {
            // 调用大模型 API 生成回复
            if ("coze".equalsIgnoreCase(chatServiceType)) {
                aiResponse = cozeService.getAiResponse(userMessage, username);
            } else {
                aiResponse = deepSeekService.getAiResponse(userMessage, context);
            }
        }

        if (aiResponse != null) {
            // 保存AI回复
            Map<String, String> assistantMsg = new HashMap<>();
            assistantMsg.put("role", "assistant");
            assistantMsg.put("content", aiResponse);
            context.add(assistantMsg);

            // 更新用户上下文
            redisService.saveUserContext(username, context);
            return Result.success("对话成功", aiResponse);
        } else {
            // 移除之前添加的用户消息
            context.remove(context.size() - 1);
            return Result.error("对话失败");
        }
    }

    /**
     * 处理流式消息(暂时没调用)
     */
    public void handleReasonerMessageStream(String username, String message, SseEmitter emitter) {
        try {
            // 获取历史上下文
            List<Map<String, String>> context = redisService.getUserContext(username);
            if (context == null) {
                context = new ArrayList<>();
            }

            // 调用 DeepSeek Reasoner API 并处理流式响应
            deepSeekService.getReasonerResponseStream(message, context, emitter);

            // 更新上下文
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", message);
            context.add(userMessage);

            // 保存更新后的上下文
            redisService.saveUserContext(username, context);

        } catch (Exception e) {
            log.error("Stream chat error:", e);
            try {
                emitter.send(SseEmitter.event()
                        .data(Result.error("处理消息时出错：" + e.getMessage()))
                        .id("error"));
            } catch (IOException ex) {
                log.error("Error sending error message:", ex);
            } finally {
                emitter.complete();
            }
        }
    }
}
