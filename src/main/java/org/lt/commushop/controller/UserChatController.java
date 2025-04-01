package org.lt.commushop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.entity.ChatMessage;
import org.lt.commushop.domain.entity.UserChat;
import org.lt.commushop.service.IUserChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/chat")
@Api(tags = "聊天功能接口")
public class UserChatController {

    @Autowired
    private IUserChatService userChatService;

    @PostMapping("/send")
    @ApiOperation("发送消息")
    public Result<ChatMessage> sendMessage(@RequestParam Long senderId,
                                           @RequestParam Long receiverId,
                                           @RequestParam String content) {
        ChatMessage message = userChatService.sendMessage(senderId, receiverId, content);
        return Result.success(message);
    }

    @GetMapping("/list")
    @ApiOperation("获取用户的聊天列表")
    public Result<List<UserChat>> getChatList(@RequestParam Long userId) {
        List<UserChat> chatList = userChatService.getUserChatList(userId);
        return Result.success(chatList);
    }

    @GetMapping("/history")
    @ApiOperation("获取聊天历史记录")
    public Result<IPage<ChatMessage>> getChatHistory(@RequestParam Long chatId,
                                              @RequestParam(defaultValue = "1") Integer current,
                                              @RequestParam(defaultValue = "20") Integer size) {
        IPage<ChatMessage> history = userChatService.getChatHistory(chatId, current, size);
        return Result.success(history);
    }

    @DeleteMapping("/{chatId}")
    @ApiOperation("删除聊天会话")
    public Result<Boolean> deleteChat(@PathVariable Long chatId) {
        boolean result = userChatService.deleteChat(chatId);
        return Result.success(result);
    }

    @GetMapping("/unread/count")
    @ApiOperation("获取未读消息数量")
    public Result<Integer> getUnreadCount(@RequestParam Long userId) {
        int count = userChatService.getUnreadMessageCount(userId);
        return Result.success(count);
    }

    @PutMapping("/read/{chatId}")
    @ApiOperation("标记消息为已读")
    public Result<Boolean> markAsRead(@PathVariable Long chatId,
                               @RequestParam Long userId) {
        boolean result = userChatService.markMessagesAsRead(chatId, userId);
        return Result.success(result);
    }
}
