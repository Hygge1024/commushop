// import axios from 'axios';
// import { API_BASE_URL } from '../utils/config';


// // 创建axios实例
// const instance = axios.create({
//     baseURL: API_BASE_URL,
//     timeout: 10000,
//     headers: {
//         'Content-Type': 'application/json',
//     }
// });

// // 请求拦截器
// instance.interceptors.request.use(
//     config => {
//         const token = localStorage.getItem('token');
//         console.log("此时调用的是utils.axios。Token为：", token);
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     error => {
//         return Promise.reject(error);
//     }
// );

// // 响应拦截器
// instance.interceptors.response.use(
//     response => {
//         // 即使是错误状态码，也返回响应，让组件自己处理
//         return response;
//     },
//     error => {
//         return Promise.reject(error);
//     }
// );

// export default instance; 