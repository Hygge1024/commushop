// import axios from 'axios';
// import { API_ENDPOINTS } from '../utils/config';

// export const userService = {
//     // 获取用户信息
//     getUserInfo: async (username) => {
//         try {
//             const response = await axios.get(`${API_ENDPOINTS.USER.INFO}/${username}`);
//             return response.data;
//         } catch (error) {
//             throw error.response?.data || error;
//         }
//     },

//     // 获取用户列表
//     getUserList: async (params) => {
//         try {
//             const { current, size, userId, username, phone } = params;
//             const queryParams = new URLSearchParams();

//             if (current) queryParams.append('current', current);
//             if (size) queryParams.append('size', size);
//             if (userId) queryParams.append('userId', userId);
//             if (username) queryParams.append('username', username);
//             if (phone) queryParams.append('phone', phone);

//             const response = await axios.get(`${API_ENDPOINTS.USER.PAGE}?${queryParams.toString()}`);
//             return response.data;
//         } catch (error) {
//             throw error.response?.data || error;
//         }
//     },

//     // 获取用户统计数据
//     getUserStatistics: async () => {
//         try {
//             const response = await axios.get(API_ENDPOINTS.USER.STATISTICS);
//             return response.data;
//         } catch (error) {
//             throw error.response?.data || error;
//         }
//     }
// };
import api from './api';
import { API_ENDPOINTS } from '../utils/config';

export const userService = {
    // 获取用户信息
    getUserInfo: async (username) => {
        try {
            const response = await api.get(`${API_ENDPOINTS.USER.INFO}/${username}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
    //获取用户详细信息
    getUserDetails: async () => {
        try {
            const response = await api.get(`${API_ENDPOINTS.USER.USERDETAILs}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    //获取用户详细信息（地址加身份信息）
    getUserDetail: async (username) => {
        try {
            const response = await api.get(`${API_ENDPOINTS.USER.DETAIL}/${username}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    //注册用户
    registerUser: async (data) => {
        try {
            const response = await api.post(API_ENDPOINTS.USER.REGISTER, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 获取用户列表
    getUserList: async (params) => {
        try {
            const { current, size, userId, username, phone } = params;
            const queryParams = new URLSearchParams();

            if (current) queryParams.append('current', current);
            if (size) queryParams.append('size', size);
            if (userId) queryParams.append('userId', userId);
            if (username) queryParams.append('username', username);
            if (phone) queryParams.append('phone', phone);

            const response = await api.get(`${API_ENDPOINTS.USER.PAGE}?${queryParams.toString()}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 获取用户统计数据
    getUserStatistics: async () => {
        try {
            const response = await api.get(API_ENDPOINTS.USER.STATISTICS);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 更新用户信息
    updateUserInfo: async (data) => {
        try {
            const response = await api.put(API_ENDPOINTS.USER.UPDATE, data);
            return response;
        } catch (error) {
            throw error;
        }
    },
    //更新用户密码
    updatePassword: async (params) => {
        try {
            const response = await api.put(API_ENDPOINTS.USER.PASSWORD, null, { params });
            return response;
        } catch (error) {
            throw error;
        }
    }
};