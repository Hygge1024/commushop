import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TabBar } from 'antd-mobile';
import {
  HomeOutlined,
  UserOutlined,
  CarOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import './LeaderLayout.css';

const LeaderLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const tabs = [
    {
      key: '/leader',
      title: '首页',
      icon: <HomeOutlined />,
    },
    {
      key: '/leader/delivery',
      title: '配送中心',
      icon: <CarOutlined />,
    },
    {
      key: '/leader/service',
      title: '服务中心',
      icon: <CustomerServiceOutlined />,
    },
    {
      key: '/leader/profile',
      title: '个人中心',
      icon: <UserOutlined />,
    },
  ];

  const setRouteActive = (value) => {
    navigate(value);
  };

  return (
    <div className="leader-layout">
      <div className="leader-content">
        <Outlet />
      </div>
      <TabBar
        activeKey={pathname}
        onChange={value => setRouteActive(value)}
        className="leader-tab-bar"
      >
        {tabs.map(item => (
          <TabBar.Item
            key={item.key}
            icon={item.icon}
            title={item.title}
          />
        ))}
      </TabBar>
    </div>
  );
};

export default LeaderLayout;
