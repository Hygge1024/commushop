import api from './api'
import { API_ENDPOINTS } from '../utils/config'

/**
 * 推荐服务
 * 提供多种推荐算法的商品推荐服务
 */
export const recommendService = {
    /**
     * 获取混合推荐商品
     * @param {number} userId - 用户ID
     * @param {number} topK - 返回的推荐商品数量
     * @returns {Promise<Object>} 推荐商品结果
     */
    getRecommendProducts: async (userId, topK = 10) => {
        try {
            const response = await api.get(`${API_ENDPOINTS.RECOMMEND.HYBRID_PRODUCTS(userId)}?topK=${topK}`);
            // 检查响应格式并返回标准化的结果
            if (response && response.code === 200) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message
                };
            } else {
                console.error('获取混合推荐商品失败:', response);
                return {
                    success: false,
                    data: [],
                    message: response?.message || '获取混合推荐商品失败'
                };
            }
        } catch (error) {
            console.error('获取混合推荐商品错误:', error);
            return {
                success: false,
                data: [],
                message: error.message || '获取混合推荐商品出错'
            };
        }
    },

    /**
     * 获取基于协同过滤(CF)的推荐商品
     * @param {number} userId - 用户ID
     * @param {number} topK - 返回的推荐商品数量
     * @returns {Promise<Object>} 推荐商品结果
     */
    getCFRecommendProducts: async (userId, topK = 10) => {
        try {
            const response = await api.get(`${API_ENDPOINTS.RECOMMEND.CF_PRODUCTS(userId)}?topK=${topK}`);
            
            if (response && response.code === 200) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message
                };
            } else {
                console.error('获取CF推荐商品失败:', response);
                return {
                    success: false,
                    data: [],
                    message: response?.message || '获取CF推荐商品失败'
                };
            }
        } catch (error) {
            console.error('获取CF推荐商品错误:', error);
            return {
                success: false,
                data: [],
                message: error.message || '获取CF推荐商品出错'
            };
        }
    },

    /**
     * 获取基于内容(Content)的推荐商品
     * @param {number} userId - 用户ID
     * @param {number} topK - 返回的推荐商品数量
     * @returns {Promise<Object>} 推荐商品结果
     */
    getContentRecommendProducts: async (userId, topK = 10) => {
        try {
            const response = await api.get(`${API_ENDPOINTS.RECOMMEND.CONTENT_PRODUCTS(userId)}?topK=${topK}`);
            
            if (response && response.code === 200) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message
                };
            } else {
                console.error('获取内容推荐商品失败:', response);
                return {
                    success: false,
                    data: [],
                    message: response?.message || '获取内容推荐商品失败'
                };
            }
        } catch (error) {
            console.error('获取内容推荐商品错误:', error);
            return {
                success: false,
                data: [],
                message: error.message || '获取内容推荐商品出错'
            };
        }
    }
}
