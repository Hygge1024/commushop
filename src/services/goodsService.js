import api from './api';
import { API_ENDPOINTS } from '../utils/config';


export const goodsService = {
    // 获取商品列表
    getGoodsList: (params) => {
        console.log('Calling API with params:', params);
        return api.get(API_ENDPOINTS.GOODS.LIST, { params });
    },

    //查询当个商品
    getGoodsDetail: async (productId) => {
        try {
            // 直接使用API_ENDPOINTS.GOODS.DETAIL函数生成URL
            const url = API_ENDPOINTS.GOODS.DETAIL(productId);
            const response = await api.get(url);
            return response;
        } catch (error) {
            console.error('获取商品详情失败:', error);
            throw error;
        }
    },
    // 上传商品
    uploadProduct: (formData) => {
        return api.post(API_ENDPOINTS.GOODS.UPLOAD, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // 更新商品图片
    updateProductImage: (productId, formData) => {
        return api.put(`${API_ENDPOINTS.GOODS.UPDATE_IMAGE}/${productId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // 更新商品
    updateGoods: (data) => {
        return api.put(API_ENDPOINTS.GOODS.UPDATE, JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    // 删除商品
    deleteGoods: (id) => {
        return api.delete(`${API_ENDPOINTS.GOODS.DELETE}/${id}`);
    },
};
