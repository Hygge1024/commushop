const config = {
    baseURL: 'http://localhost:8080',
    api: {
        login: '/api/login',
        register: '/api/register',
    }
};

export default config;

export const API_BASE_URL = 'http://localhost:8080';
//集中处理API的配置，使其在其它地方使用这些API时，可以方便引用和修改这些常量，而不需要在代码中硬编码URL和路径
export const API_ENDPOINTS = {
    GOODS: {
        LIST: '/api/product/page',
        CREATE: '/api/product/create',
        UPDATE: '/api/product/update',
        DELETE: '/api/product/delete',
        DETAIL: '/api/product/detail',
        UPLOAD: '/api/product/upload',
        UPDATE_IMAGE: '/api/product/update-image',
    },
    CATEGORY: {
        ACTIVE: '/api/category/active',
    },
    DASHBOARD: {
        OVERVIEW: '/api/dashboard/overview',
        VISIT_STATS: '/api/dashboard/visit-stats',
        HOT_PRODUCTS: '/api/dashboard/hot-products',
        CATEGORY_STATS: '/api/dashboard/category-stats'
    },
    USER: {
        INFO: '/api/userInfo'
    }
};
