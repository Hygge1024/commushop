import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const location = useLocation();
    const isAuthenticated = localStorage.getItem('token');

    if (!isAuthenticated) {
        // 将用户重定向到登录页面，但保存他们试图访问的页面路径
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRoute; 