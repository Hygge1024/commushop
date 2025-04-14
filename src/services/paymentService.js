// import axios from 'axios';
// import { API_ENDPOINTS } from '../utils/config';

// export const paymentService = {
//     // 获取支付列表
//     getPaymentList: async (params) => {
//         try {
//             const { current, size, paymentId, orderId, activityName, paymentMethod, startTime, endTime } = params;
//             const queryParams = new URLSearchParams();
            
//             // 添加分页参数
//             queryParams.append('current', current);
//             queryParams.append('size', size);
            
//             // 添加其他查询参数
//             if (paymentId) queryParams.append('paymentId', paymentId);
//             if (orderId) queryParams.append('orderId', orderId);
//             if (activityName) queryParams.append('activityName', activityName);
//             if (paymentMethod) queryParams.append('paymentMethod', paymentMethod);
//             if (startTime) queryParams.append('startTime', startTime);
//             if (endTime) queryParams.append('endTime', endTime);

//             const response = await axios.get(`${API_ENDPOINTS.PAYMENT.PAGE_DETAILS}?${queryParams.toString()}`);
//             return response.data;
//         } catch (error) {
//             throw error.response?.data || error;
//         }
//     },
//     // 获取支付统计数据
//     getPaymentStatistics: async (params) => {
//         try {
//             const { startTime, endTime } = params;
//             const queryParams = new URLSearchParams();
            
//             if (startTime) queryParams.append('startTime', startTime);
//             if (endTime) queryParams.append('endTime', endTime);

//             const response = await axios.get(`${API_ENDPOINTS.PAYMENT.STATISTICS}?${queryParams.toString()}`);
//             return response.data;
//         } catch (error) {
//             throw error.response?.data || error;
//         }
//     }
// };
import api from './api';
import { API_ENDPOINTS } from '../utils/config';

export const paymentService = {
    // 获取支付列表
    getPaymentList: async (params) => {
        try {
            const { current, size, paymentId, orderId, activityName, paymentMethod, startTime, endTime } = params;
            const queryParams = new URLSearchParams();
            
            // 添加分页参数
            queryParams.append('current', current);
            queryParams.append('size', size);
            
            // 添加其他查询参数
            if (paymentId) queryParams.append('paymentId', paymentId);
            if (orderId) queryParams.append('orderId', orderId);
            if (activityName) queryParams.append('activityName', activityName);
            if (paymentMethod) queryParams.append('paymentMethod', paymentMethod);
            if (startTime) queryParams.append('startTime', startTime);
            if (endTime) queryParams.append('endTime', endTime);
    
            const response = await api.get(`${API_ENDPOINTS.PAYMENT.PAGE_DETAILS}?${queryParams.toString()}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
    getPaymentStatistics: async (params) => {
        try {
            const { startTime, endTime } = params;
            const queryParams = new URLSearchParams();
            
            if (startTime) queryParams.append('startTime', startTime);
            if (endTime) queryParams.append('endTime', endTime);
    
            const response = await api.get(`${API_ENDPOINTS.PAYMENT.STATISTICS}?${queryParams.toString()}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 创建支付订单
    createPayment: async (orderId, paymentMethod) => {
        try {
            console.log('创建支付订单请求:', { orderId, paymentMethod });
            
            // 确保参数类型正确
            const params = {
                orderId: parseInt(orderId),
                paymentMethod: paymentMethod
            };
            
            // 将所有参数作为URL查询参数传递
            const response = await api.post(
                `${API_ENDPOINTS.PAYMENT.CREATE}?orderId=${params.orderId}&paymentMethod=${encodeURIComponent(params.paymentMethod)}`,
                {} // 空请求体
            );
            return response;
        } catch (error) {
            console.error('创建支付订单错误:', error);
            throw error;
        }
    },

    // 支付订单查询
    getPaymentPage: async (params) => {
        try {
            const { 
                current = 1, 
                size = 10, 
                userId, 
                orderId, 
                minAmount, 
                maxAmount, 
                startTime, 
                endTime 
            } = params;
            
            const queryParams = new URLSearchParams();
            
            // 添加基础分页参数
            queryParams.append('current', current);
            queryParams.append('size', size);
            
            // 添加可选查询参数
            // 管理员可以查询所有用户的支付记录，所以userId是可选的
            // 如果后端要求userId必传，则使用默认值2（管理员ID）
            queryParams.append('userId', userId || 2); // 默认使用管理员ID
            if (orderId) queryParams.append('orderId', orderId);
            if (minAmount !== undefined && minAmount !== null) queryParams.append('minAmount', minAmount);
            if (maxAmount !== undefined && maxAmount !== null) queryParams.append('maxAmount', maxAmount);
            if (startTime) queryParams.append('startTime', startTime);
            if (endTime) queryParams.append('endTime', endTime);
            
            console.log('支付查询参数:', queryParams.toString());
            const response = await api.get(`${API_ENDPOINTS.PAYMENT.PAGE}?${queryParams.toString()}`);
            return response;
        } catch (error) {
            console.error('查询支付订单错误:', error);
            throw error;
        }
    }
};