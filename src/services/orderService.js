// import axios from 'axios';
// import { API_ENDPOINTS } from '../utils/config';

// export const orderService = {
//     // 获取订单列表
//     getOrderList: async (params) => {
//         try {
//             const { current, size, userId, activityName, orderStatus, startTime, endTime } = params;
//             const queryParams = new URLSearchParams();
            
//             // 添加分页参数
//             queryParams.append('current', current);
//             queryParams.append('size', size);
            
//             // 添加其他查询参数
//             if (userId) queryParams.append('userId', userId);
//             if (activityName) queryParams.append('activityName', activityName);
//             if (orderStatus) queryParams.append('orderStatus', orderStatus);
//             if (startTime) queryParams.append('startTime', startTime);
//             if (endTime) queryParams.append('endTime', endTime);

//             const response = await axios.get(`${API_ENDPOINTS.ORDER.LIST}?${queryParams.toString()}`);
//             return response.data;
//         } catch (error) {
//             throw error.response?.data || error;
//         }
//     },

//     // 获取订单详情
//     getOrderDetail: async (orderId) => {
//         try {
//             const response = await axios.get(`${API_ENDPOINTS.ORDER.DETAIL}/${orderId}`);
//             return response.data;
//         } catch (error) {
//             throw error.response?.data || error;
//         }
//     },

//     // 删除订单
//     deleteOrder: async (orderId) => {
//         try {
//             const response = await axios.delete(`${API_ENDPOINTS.ORDER.DELETE}/${orderId}`);
//             return response.data;
//         } catch (error) {
//             throw error.response?.data || error;
//         }
//     },

//     // 获取订单统计数据
//     getOrderStatistics: async () => {
//         try {
//             const response = await axios.get(API_ENDPOINTS.ORDER.ORDER_STATISTICS);
//             return response.data;
//         } catch (error) {
//             throw error.response?.data || error;
//         }
//     }
// };

import api from './api';
import { API_ENDPOINTS } from '../utils/config';

export const orderService = {
    // 获取订单列表
    getOrderList: async (params) => {
        try {
            const { current, size, userId, activityName, orderStatus, startTime, endTime } = params;
            const queryParams = new URLSearchParams();
            
            // 添加分页参数
            queryParams.append('current', current);
            queryParams.append('size', size);
            
            // 添加其他查询参数
            if (userId) queryParams.append('userId', userId);
            if (activityName) queryParams.append('activityName', activityName);
            if (orderStatus) queryParams.append('orderStatus', orderStatus);
            if (startTime) queryParams.append('startTime', startTime);
            if (endTime) queryParams.append('endTime', endTime);

            const response = await api.get(`${API_ENDPOINTS.ORDER.LIST}?${queryParams.toString()}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 获取订单详情
    getOrderDetail: async (orderId) => {
        try {
            const response = await api.get(API_ENDPOINTS.ORDER.DETAIL(orderId));
            return response;
        } catch (error) {
            throw error;
        }
    },

  

    // 获取订单统计数据
    getOrderStatistics: async () => {
        try {
            const response = await api.get(API_ENDPOINTS.ORDER.ORDER_STATISTICS);
            return response;
        } catch (error) {
            throw error;
        }
    }
};