import api from './api'
import { API_ENDPOINTS } from '../utils/config'

export const chatMessageService = {
    // 发送聊天消息
    sendMessage: async (senderId, receiverId, content) => {
        try {
            console.log('发送消息请求:', { senderId, receiverId, content });
            
            // 确保参数类型正确
            const params = {
                senderId: parseInt(senderId),
                receiverId: parseInt(receiverId),
                content: content
            };
            
            // 将所有参数都作为URL查询参数传递
            const response = await api.post(
                `${API_ENDPOINTS.CHAT_MESSAGE.SEND}?senderId=${params.senderId}&receiverId=${params.receiverId}&content=${encodeURIComponent(params.content)}`, 
                {} // 空请求体
            );
            return response;
        } catch (error) {
            console.error('发送消息错误:', error);
            throw error;
        }
    },

    // 获取用户的聊天列表
    getChatList: async (userId) => {
        try {
            const response = await api.get(API_ENDPOINTS.CHAT_MESSAGE.GET_LIST, {
                params: { userId }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 获取聊天历史记录
    getChatHistory: async (chatId, current = 1, size = 20) => {
        try {
            const response = await api.get(API_ENDPOINTS.CHAT_MESSAGE.GET_HISTORY, {
                params: { chatId, current, size }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 删除聊天会话
    deleteChat: async (chatId) => {
        try {
            const response = await api.delete(API_ENDPOINTS.CHAT_MESSAGE.DELETE(chatId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 获取未读消息数量
    getUnreadCount: async (userId) => {
        try {
            const response = await api.get(API_ENDPOINTS.CHAT_MESSAGE.UNREAD_COUNT, {
                params: { userId }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 标记消息为已读
    markAsRead: async (chatId, userId) => {
        try {
            console.log('调用标记已读 API:', `${API_ENDPOINTS.CHAT_MESSAGE.MARK_READ(chatId)}?userId=${userId}`);
            // 使用URL查询参数传递userId
            const response = await api.put(`${API_ENDPOINTS.CHAT_MESSAGE.MARK_READ(chatId)}?userId=${userId}`, {});
            return response;
        } catch (error) {
            console.error('标记已读错误:', error);
            throw error;
        }
    }
}
