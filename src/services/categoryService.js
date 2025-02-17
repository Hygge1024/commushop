import api from './api';
import { API_ENDPOINTS } from '../utils/config';

export const categoryService = {
    // 获取所有商品分类列表
    getAllCategories: () => {
        return api.get(API_ENDPOINTS.CATEGORY.ALL);
    },

    // 获取活跃的商品分类列表
    getActiveCategories: () => {
        return api.get(API_ENDPOINTS.CATEGORY.ACTIVE);
    },

    // 创建新的商品分类
    createCategory: (categoryData) => {
        return api.post(API_ENDPOINTS.CATEGORY.ADD, categoryData);
    },

    // 更新商品分类
    updateCategory: (categoryData) => {
        return api.put(API_ENDPOINTS.CATEGORY.UPDATE, categoryData);
    },

    // 删除商品分类
    deleteCategory: (categoryId) => {
        return api.delete(API_ENDPOINTS.CATEGORY.DELETE(categoryId));
    }
};
