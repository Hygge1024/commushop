import axios from 'axios';
import { API_ENDPOINTS } from '../utils/config';

export const activityService = {
    // 获取活动列表
    getActivityList: async (params) => {
        try {
            const response = await axios.get(API_ENDPOINTS.ACTIVITY.LIST, {
                params: {
                    current: params.current || 1,
                    size: params.size || 10,
                    activityCode: params.activityCode || null,
                    activityName: params.activityName || null,
                    startTime: params.startTime || null,
                    endTime: params.endTime || null
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // 更新活动信息
    updateActivity: async (activityData) => {
        try {
            const response = await axios.put(API_ENDPOINTS.ACTIVITY.UPDATE, activityData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // 从活动中移除商品
    removeProductFromActivity: async (activityCode, productId) => {
        try {
            const response = await axios.delete(
                API_ENDPOINTS.ACTIVITY.REMOVE_PRODUCT(activityCode, productId)
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // 删除活动
    deleteActivity: async (activityId) => {
        try {
            const response = await axios.delete(
                API_ENDPOINTS.ACTIVITY.DELETE(activityId)
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // 创建新活动
    createActivity: async (activityData, productIds) => {
        try {
            const response = await axios.post(
                `${API_ENDPOINTS.ACTIVITY.CREATE}?productIds=${productIds.join(',')}`,
                {
                    activityName: activityData.activityName,
                    activityStartTime: activityData.activityStartTime,
                    activityEndTime: activityData.activityEndTime,
                    minGroupSize: activityData.minGroupSize,
                    maxGroupSize: activityData.maxGroupSize
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // 获取活动统计数据
    getActivityStatistics: async () => {
        try {
            const response = await axios.get(API_ENDPOINTS.ACTIVITY.STATISTICS);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
