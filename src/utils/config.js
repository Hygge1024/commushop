const config = {
    baseURL: 'http://8.137.53.253:8081',
    api: {
        login: '/api/login',
        register: '/api/register',
    }
};

export default config;

export const API_BASE_URL = 'http://8.137.53.253:8081';
//集中处理API的配置，使其在其它地方使用这些API时，可以方便引用和修改这些常量，而不需要在代码中硬编码URL和路径
export const API_ENDPOINTS = {
    GOODS: {
        LIST: '/api/product/page',
        CREATE: '/api/product/create',
        UPDATE: '/api/product/update',
        DELETE: '/api/product/deletesoft',
        DETAIL: (productId) => `/api/product/${productId}`,
        UPLOAD: '/api/product/upload',
        UPDATE_IMAGE: '/api/product/update-image',
    },
    CATEGORY: {
        ALL: '/api/category/all',
        ACTIVE: '/api/category/active',
        ADD: '/api/category/add',
        UPDATE: 'api/category/update',
        DELETE: (categoryId) => `api/category/delete/${categoryId}`
    },
    DASHBOARD: {
        OVERVIEW: '/api/dashboard/overview',
        VISIT_STATS: '/api/dashboard/visit-stats',
        HOT_PRODUCTS: '/api/dashboard/hot-products',
        CATEGORY_STATS: '/api/dashboard/category-stats'
    },
    USER: {
        INFO: '/api/userInfo',
        PAGE: `${API_BASE_URL}/api/page`,
        STATISTICS: `${API_BASE_URL}/api/statistics`,
        DETAIL: `/api/details`,
        REGISTER: '/api/register',
        UPDATE: '/api/updateUserInfo',
        PASSWORD: '/api/updatePassword',
        USERDETAILs: '/api/userDetails',
    },
    ACTIVITY: {
        LIST: '/api/activity/page',
        CREATE: '/api/activity/create',
        UPDATE: '/api/activity/update',
        DELETE: (activityId) => `/api/activity/${activityId}`,
        DETAIL: '/api/activity/detail',
        REMOVE_PRODUCT: (activityCode, productId) => `/api/activity/${activityCode}/product/${productId}`,
        STATISTICS: '/api/activity/statistics'
    },
    ORDER: {
        LIST: '/api/group-buying-order/order/page',
        // DETAIL: '/api/group-buying-order/order/detail',
        DELETE: '/api/group-buying-order/order/delete',
        // 订单统计
        ORDER_STATISTICS: `${API_BASE_URL}/api/group-buying-order/statistics`,
    },
    ORDERNEW: {
        "LIST": "api/order/page",
        "CREATE": "api/order/create",
        "UPDATE": "api/order/update",
        "DELETE": (orderId) => `/api/order/delete/${orderId}`,

        //查看商品详情部分
        "LISTDETAIL": "api/order/pagedetail",
        "ADDLIST": "api/order/batch"
    },
    // 支付管理
    PAYMENT: {
        PAGE_DETAILS: `${API_BASE_URL}/api/payment/pageDetails`,
        STATISTICS: `${API_BASE_URL}/api/payment/statistics`,
    },
    //购物车
    CART: {
        LIST: "/api/cart/user",
        ADD: "/api/cart/add",
        UPDATE: "/api/cart/update",
        DELETE: (borderId) => `/api/cart/delete/${borderId}`
    },
    PORDER: {
        LIST: "/api/porder/user",
        CREATE: "/api/porder/add",
        UPDATE_STATUS: "/api/porder/update",
    },
    FIXED: {
        LIST: "/api/fixed/page",
        // 还需要在管理员端写：查询、删除、修改 固定地址

    },
    COLLECTION: {
        LIST: "/api/collection/user/page",
        ADD: "/api/collection/add",
        DELETE: (collectionId) => `/api/collection/cancel/${collectionId}`,
        CHECK: "/api/collection/check"
    },
    USERADDRESS: {
        ADD: (username) => `/api/${username}/addAddress`,
        DELETE: (addressId, username) => `/api/${username}/deleteAddress/${addressId}`,
    },
    //商品评价
    EVALUATION: {
        LIST: '/api/evaluation/page',
        CREATE: '/api/evaluation/add',
        DELETE: (evaluationId) => `/api/evaluation/${evaluationId}`
    }
};
