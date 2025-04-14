import api from './api';
import { API_ENDPOINTS } from '../utils/config';

export const orderNewService = {
    // 获取订单列表
    getOrderList: async (params) => {
        try {
            const response = await api.get(API_ENDPOINTS.ORDERNEW.LIST, { params });
            return response;
        } catch (error) {
            throw error;
        }
    },
    // 创建订单
    addOrder: async (data) => {
        try {
            const response = await api.post(API_ENDPOINTS.ORDERNEW.CREATE, data);
            return response;
        } catch (error) {
            throw error;
        }
    },
    // 修改订单状态
    updateOrderStatus: async (data) => {
        try {
            const response = await api.put(API_ENDPOINTS.ORDERNEW.UPDATE, data);
            return response;
        } catch (error) {
            throw error;
        }
    },
    
    // 售后服务相关接口
    refund: {
        // 申请退款
        apply: async (orderId, data = {}) => {
            try {
                const response = await api.post(API_ENDPOINTS.ORDERNEW.REFUND.APPLY(orderId), data);
                return {
                    success: response.code === 200,
                    data: response.data,
                    message: response.message || '申请退款操作完成'
                };
            } catch (error) {
                console.error('申请退款失败:', error);
                return {
                    success: false,
                    data: null,
                    message: error.message || '申请退款出错'
                };
            }
        },
        
        // 同意退款
        approve: async (orderId, data = {}) => {
            try {
                const response = await api.post(API_ENDPOINTS.ORDERNEW.REFUND.APPROVE(orderId), data);
                return {
                    success: response.code === 200,
                    data: response.data,
                    message: response.message || '同意退款操作完成'
                };
            } catch (error) {
                console.error('同意退款失败:', error);
                return {
                    success: false,
                    data: null,
                    message: error.message || '同意退款出错'
                };
            }
        },
        
        // 拒绝退款
        reject: async (orderId, data = {}) => {
            try {
                const response = await api.post(API_ENDPOINTS.ORDERNEW.REFUND.REJECT(orderId), data);
                return {
                    success: response.code === 200,
                    data: response.data,
                    message: response.message || '拒绝退款操作完成'
                };
            } catch (error) {
                console.error('拒绝退款失败:', error);
                return {
                    success: false,
                    data: null,
                    message: error.message || '拒绝退款出错'
                };
            }
        },
        
        // 确认退款完成
        complete: async (orderId, data = {}) => {
            try {
                const response = await api.post(API_ENDPOINTS.ORDERNEW.REFUND.COMPLETE(orderId), data);
                return {
                    success: response.code === 200,
                    data: response.data,
                    message: response.message || '确认退款完成操作完成'
                };
            } catch (error) {
                console.error('确认退款完成失败:', error);
                return {
                    success: false,
                    data: null,
                    message: error.message || '确认退款完成出错'
                };
            }
        }
    },
    //删除订单（软删除）
    deleteOrder: async (orderId) => {
        try {
            const response = await api.delete(API_ENDPOINTS.ORDERNEW.DELETE(orderId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    //查看商品详情
    getOrderListDetail: async (params) => {
        try {
            const response = await api.get(API_ENDPOINTS.ORDERNEW.LISTDETAIL, { params });
            return response;
        } catch (error) {
            throw error;
        }
    },
    
    //通过订单ID查询商品详情
    getOrderDetailByOrderId: async (params) => {
        try {
            const { orderId, userId, current = 1, size = 10 } = params;
            const queryParams = new URLSearchParams();
            
            // 添加基础分页参数
            queryParams.append('current', current);
            queryParams.append('size', size);
            
            // 添加必要参数
            if (orderId) queryParams.append('orderId', orderId);
            if (userId) queryParams.append('userId', userId);
            
            console.log('查询订单商品详情参数:', queryParams.toString());
            const response = await api.get(`${API_ENDPOINTS.ORDERNEW.DETAIL_BY_ORDERID}?${queryParams.toString()}`);
            return response;
        } catch (error) {
            console.error('查询订单商品详情错误:', error);
            throw error;
        }
    },
    //插入订单商品记录
    addOrderList: async (data) => {
        try {
            const response = await api.post(API_ENDPOINTS.ORDERNEW.ADDLIST, data);
            return response;
        } catch (error) {
            throw error;
        }
    }
}