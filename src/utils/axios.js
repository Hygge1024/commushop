import axios from 'axios';

// 创建axios实例
const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    timeout: 5000,
    validateStatus: function (status) {
        // 让 axios 接受所有状态码，不自动抛出错误
        return true;
    }
});

// 请求拦截器
instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    response => {
        // 即使是错误状态码，也返回响应，让组件自己处理
        return response;
    },
    error => {
        return Promise.reject(error);
    }
);

export default instance; 