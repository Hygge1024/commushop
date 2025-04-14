import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { Layout, Menu, theme, message ,Spin, Grid, Row, Col } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  GiftOutlined,
  OrderedListOutlined,
  PayCircleOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CustomerServiceOutlined,
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
import CategoryList from './pages/categories/CategoryList';
// import Activities from './pages/Activities';//
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
import ConsumerHome from './pages/consumer/ConsumerHome';
import LeaderHome from './pages/leader/LeaderHome';
import AfterSalesManagement from './pages/aftersales/AfterSalesManagement';
import ChatManagement from './pages/aftersales/ChatManagement';

const { Header, Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  //获取用户角色
  const [roleID, setRoleID] = useState(localStorage.getItem('roleId'));
  console.log("this", roleID);
  const [loading, setLoading] = useState(true);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 初始化和监听角色变化
  useEffect(() => {
    const checkAuth = () => {
      const currentRoleID = localStorage.getItem('roleId');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setRoleID(null);
      } else {
        setRoleID(currentRoleID);
        console.log("角色ID为：", currentRoleID);
        console.log("角色ID类型：", typeof currentRoleID);
        console.log("角色ID === '1':", currentRoleID === '1');
        console.log("角色ID == 1:", currentRoleID == 1);      }
      setLoading(false);
    };

    // 立即执行一次检查
    checkAuth();

    // 监听存储变化（用于多标签页同步）
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

 // 管理员布局
 const AdminLayout = () => (
  <Layout style={{ minHeight: '100vh' }}>
  {/* //           左侧导航栏 */}
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
                  <Menu.Item key="2-1">
                    <Link to="/goods/list">商品查询</Link>
                  </Menu.Item>
                  <Menu.Item key="2-2">
                    <Link to="/goods/categories">类别管理</Link>
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
                  {/* <Menu.Item key="3-3">
                    <Link to="/activities/statistics">活动统计</Link>
                  </Menu.Item> */}
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
                  <Menu.Item key="13">
                    <Link to="/payments/list">支付查询</Link>
                  </Menu.Item>
                  <Menu.Item key="14">
                    <Link to="/payments/statistics">支付统计</Link>
                  </Menu.Item>
                </Menu.SubMenu>

                {/* 售后管理菜单 */}
                <Menu.SubMenu key="sub6" icon={<CustomerServiceOutlined />} title="售后管理">
                  <Menu.Item key="15">
                    <Link to="/aftersales/chat">聊天管理</Link>
                  </Menu.Item>
                  <Menu.Item key="16">
                    <Link to="/aftersales/management">售后处理</Link>
                  </Menu.Item>
                </Menu.SubMenu>

                <Menu.SubMenu key="sub7" icon={<SettingOutlined />} title="用户管理">
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
                    <Route path="/goods/categories" element={<CategoryList />} />
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
                    <Route path="aftersales/management" element={<AfterSalesManagement />} />
                    <Route path="aftersales/chat" element={<ChatManagement />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </Content>
            </Layout>
          </Layout>
);

// 消费者布局
const ConsumerLayout = () => {
  const screens = Grid.useBreakpoint();
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 35%, #64b5f6 70%, #90caf9 100%)',
        padding: '0 24px',
        boxShadow: '0 4px 15px rgba(30, 136, 229, 0.3), 0 2px 5px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1000,
        height: screens.xs ? '56px' : '64px',
      }}>
        <Row justify="space-between" align="middle" style={{ height: '100%' }}>
          <Col flex="auto">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: screens.xs ? '8px' : '24px',
              flexWrap: screens.xs ? 'nowrap' : 'wrap'
            }}>
              <div className="logo" style={{ 
                fontSize: screens.xs ? '18px' : '24px', 
                fontWeight: 'bold',
                color: 'white',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap'
              }}>
                CommuShop
              </div>
              {!screens.xs && (
                <div style={{ 
                  fontSize: screens.sm ? '14px' : '18px',
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  whiteSpace: 'nowrap'
                }}>
                  共享品质生活 · 让社区更美好
                </div>
              )}
            </div>
          </Col>
          <Col>
            <UserAvatar />
          </Col>
        </Row>
      </Header>
      <Content style={{ marginTop: screens.xs ? '56px' : '64px' }}>
        <ConsumerHome />
      </Content>
    </Layout>
  );
};

// 团长布局
const LeaderLayout = () => {
  const screens = Grid.useBreakpoint();
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 35%, #64b5f6 70%, #90caf9 100%)',
        padding: '0 24px',
        boxShadow: '0 4px 15px rgba(30, 136, 229, 0.3), 0 2px 5px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1000,
        height: screens.xs ? '56px' : '64px',
      }}>
        <Row justify="space-between" align="middle" style={{ height: '100%' }}>
          <Col flex="auto">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: screens.xs ? '8px' : '24px',
              flexWrap: screens.xs ? 'nowrap' : 'wrap'
            }}>
              <div className="logo" style={{ 
                fontSize: screens.xs ? '18px' : '24px', 
                fontWeight: 'bold',
                color: 'white',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap'
              }}>
                CommuShop
              </div>
              {!screens.xs && (
                <div style={{ 
                  fontSize: screens.sm ? '14px' : '18px',
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  whiteSpace: 'nowrap'
                }}>
                  共享品质生活 · 让社区更美好
                </div>
              )}
            </div>
          </Col>
          <Col>
            <UserAvatar />
          </Col>
        </Row>
      </Header>
      <Content style={{ marginTop: screens.xs ? '56px' : '64px' }}>
        <LeaderHome />
      </Content>
    </Layout>
  );
};

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }
  return (
    <Router>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 受保护路由 */}
        <Route path="/*" element={
          <PrivateRoute>
            {/* {getLayoutByRole()} */}
            {roleID === '1' && <AdminLayout />}
            {roleID === '2' && <ConsumerLayout />}
            {roleID === '3' && <LeaderLayout />}
            {!roleID && <Navigate to="/login" replace />}
          </PrivateRoute>
        }>

          {/* <Route path="dashboard" element={<Dashboard />} />
          <Route path="goods/list" element={<GoodsList />} />
          <Route path="goods/categories" element={<CategoryList />} />
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
          <Route path="aftersales/management" element={<AfterSalesManagement />} />
          <Route path="aftersales/chat" element={<ChatManagement />} />
          <Route path="settings/users" element={<UserList />} />
          <Route path="settings/user-statistics" element={<UserStatistics />} />
          <Route path="consumer_home" element={<ConsumerHome />} />
          <Route path="leader_home" element={<LeaderHome />} /> */}

        </Route>
          {/* 404 路由 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

    </Router>
  );
}

export default App;
