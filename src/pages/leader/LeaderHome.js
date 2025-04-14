import React, { lazy, Suspense } from 'react';
import { Layout, Grid, Tabs, Spin } from 'antd';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import {
  HomeOutlined,
  CarOutlined,
  CustomerServiceOutlined,
  UserOutlined
} from '@ant-design/icons';
import './LeaderHome.css';
import OrderDetails from './order/orderDetails';
import UserDetailPage from '../consumer/ProfilePage/My/UserDetailPage';

// 使用懒加载导入组件
const LeaderDashboard = lazy(() => import('./LeaderDashboard'));
const LeaderDelivery = lazy(() => import('./LeaderDelivery'));
const LeaderService = lazy(() => import('./LeaderService'));
const LeaderProfile = lazy(() => import('./LeaderProfile'));
const LeaderChatManagement = lazy(() => import('./ChatManagement'));



const { Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const LeaderHome = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      key: '/leader/home',
      label: (
        <div className="tab-item">
          <HomeOutlined />
          <span>首页</span>
        </div>
      )
    },
    {
      key: '/leader/delivery',
      label: (
        <div className="tab-item">
          <CarOutlined />
          <span>配送中心</span>
        </div>
      )
    },
    {
      key: '/leader/service',
      label: (
        <div className="tab-item">
          <CustomerServiceOutlined />
          <span>服务中心</span>
        </div>
      )
    },
    {
      key: '/leader/profile',
      label: (
        <div className="tab-item">
          <UserOutlined />
          <span>我的</span>
        </div>
      )
    }
  ];

  return (
    <Layout className="leader-layout">
      <div className="page-content">
        <Suspense fallback={<div className="loading-container"><Spin size="large" /></div>}>
          <Routes>
            {/* 主页路由 */}
            <Route path="/leader/home" element={<LeaderDashboard />} />
            <Route path="/leader_home" element={<Navigate to="/leader/home" replace />} />
            <Route path="/leader/order/:orderId" element={<OrderDetails />} />
            <Route path="/consumer/my/detail" element={<UserDetailPage />} />

            {/* 配送中心路由 */}
            <Route path="/leader/delivery" element={<LeaderDelivery />} />

            {/* 服务中心路由 */}
            <Route path="/leader/service" element={<LeaderService />} />

            {/* 个人中心路由 */}
            <Route path="/leader/profile" element={<LeaderProfile />} />
            
            {/* 聊天管理路由 */}
            <Route path="/leader/chat-management" element={<LeaderChatManagement />} />

            <Route path="/leader/" element={<Navigate to="home" replace />} />
          </Routes>
        </Suspense>
      </div>

      <div className="bottom-tab-bar">
        <Tabs
          activeKey={location.pathname}
          onChange={(key) => navigate(key)}
          items={tabs}
          centered
          size="large"
        />
      </div>

      <Footer style={{ textAlign: 'center', display: screens.xs ? 'none' : 'block' }}>
        社区商城 - 团长中心 {new Date().getFullYear()}
      </Footer>
    </Layout >
  );
};

export default LeaderHome;
