import axios from 'axios';

// 获取用户信息
export const getUserInfo = async (username) => {
  try {
    const response = await axios.get(`/api/user/userInfo/${username}`);
    return response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};
