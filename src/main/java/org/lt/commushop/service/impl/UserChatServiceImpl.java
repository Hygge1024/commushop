package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.lt.commushop.domain.entity.ChatMessage;
import org.lt.commushop.domain.entity.UserChat;
import org.lt.commushop.mapper.ChatMessageMapper;
import org.lt.commushop.mapper.UserChatMapper;
import org.lt.commushop.service.IUserChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@Slf4j
public class UserChatServiceImpl extends ServiceImpl<ChatMessageMapper, ChatMessage> implements IUserChatService {
    @Autowired
    private ChatMessageMapper chatMessageMapper;

    @Autowired
    private UserChatMapper userChatMapper;

    @Override
    @Transactional
    public ChatMessage sendMessage(Long senderId, Long receiverId, String content) {
        // 1. 查找或创建聊天会话
        UserChat userChat = findOrCreateChatSession(senderId, receiverId);
        if (userChat == null) {
            throw new RuntimeException("创建聊天会话失败");
        }

        // 2. 创建并保存消息
        ChatMessage message = new ChatMessage();
        message.setChatId(userChat.getChatId());
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setMsgContent(content);
        message.setMsgType(1); // 1表示文本消息
        message.setSendTime(LocalDateTime.now(ZoneId.of("Asia/Shanghai")));
        message.setMsgStatus(0); // 0表示未读
        chatMessageMapper.insert(message);

        // 3. 更新会话最后消息时间
        userChat.setLastMsgTime(LocalDateTime.now());
        userChatMapper.updateById(userChat);

        return message;
    }

    @Override
    public List<UserChat> getUserChatList(Long userId) {
        if (userId == null) {
            throw new RuntimeException("用户ID不能为空");
        }

        LambdaQueryWrapper<UserChat> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w.eq(UserChat::getUserId, userId)
                        .or()
                        .eq(UserChat::getPartnerId, userId))
                .eq(UserChat::getIsDeleted, 0)
                .orderByDesc(UserChat::getLastMsgTime);
        List<UserChat> chatList = userChatMapper.selectList(wrapper);

        // 确保返回的每个会话都是从当前用户的视角
        for (int i = 0; i < chatList.size(); i++) {
            UserChat chat = chatList.get(i);
            if (chat != null && chat.getPartnerId() != null && chat.getPartnerId().equals(userId)) {
                // 如果当前用户是partner，需要交换视角
                UserChat swappedChat = new UserChat();
                swappedChat.setChatId(chat.getChatId());
                swappedChat.setUserId(chat.getPartnerId());    // 当前用户ID
                swappedChat.setPartnerId(chat.getUserId());    // 对方ID
                swappedChat.setLastMsgTime(chat.getLastMsgTime());
                swappedChat.setIsDeleted(chat.getIsDeleted());
                chatList.set(i, swappedChat);
            }
        }

        return chatList;
    }

    @Override
    public IPage<ChatMessage> getChatHistory(Long chatId, Integer current, Integer size) {
        Page<ChatMessage> page = new Page<>(current, size);
        LambdaQueryWrapper<ChatMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatMessage::getChatId, chatId)
                .orderByDesc(ChatMessage::getSendTime);
        return chatMessageMapper.selectPage(page, wrapper);
    }

    @Override
    @Transactional
    public boolean deleteChat(Long chatId) {
        UserChat userChat = userChatMapper.selectById(chatId);
        if (userChat != null) {
            userChat.setIsDeleted(1);
            return userChatMapper.updateById(userChat) > 0;
        }
        return false;
    }

    @Override
    public int getUnreadMessageCount(Long userId) {
        LambdaQueryWrapper<ChatMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatMessage::getReceiverId, userId)
                .eq(ChatMessage::getMsgStatus, 0);
        return Math.toIntExact(chatMessageMapper.selectCount(wrapper));
    }

    @Override
    @Transactional
    public boolean markMessagesAsRead(Long chatId, Long userId) {
        LambdaQueryWrapper<ChatMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatMessage::getChatId, chatId)
                .eq(ChatMessage::getReceiverId, userId)
                .eq(ChatMessage::getMsgStatus, 0);

        ChatMessage updateMsg = new ChatMessage();
        updateMsg.setMsgStatus(1); // 1表示已读
        return update(updateMsg, wrapper);
    }

    private UserChat findOrCreateChatSession(Long senderId, Long receiverId) {
        if (senderId == null || receiverId == null) {
            throw new RuntimeException("发送者ID和接收者ID不能为空");
        }

        // 查找现有会话，需要考虑两种情况：
        // 1. userId=senderId && partnerId=receiverId
        // 2. userId=receiverId && partnerId=senderId
        LambdaQueryWrapper<UserChat> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w.eq(UserChat::getUserId, senderId)
                        .eq(UserChat::getPartnerId, receiverId)
                        .or()
                        .eq(UserChat::getUserId, receiverId)
                        .eq(UserChat::getPartnerId, senderId))
                .eq(UserChat::getIsDeleted, 0);
        UserChat userChat = userChatMapper.selectOne(wrapper);

        if (userChat == null) {
            // 创建新会话
            userChat = new UserChat();
            userChat.setUserId(senderId);
            userChat.setPartnerId(receiverId);
            userChat.setLastMsgTime(LocalDateTime.now());
            userChat.setIsDeleted(0);
            int result = userChatMapper.insert(userChat);
            if (result <= 0) {
                throw new RuntimeException("创建聊天会话失败");
            }
        }

        return userChat;
    }
}
