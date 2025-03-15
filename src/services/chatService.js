import api from './api'
import { API_ENDPOINTS } from '../utils/config'

export const chatService = {
    // 发送聊天信息
    sendChat: async (params) => {
        try {
            const response = await api.post(
                `${API_ENDPOINTS.CHAT.SEND}?message=${params.message}&username=${params.username}`,
                null,  // POST 请求体为空
                { timeout: 60000 }  // 设置超时时间为 60 秒
            );
            return response;
        } catch (error) {
            throw error;
        }
    },
    // 获取聊天列表
    getChatList: async (username) => {
        try {
            const response = await api.get(API_ENDPOINTS.CHAT.LIST(username));
            return response;
        } catch (error) {
            throw error;
        }
    },
    //发送聊天信息-推理
    sendChatReason: async (data) => {
        try {
            const response = await api.post(API_ENDPOINTS.CHAT.SENDREASON, data);
            return response;
        } catch (error) {
            throw error;
        }
    }
}