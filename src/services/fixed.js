import api from './api';
import { API_ENDPOINTS } from '../utils/config';

export const fixedService = {
    //获取固定地址
    getFixed: async (params) => {
        try {
            const response = await api.get(API_ENDPOINTS.FIXED.LIST, { params });
            return response;
        } catch (error) {
            throw error;
        }
    }
};