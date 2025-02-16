import axios from 'axios';
import { API_ENDPOINTS } from '../utils/config';

export const paymentService = {
    // 获取支付列表
    getPaymentList: async (params) => {
        try {
            const { current, size, paymentId, orderId, activityId, paymentMethod, startTime, endTime } = params;
            const queryParams = new URLSearchParams();
            
            // 添加分页参数
            queryParams.append('current', current);
            queryParams.append('size', size);
            
            // 添加其他查询参数
            if (paymentId) queryParams.append('paymentId', paymentId);
            if (orderId) queryParams.append('orderId', orderId);
            if (activityId) queryParams.append('activityId', activityId);
            if (paymentMethod) queryParams.append('paymentMethod', paymentMethod);
            if (startTime) queryParams.append('startTime', startTime);
            if (endTime) queryParams.append('endTime', endTime);

            const response = await axios.get(`${API_ENDPOINTS.PAYMENT.PAGE_DETAILS}?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // 获取支付统计数据
    getPaymentStatistics: async (params) => {
        try {
            const { startTime, endTime } = params;
            const queryParams = new URLSearchParams();
            
            if (startTime) queryParams.append('startTime', startTime);
            if (endTime) queryParams.append('endTime', endTime);

            const response = await axios.get(`${API_ENDPOINTS.PAYMENT.STATISTICS}?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
