// import axios from 'axios';
import api from './api';
import { API_ENDPOINTS } from '../utils/config';
// 获取用户信息
// export const getUserInfo = async (username) => {
//   try {
//     const response = await axios.get(`/api/user/userInfo/${username}`);
//     return response.data;
//   } catch (error) {
//     console.error('获取用户信息失败:', error);
//     throw error;
//   }
// };
export const userService = {

  // 获取用户信息
  getUserInfo: async (username) => {
    const response = await api.get(`${API_ENDPOINTS.USER.INFO}/${username}`);
    return response;
  }


};