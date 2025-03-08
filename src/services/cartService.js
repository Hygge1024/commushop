import api from './api'
import { API_ENDPOINTS } from '../utils/config'

export const cartService = {
    //获取用户购物车
    getCartList: async (params) => {
        try {
            const response = await api.get(API_ENDPOINTS.CART.LIST, { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    //添加购物车
    addCart: async (data) => {
        try {
            const response = await api.post(API_ENDPOINTS.CART.ADD, data);
            return response;
        } catch (error) {
            throw error;
        }
    },
    //更新购物车
    updateCart: async (data) => {
        try {
            const response = await api.put(API_ENDPOINTS.CART.UPDATE, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    //删除购物车
    deleteCart: (borderId) => {
        try {
            const response = api.delete(API_ENDPOINTS.CART.DELETE(borderId));
            return response;
        } catch (error) {
            throw error;
        }
    },
}