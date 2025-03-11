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