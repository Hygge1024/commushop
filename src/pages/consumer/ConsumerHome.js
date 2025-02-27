import React from 'react';
import { Layout, Grid, Tabs } from 'antd';
import { useNavigate, useLocation, Routes, Route ,Navigate } from 'react-router-dom';
import { 
  HomeOutlined, 
  ThunderboltOutlined, 
  ShoppingOutlined, 
  UserOutlined 
} from '@ant-design/icons';
import './ConsumerHome.css';

// 导入子页面组件
import HomePage from './HomePage';
import FlashSalePage from './FlashSalePage';
import OrdersPage from './OrdersPage';
import ProfilePage from './ProfilePage';

const { Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const ConsumerHome = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  
  const tabs = [
    {
      key: '/comsumer/home',
      label: (
        <div className="tab-item">
          <HomeOutlined />
          <span>首页</span>
        </div>
      )
    },
    {
      key: '/consumer/flash-sale',
      label: (
        <div className="tab-item">
          <ThunderboltOutlined />
          <span>活动秒杀</span>
        </div>
      )
    },
    {
      key: '/consumer/orders',
      label: (
        <div className="tab-item">
          <ShoppingOutlined />
          <span>订单</span>
        </div>
      )
    },
    {
      key: '/consumer/profile',
      label: (
        <div className="tab-item">
          <UserOutlined />
          <span>我的</span>
        </div>
      )
    }
  ];

  return (
    <Layout className="consumer-layout">
      <div className="page-content">
        <Routes>
          <Route path="/consumer_home" element={<Navigate to="/consumer/home" replace />} />
          <Route path="/consumer/home" element={<HomePage />} />
          <Route path="/consumer/flash-sale" element={<FlashSalePage />} />
          <Route path="/consumer/orders" element={<OrdersPage />} />
          <Route path="/consumer/profile" element={<ProfilePage />} />
        </Routes>
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
        社区商城 {new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default ConsumerHome;