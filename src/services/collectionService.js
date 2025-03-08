import api from './api';
import { API_ENDPOINTS } from '../utils/config';

export const collectionService = {
    // 获取收藏商品列表
    getCollectionList: async (params) => {
        try {
            const response = await api.get(API_ENDPOINTS.COLLECTION.LIST, { params });
            return response;
        } catch (error) {
            throw error;
        }
    },
    // 收藏商品
    addCollection: async (collectionData) => {
        try {
            const response = await api.post(API_ENDPOINTS.COLLECTION.ADD, collectionData);
            return response;
        } catch (error) {
            throw error;
        }
    },
    // 取消收藏商品
    deleteCollection: async (collectionId) => {
        try {
            const response = await api.delete(API_ENDPOINTS.COLLECTION.DELETE(collectionId));
            return response;
        } catch (error) {
            throw error;
        }
    },
    // 查询收藏状态
    checkCollection: async (params) => {
        try {
            const { userId, productId } = params;
            const response = await api.get(`${API_ENDPOINTS.COLLECTION.CHECK}?userId=${userId}&productId=${productId}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
}