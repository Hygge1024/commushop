import api from './api';
import { API_ENDPOINTS } from '../utils/config';
import { get, update } from 'lodash';

export const productOrderService = {
    //获取订单列表
    getOrderList: async (params) => {
        try {
            const response = await api.get(API_ENDPOINTS.PORDER.LIST, { params });
            return response;
        } catch (error) {
            throw error;
        }
    },
    //添加订单
    addOrder: async (order) => {
        try {
            const response = await api.post(API_ENDPOINTS.PORDER.CREATE, order);
            return response;
        } catch (error) {
            throw error;
        }
    },

    //更新订单物流状态
    updateOrderStatus: async (params) => {
        try {
            const response = await api.put(API_ENDPOINTS.PORDER.UPDATE_STATUS, params);
            return response;
        } catch (error) {
            throw error;
        }
    },
};