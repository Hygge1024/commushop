import axios from 'axios';
import { API_BASE_URL } from '../utils/config';
import { message } from 'antd';

// 创建 axios 实例
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 是否正在刷新token
let isRefreshing = false;
// 重试队列
let requests = [];

// 检查token是否过期
const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        return tokenData.exp * 1000 < Date.now();
    } catch (error) {
        return true;
    }
};

// 刷新token
const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken
        });

        if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
            return response.data.data.token;
        } else {
            throw new Error('Refresh token failed');
        }
    } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        window.location.href = '/login';
        throw error;
    }
};

// 请求拦截器
api.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token');
        // console.log("此时调用的是services.api。Token为：", token);

        if (token) {
            // 检查token是否过期
            if (isTokenExpired(token)) {
                if (!isRefreshing) {
                    isRefreshing = true;
                    try {
                        const newToken = await refreshToken();
                        config.headers.Authorization = `Bearer ${newToken}`;
                        // 重试队列中的请求
                        requests.forEach(cb => cb(newToken));
                        requests = [];
                    } catch (error) {
                        requests.forEach(cb => cb(null));
                        requests = [];
                        throw error;
                    } finally {
                        isRefreshing = false;
                    }
                } else {
                    // 等待token刷新完成
                    return new Promise(resolve => {
                        requests.push(token => {
                            config.headers.Authorization = `Bearer ${token}`;
                            resolve(config);
                        });
                    });
                }
            } else {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        const { data } = response;
        if (data.code === 200 && data.success) {
            return data;
        }
        return Promise.reject(new Error(data.message || '请求失败'));
    },
    async (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // token 失效
                    if (!isRefreshing) {
                        isRefreshing = true;
                        try {
                            await refreshToken();
                            // 重新发送失败的请求
                            const config = error.config;
                            return api(config);
                        } catch (refreshError) {
                            message.error('登录已过期，请重新登录');
                            window.location.href = '/login';
                            return Promise.reject(refreshError);
                        } finally {
                            isRefreshing = false;
                        }
                    }
                    break;
                case 403:
                    message.error('没有权限访问');
                    break;
                case 404:
                    message.error('资源不存在');
                    break;
                case 500:
                    message.error('服务器错误');
                    break;
                default:
                    message.error('未知错误');
            }
        }
        return Promise.reject(error);
    }
);
export default api;



