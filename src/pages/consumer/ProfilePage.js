import React, { useState, useEffect } from 'react';
import { Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  RightOutlined,
  WalletOutlined,
  ClockCircleOutlined,
  GiftOutlined,
  RedoOutlined,
  StarOutlined,
  EnvironmentOutlined,
  CustomerServiceOutlined,
  SettingOutlined,
  LockOutlined,
  CommentOutlined
} from '@ant-design/icons';
import { userService } from '../../services/userService';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      fetchUserInfo(username);
    }
  }, []);

  const fetchUserInfo = async (username) => {
    try {
      const response = await userService.getUserInfo(username);
      if (response.success) {
        setUserInfo(response.data);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  return (
    <div className="profile-container">
      <div className="user-info">
        <div className="user-header">
          <Avatar 
            size={64} 
            icon={<UserOutlined />} 
            className="user-avatar"
          />
          <div className="user-details">
            <h2 className="user-name">{userInfo?.fullname || '用户'}</h2>
            <p>ID: {userInfo?.username}</p>
          </div>
        </div>
        <div 
          className="profile-edit" 
          onClick={() => navigate('/consumer/my/detail')}
        >
          <RightOutlined style={{ color: 'white' }} />
        </div>
      </div>

      <div className="order-section">
        <div className="section-header">
          <h3>订单中心</h3>
          <span className="view-all" onClick={() => navigate('/consumer/orders/all')}>
            全部 <RightOutlined />
          </span>
        </div>
        <div className="order-types">
          <div className="order-type" onClick={() => navigate('/consumer/orders/pending-payment')}>
            <WalletOutlined />
            <span>待付款</span>
          </div>
          <div className="order-type" onClick={() => navigate('/consumer/orders/pending-delivery')}>
            <ClockCircleOutlined />
            <span>待发货</span>
          </div>
          <div className="order-type" onClick={() => navigate('/consumer/orders/pending-receive')}>
            <GiftOutlined />
            <span>待收货</span>
          </div>
          <div className="order-type" onClick={() => navigate('/consumer/orders/refund')}>
            <RedoOutlined />
            <span>退款</span>
          </div>
        </div>
      </div>

      <div className="service-section">
        <div className="section-header">
          <h3>基础服务</h3>
        </div>
        <div className="service-types">
          <div className="service-type" onClick={() => navigate('/consumer/basic-services/favorites')}>
            <StarOutlined />
            <span>我的收藏</span>
          </div>
          <div className="service-type" onClick={() => navigate('/consumer/basic-services/shipping-address')}>
            <EnvironmentOutlined />
            <span>收货地址</span>
          </div>
          <div className="service-type" onClick={() => navigate('/consumer/basic-services/customer-service')}>
            <CustomerServiceOutlined />
            <span>帮助与客服</span>
          </div>
          <div className="service-type" onClick={() => navigate('/consumer/basic-services/my-reviews')}>
            <CommentOutlined />
            <span>我的评价</span>
          </div>
          <div className="service-type" onClick={() => navigate('/consumer/basic-services/settings')}>
            <SettingOutlined />
            <span>设置</span>
          </div>
          <div className="service-type" onClick={() => navigate('/consumer/basic-services/change-password')}>
            <LockOutlined />
            <span>修改密码</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
