package org.lt.commushop.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import org.lt.commushop.domain.entity.ChatMessage;
import org.lt.commushop.domain.entity.UserChat;

import java.util.List;

public interface IUserChatService{

    /**
     * 发送文本消息
     * @param senderId 发送者ID
     * @param receiverId 接收者ID
     * @param content 消息内容
     * @return 发送的消息实体
     */
    ChatMessage sendMessage(Long senderId, Long receiverId, String content);


    /**
     * 获取用户的聊天会话列表
     * @param userId 用户ID
     * @return 聊天会话列表
     */
    List<UserChat> getUserChatList(Long userId);

    /**
     * 获取指定聊天会话的消息历史
     * @param chatId 聊天会话ID
     * @param current 当前页码
     * @param size 每页大小
     * @return 消息历史分页结果
     */
    IPage<ChatMessage> getChatHistory(Long chatId, Integer current, Integer size);

    /**
     * 删除聊天会话（逻辑删除）
     * @param chatId 聊天会话ID
     * @return 是否删除成功
     */
    boolean deleteChat(Long chatId);

    /**
     * 获取未读消息数量
     * @param userId 用户ID
     * @return 未读消息数量
     */
    int getUnreadMessageCount(Long userId);

    /**
     * 标记消息为已读
     * @param chatId 聊天会话ID
     * @param userId 用户ID
     * @return 是否标记成功
     */
    boolean markMessagesAsRead(Long chatId, Long userId);


}
