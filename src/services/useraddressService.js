import api from './api';
import { API_ENDPOINTS } from '../utils/config';

export const useraddressService = {
    // 添加收货地址
    addUserAddress: async (username, data) => {
        try {
            console.log(username, data);
            const response = await api.post(API_ENDPOINTS.USERADDRESS.ADD(username), data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 删除收货地址
    deleteUserAddress: async (addressId, username) => {
        try {
            console.log(addressId, username);
            const response = await api.delete(API_ENDPOINTS.USERADDRESS.DELETE(addressId, username));
            return response;
        } catch (error) {
            throw error;
        }
    }
}