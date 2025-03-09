import React from 'react';
import { Card, List, Tag, Button } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import './LeaderDelivery.css';

const LeaderDelivery = () => {
  // 模拟配送订单数据
  const deliveryOrders = [
    {
      id: 1,
      orderNo: 'DO2025030901',
      status: 'pending',
      address: '上海市浦东新区XX路XX号',
      items: ['商品1', '商品2'],
      time: '2025-03-09 15:00'
    },
    // 可以添加更多订单数据
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
    <div className="leader-delivery">
      <div className="delivery-header">
        <CarOutlined className="delivery-icon" />
        <h2>配送中心</h2>
      </div>

      <Card className="delivery-stats">
        <div className="stats-item">
          <span className="stats-number">12</span>
          <span className="stats-label">待配送</span>
        </div>
        <div className="stats-item">
          <span className="stats-number">5</span>
          <span className="stats-label">配送中</span>
        </div>
        <div className="stats-item">
          <span className="stats-number">28</span>
          <span className="stats-label">已完成</span>
        </div>
      </Card>

      <List
        className="delivery-list"
        itemLayout="horizontal"
        dataSource={deliveryOrders}
        renderItem={(order) => (
          <List.Item
            actions={[
              <Button type="primary" size="small">
                开始配送
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
                  <div>配送地址: {order.address}</div>
                  <div>商品: {order.items.join(', ')}</div>
                  <div>配送时间: {order.time}</div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default LeaderDelivery;
