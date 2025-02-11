import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { Layout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  GiftOutlined,
  OrderedListOutlined,
  PayCircleOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import './App.css';
import UserAvatar from './components/UserAvatar';

// 导入页面组件
import Dashboard from './pages/Dashboard'; 
import GoodsList from './pages/goods/GoodsList';//
import Activities from './pages/Activities';//
import Orders from './pages/Orders';//
import Payments from './pages/Payments';//
import Settings from './pages/Settings';//

const { Header, Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        {/* 左侧导航栏 */}
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0
          }}
        >
          <div className="logo" style={{ 
            height: '32px', 
            margin: '16px',
            color: 'white',
            textAlign: 'center',
            fontSize: collapsed ? '14px' : '18px',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}>
            {collapsed ? 'CS' : 'CommuShop'}
          </div>

          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
          >
            {/* 仪表盘菜单项 */}
            <Menu.Item key="1" icon={<DashboardOutlined />}>
              <Link to="/dashboard">仪表盘</Link>
            </Menu.Item>

            {/* 商品管理子菜单 */}
            <Menu.SubMenu key="sub1" icon={<ShoppingOutlined />} title="商品管理">
              <Menu.Item key="2">
                <Link to="/goods/list">商品查询</Link>
              </Menu.Item>
            </Menu.SubMenu>

            <Menu.Item key="3" icon={<GiftOutlined />}>
              <Link to="/activities">活动页</Link>
            </Menu.Item>

            <Menu.Item key="4" icon={<OrderedListOutlined />}>
              <Link to="/orders">订单页</Link>
            </Menu.Item>

            <Menu.Item key="5" icon={<PayCircleOutlined />}>
              <Link to="/payments">支付页</Link>
            </Menu.Item>

            <Menu.Item key="6" icon={<SettingOutlined />}>
              <Link to="/settings">设置页</Link>
            </Menu.Item>

          </Menu>
        </Sider>

        {/* 主要内容区 */}
        <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
          {/* 头部 */}
          <Header style={{ 
            padding: 0, 
            background: colorBgContainer,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* 折叠按钮 */}
            <div style={{ padding: '0 24px' }}>
              {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                className: 'trigger',
                onClick: () => setCollapsed(!collapsed),
              })}
            </div>
            {/* 用户头像 */}
            <div style={{ padding: '0 24px' }}>
              <UserAvatar />
            </div>
          </Header>

          {/* 页面内容容器 */}
          <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <div style={{ padding: 24, background: colorBgContainer }}>
              {/* React Router 的路由配置 */}
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/goods/list" element={<GoodsList />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
