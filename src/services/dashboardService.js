import api from './api';
import { API_ENDPOINTS } from '../utils/config';

export const dashboardService = {
    // 获取仪表板概览数据
    getDashboardOverview: () => {
        return api.get(API_ENDPOINTS.DASHBOARD.OVERVIEW);
    },

    // 获取访问统计数据
    getVisitStats: (days) => {
        return api.get(`${API_ENDPOINTS.DASHBOARD.VISIT_STATS}?days=${days}`);
    },

    // 获取热门商品数据
    getHotProducts: () => {
        return api.get(API_ENDPOINTS.DASHBOARD.HOT_PRODUCTS);
    },

    // 获取内容分类统计
    getCategoryStats: () => {
        return api.get(API_ENDPOINTS.DASHBOARD.CATEGORY_STATS);
    }
};
