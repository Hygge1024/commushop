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
import PageBreadcrumb from './components/PageBreadcrumb';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PrivateRoute from './components/PrivateRoute';

// 导入页面组件
import Dashboard from './pages/Dashboard';
import GoodsList from './pages/goods/GoodsList';//
import Activities from './pages/Activities';//
import Orders from './pages/Orders';//
import Payments from './pages/Payments';//
import Settings from './pages/Settings';//
import ActivityList from './pages/activities/ActivityList';
import CreateActivity from './pages/activities/CreateActivity';
import ActivityStatistics from './pages/activities/ActivityStatistics';
import OrderList from './pages/orders/OrderList';
import OrderStatistics from './pages/orders/OrderStatistics';
import PaymentList from './pages/payments/PaymentList';
import PaymentStatistics from './pages/payments/PaymentStatistics';
import UserList from './pages/users/UserList';
import UserStatistics from './pages/users/UserStatistics';

const { Header, Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Router>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 受保护路由 */}
        <Route path="/*" element={
          <PrivateRoute>
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
                  <Menu.SubMenu key="sub2" icon={<ShoppingOutlined />} title="商品管理">
                    <Menu.Item key="2">
                      <Link to="/goods/list">商品查询</Link>
                    </Menu.Item>
                  </Menu.SubMenu>

                  {/* 活动管理子菜单 */}
                  <Menu.SubMenu key="sub3" icon={<GiftOutlined />} title="活动管理">
                    <Menu.Item key="3-1">
                      <Link to="/activities/list">活动列表</Link>
                    </Menu.Item>
                    <Menu.Item key="3-2">
                      <Link to="/activities/create">创建活动</Link>
                    </Menu.Item>
                    <Menu.Item key="3-3">
                      <Link to="/activities/statistics">活动统计</Link>
                    </Menu.Item>
                  </Menu.SubMenu>

                  <Menu.SubMenu key="sub4" icon={<OrderedListOutlined />} title="订单管理">
                    <Menu.Item key="4-1">
                      <Link to="/orders/list">订单查询</Link>
                    </Menu.Item>
                    <Menu.Item key="4-2">
                      <Link to="/orders/statistics">订单统计</Link>
                    </Menu.Item>
                  </Menu.SubMenu>

                  <Menu.SubMenu key="sub5" icon={<PayCircleOutlined />} title="支付管理">
                    <Menu.Item key="5-1">
                      <Link to="/payments/list">支付查询</Link>
                    </Menu.Item>
                    <Menu.Item key="5-2">
                      <Link to="/payments/statistics">支付统计</Link>
                    </Menu.Item>
                  </Menu.SubMenu>

                  <Menu.SubMenu key="sub6" icon={<SettingOutlined />} title="系统设置">
                    <Menu.Item key="6-1">
                      <Link to="/settings/users">用户查询</Link>
                    </Menu.Item>
                    <Menu.Item key="6-2">
                      <Link to="/settings/user-statistics">用户分析</Link>
                    </Menu.Item>
                  </Menu.SubMenu>

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
                    {/* 添加面包屑导航 */}
                    <PageBreadcrumb />

                    {/* React Router 的路由配置 */}
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/goods/list" element={<GoodsList />} />
                      <Route path="/activities/list" element={<ActivityList />} />
                      <Route path="/activities/create" element={<CreateActivity />} />
                      <Route path="/activities/statistics" element={<ActivityStatistics />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/payments" element={<Payments />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/orders/list" element={<OrderList />} />
                      <Route path="/orders/statistics" element={<OrderStatistics />} />
                      <Route path="/payments/list" element={<PaymentList />} />
                      <Route path="/payments/statistics" element={<PaymentStatistics />} />
                      <Route path="/settings/users" element={<UserList />} />
                      <Route path="/settings/user-statistics" element={<UserStatistics />} />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </div>
                </Content>
              </Layout>
            </Layout>
          </PrivateRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="goods/list" element={<GoodsList />} />
          <Route path="activities/list" element={<ActivityList />} />
          <Route path="activities/create" element={<CreateActivity />} />
          <Route path="activities/statistics" element={<ActivityStatistics />} />
          <Route path="orders" element={<Orders />} />
          <Route path="payments" element={<Payments />} />
          <Route path="settings" element={<Settings />} />
          <Route path="orders/list" element={<OrderList />} />
          <Route path="orders/statistics" element={<OrderStatistics />} />
          <Route path="payments/list" element={<PaymentList />} />
          <Route path="payments/statistics" element={<PaymentStatistics />} />
          <Route path="settings/users" element={<UserList />} />
          <Route path="settings/user-statistics" element={<UserStatistics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
