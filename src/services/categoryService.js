import api from './api';
import { API_ENDPOINTS } from '../utils/config';

export const categoryService = {
    // 获取活跃的商品分类列表
    getActiveCategories: () => {
        // 通过 api 实例发送 GET 请求，获取活跃的商品分类
        return api.get(API_ENDPOINTS.CATEGORY.ACTIVE);
    },
};
