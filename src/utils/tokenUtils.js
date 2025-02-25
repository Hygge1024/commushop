/**
 * Token管理工具类
 * 处理token的存储、获取、刷新等操作
 */

// Token相关的常量
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';

const TokenUtils = {
    /**
     * 保存登录信息，包括token、refreshToken和用户信息
     * @param {Object} loginData 登录返回的数据
     */
    saveLoginInfo(loginData) {
        const { token, refreshToken, username } = loginData;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(USER_INFO_KEY, JSON.stringify({ username }));
    },

    /**
     * 获取访问token
     * @returns {string|null} 访问token
     */
    getAccessToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * 获取刷新token
     * @returns {string|null} 刷新token
     */
    getRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    /**
     * 获取用户信息
     * @returns {Object|null} 用户信息
     */
    getUserInfo() {
        const userInfo = localStorage.getItem(USER_INFO_KEY);
        return userInfo ? JSON.parse(userInfo) : null;
    },

    /**
     * 更新访问token
     * @param {string} newToken 新的访问token
     */
    updateAccessToken(newToken) {
        localStorage.setItem(TOKEN_KEY, newToken);
    },

    /**
     * 清除所有登录信息
     */
    clearLoginInfo() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_INFO_KEY);
    },

    /**
     * 检查是否已登录
     * @returns {boolean} 是否已登录
     */
    isLoggedIn() {
        return !!this.getAccessToken() && !!this.getRefreshToken();
    }
};

export default TokenUtils;