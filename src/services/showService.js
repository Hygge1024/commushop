import api from './api';
import { API_ENDPOINTS } from '../utils/config';

export const showService = {
    //获取首页展示
    getHomePage: async() => {
        try{
            const response = await api.get(API_ENDPOINTS.SHOW.HOME_PAGE);
            return response;
        } catch (error) {
            throw error;
        }
    }
};