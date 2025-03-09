import React from 'react';
import { Card, Row, Col, Statistic, List, Tag, Button } from 'antd';
import {
  ShopOutlined,
  RiseOutlined,
  TeamOutlined,
  CarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import './LeaderDashboard.css';

const LeaderDashboard = () => {
  // 模拟数据
  const todayOrders = [
    {
      id: 1,
      orderNo: 'DO2025030901',
      status: 'pending',
      amount: 128.5,
      items: ['商品1 x2', '商品2 x1'],
      time: '15:30'
    },
    {
      id: 2,
      orderNo: 'DO2025030902',
      status: 'delivering',
      amount: 256.0,
      items: ['商品3 x1', '商品4 x2'],
      time: '14:20'
    }
  ];

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: '待配送' },
      delivering: { color: 'blue', text: '配送中' },
      completed: { color: 'green', text: '已完成' }
    };
    const { color, text } = statusMap[status] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  return (
    <div className="leader-dashboard">
      <div className="welcome-header">
        <h2>您好，团长</h2>
        <p>今天是 {new Date().toLocaleDateString()}</p>
      </div>

      <Row gutter={[16, 16]} className="statistics-row">
      <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="累计完成"
              value={405}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="待配送"
              value={45}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="待收货"
              value={12}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="待配送订单"
        extra={<Button type="link">查看全部</Button>}
        className="orders-card"
      >
        <List
          dataSource={todayOrders}
          renderItem={(order) => (
            <List.Item
              actions={[
                <Button type="primary" size="small">
                  处理
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="order-title">
                    <span>订单号: {order.orderNo}</span>
                    {getStatusTag(order.status)}
                  </div>
                }
                description={
                  <div className="order-info">
                    <div>商品: {order.items.join(', ')}</div>
                    <div>金额: ¥{order.amount}</div>
                    <div>时间: {order.time}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Row gutter={[16, 16]} className="summary-row">
        <Col xs={24} sm={12}>
          <Card title="团队概况">
            <Statistic
              title="配送人员"
              value={8}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LeaderDashboard;
