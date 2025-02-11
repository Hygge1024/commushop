import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

// 创建 axios 实例
const api = axios.create({
    baseURL: API_BASE_URL,//从config.js导入的基础地址
    timeout: 10000,//10秒超时
    headers: {
        'Content-Type': 'application/json', //默认 JSON模式
    },
});

// 请求拦截器（统一添加 token）
api.interceptors.request.use(
    (config) => {
        // 可以在这里添加token等认证信息
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;// JWT 认证模式
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        // 统一处理响应
        const { data } = response;
        if (data.code === 200 && data.success) {
            return data;
        }
        return Promise.reject(new Error(data.message || '请求失败'));
    },
    (error) => {
        // 统一处理错误
        console.error('Response error:', error);// 打印错误信息
        if (error.response) {// 如果服务器有响应
            switch (error.response.status) {// 根据状态码进行处理
                case 401:
                    console.error('未授权访问');
                    break;
                case 403:
                    console.error('禁止访问');
                    break;
                case 404:
                    console.error('参数校验失败');
                    break;
                case 500:
                    console.error('服务器错误');
                    break;
                default:
                    console.error('其他错误:', error.response.status);
                    break;
            }
            // 返回一个拒绝的 Promise，包含错误信息
            return Promise.reject(new Error(error.response.data?.message || '服务器响应错误'));
        }
        if (error.request) { // 如果没有收到响应
            console.error('网络错误，请检查API服务是否正常运行');
            return Promise.reject(new Error('网络错误，请检查API服务是否正常运行'));
        }
        return Promise.reject(error);// 处理其他未知错误
    }
);

export default api;
