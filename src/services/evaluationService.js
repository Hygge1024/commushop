import api from './api';
import { API_ENDPOINTS } from '../utils/config';

export const evaluationService = {
    //获取商品评价
    getEvaluationList: async(params) => {
        try{
            const response = await api.get(API_ENDPOINTS.EVALUATION.LIST, { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    //添加商品评价
    addEvaluation: async(data) => {
        try {
            const response = await api.post(API_ENDPOINTS.EVALUATION.CREATE, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    //删除商品评价
    deleteEvaluation: async(evaluationId) => {
        try {
            const response = await api.delete(API_ENDPOINTS.EVALUATION.DELETE(evaluationId));
            return response;
        } catch (error) {
            throw error;
        }
    }
};