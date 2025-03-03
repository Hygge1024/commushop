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
import ProfilePage from './ProfilePage';
import UserDetailPage from './ProfilePage/My/UserDetailPage';
import CartPage from './CartPage';
// 导入订单相关页面
import PendingPayment from './ProfilePage/Orders/PendingPayment';
import PendingDelivery from './ProfilePage/Orders/PendingDelivery';
import OrdersPage from './ProfilePage/Orders/OrdersPage';
import PendingReceive from './ProfilePage/Orders/PendingReceive';
import Refund from './ProfilePage/Orders/Refund';
// 导入基础服务相关页面
import Favorites from './ProfilePage/BasicServices/Favorites';
import ShippingAddress from './ProfilePage/BasicServices/ShippingAddress';
import CustomerService from './ProfilePage/BasicServices/CustomerService';
import ChangePassword from './ProfilePage/BasicServices/ChangePassword';
import Settings from './ProfilePage/BasicServices/Settings';
import MyReviews from './ProfilePage/BasicServices/MyReviews';

const { Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const ConsumerHome = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  
  const tabs = [
    {
      key: '/consumer/home',
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
      key: '/consumer/cart',
      label: (
        <div className="tab-item">
          <ShoppingOutlined />
          <span>购物车</span>
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
          <Route path="/consumer/home" element={<HomePage />} />
          <Route path="/consumer_home" element={<Navigate to="/consumer/home" replace />} />
          <Route path="/consumer/flash-sale" element={<FlashSalePage />} />
          <Route path="/consumer/cart" element={<CartPage />} />
          <Route path="/consumer/profile" element={<ProfilePage />} />
          <Route path="/consumer/my/detail" element={<UserDetailPage />} />
          
          {/* 订单中心路由 */}
          <Route path="/consumer/orders/all" element={<OrdersPage />} />
          <Route path="/consumer/orders/pending-payment" element={<PendingPayment />} />
          <Route path="/consumer/orders/pending-delivery" element={<PendingDelivery />} />
          <Route path="/consumer/orders/pending-receive" element={<PendingReceive />} />
          <Route path="/consumer/orders/refund" element={<Refund />} />
          <Route path="/consumer/orders" element={<OrdersPage />} />

          {/* 基础服务路由 */}
          <Route path="/consumer/basic-services/favorites" element={<Favorites />} />
          <Route path="/consumer/basic-services/shipping-address" element={<ShippingAddress />} />
          <Route path="/consumer/basic-services/customer-service" element={<CustomerService />} />
          <Route path="/consumer/basic-services/change-password" element={<ChangePassword />} />
          <Route path="/consumer/basic-services/settings" element={<Settings />} />
          <Route path="/consumer/basic-services/my-reviews" element={<MyReviews />} />
          
          <Route path="/consumer/" element={<Navigate to="home" replace />} />
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