package org.lt.commushop.service.UtilsService;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.lt.commushop.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@Slf4j
@Service
public class DeepSeekService {
    @Value("${deepseek.api.url}")
    private String deepSeekApiUrl;
    @Value("${deepseek.api.key}")
    private String apiKey;
    @Autowired
    private RestTemplate restTemplate;

    /**
     * 调用DeepSeek API生成回复
     */
    @Transactional(rollbackFor = Exception.class)
    public String getAiResponse(String userMessage, List<Map<String, String>> context) {
        // 构建请求体
        List<Map<String, Object>> messages = new ArrayList<>();

        // 添加系统角色消息
        Map<String, Object> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are a helpful assistant.");
        messages.add(systemMessage);

        // 添加上下文消息（将历史Contetx转入到新建的messages中）
        for (Map<String, String> contextMessage : context) {
            Map<String, Object> message = new HashMap<>();
            message.put("role", contextMessage.get("role"));
            message.put("content", contextMessage.get("content"));
            messages.add(message);
        }
        // 添加当前用户消息
        Map<String, Object> currentUserMsg = new HashMap<>();
        currentUserMsg.put("role", "user");
        currentUserMsg.put("content", userMessage);// 添加当前提供信息
        messages.add(currentUserMsg);// 新提问信息也加入其中（末尾，AI自动识别-该记录是”新问题“）

        // 构建请求头
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "deepseek-chat");
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 2000);

        // 设置请求头
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 发送请求
        // 创建请求体和请求头
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
        try {
            // 使用RestTemplate发送POST请求到DeepSeek API
            // exchange方法参数，URL，HTTP方法，请求实体，响应类型
            ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    deepSeekApiUrl,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class);
            // 解析响应
            // 检查响应体
            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                Map<String, Object> responseBody = responseEntity.getBody();
                // System.out.println("responseBody = " + responseBody);
                // 检查响应体是否包含choices字段
                if (responseBody != null && responseBody.containsKey("choices")) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                    // 检查choices列表是否为空
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> choice = choices.get(0);
                        // 检查choice是否包含message字段
                        if (choice != null && choice.containsKey("message")) {
                            Map<String, String> message = (Map<String, String>) choice.get("message");
                            // 检查message是否包含content字段
                            if (message != null && message.containsKey("content")) {
                                return message.get("content");
                            }
                        }
                    }

                }
            }
            throw new BusinessException("API 响应格式不正确");
        } catch (Exception e) {
            throw new BusinessException("调用 DeepSeek API 失败: " + e.getMessage());
        }
    }

    /**
     * 调用DeepSeek Reasoner API生成带推理过程的回复(暂时还没调用)
     */
    public void getReasonerResponseStream(String userMessage, List<Map<String, String>> context, SseEmitter emitter) {
        // 构建消息列表
        List<Map<String, Object>> messages = new ArrayList<>();

        // 添加系统角色消息
        Map<String, Object> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are a helpful assistant that shows reasoning steps.");
        messages.add(systemMessage);

        // 添加历史上下文
        for (Map<String, String> contextMessage : context) {
            Map<String, Object> message = new HashMap<>();
            message.put("role", contextMessage.get("role"));
            message.put("content", contextMessage.get("content"));
            messages.add(message);
        }

        // 添加当前用户消息
        Map<String, Object> currentUserMsg = new HashMap<>();
        currentUserMsg.put("role", "user");
        currentUserMsg.put("content", userMessage);
        messages.add(currentUserMsg);

        // 构建请求体
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "deepseek-reasoner");
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 2000);
        requestBody.put("stream", true);

        // 设置请求头
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 发送请求
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            restTemplate.execute(
                    deepSeekApiUrl,
                    HttpMethod.POST,
                    request -> {
                        request.getHeaders().putAll(headers);
                        request.getBody().write(new ObjectMapper().writeValueAsBytes(requestBody));
                    },
                    response -> {
                        try (BufferedReader reader = new BufferedReader(new InputStreamReader(response.getBody()))) {
                            String line;
                            while ((line = reader.readLine()) != null) {
                                if (line.startsWith("data: ")) {
                                    String data = line.substring(6);
                                    if (!"[DONE]".equals(data)) {
                                        Map<String, Object> chunk = new ObjectMapper().readValue(data, Map.class);
                                        emitter.send(SseEmitter.event()
                                                .data(chunk)
                                                .id(String.valueOf(System.currentTimeMillis())));
                                    }
                                }
                            }
                        }
                        return null;
                    });
        } catch (Exception e) {
            log.error("Stream API call error:", e);
            throw new BusinessException("调用 API 失败: " + e.getMessage());
        } finally {
            emitter.complete();
        }
    }

}
