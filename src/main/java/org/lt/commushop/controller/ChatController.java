package org.lt.commushop.controller;

import org.lt.commushop.common.Result;
import org.lt.commushop.service.UtilsService.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
public class ChatController {
    @Autowired
    private ChatService chatService;

    @PostMapping
    public Result<String> chat(@RequestParam String username, @RequestParam String message) {
        return chatService.handleUserMessage(username, message);
    }

    @GetMapping("/history/{username}")
    public Result<List<Map<String, String>>> getChatHistory(@PathVariable String username) {
        return chatService.getChatHistory(username);
    }

    @GetMapping(value = "/reasoner/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatWithReasonerStream(@RequestParam String username, @RequestParam String message) {
        SseEmitter emitter = new SseEmitter(-1L); // 无超时
        chatService.handleReasonerMessageStream(username, message, emitter);
        return emitter;
    }
}
