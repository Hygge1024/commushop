package org.lt.commushop.service.UtilsService;

import lombok.extern.slf4j.Slf4j;
import org.lt.commushop.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
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

        // 格式化打印上下文内容
        // System.out.println("当前对话上下文：");
        // if (context != null) {
        // for (Map<String, String> message : context) {
        // System.out.println("角色: " + message.get("role"));
        // System.out.println("内容: " + message.get("content"));
        // System.out.println("-------------------");
        // }
        // }
        if (context == null) {
            context = new ArrayList<>();
        }
        // 调用DeepSeek API 生成回复
        String aiResponse = deepSeekService.getAiResponse(userMessage, context);

        if (aiResponse != null) {
            // 保存用户消息
            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", userMessage);
            context.add(userMsg);

            // 保存AI回复
            Map<String, String> assistantMsg = new HashMap<>();
            assistantMsg.put("role", "assistant");
            assistantMsg.put("content", aiResponse);
            context.add(assistantMsg);

            // 更新用户上下文
            redisService.saveUserContext(username, context);
            return Result.success("对话成功", aiResponse);
        } else {
            return Result.error("对话失败");
        }
    }

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
