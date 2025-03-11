import React, { useState, useEffect } from 'react';
import { Typography, Card, List, Tag, Space, Button, Empty, message } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { orderNewService } from '../../../../services/orderNewService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// 订单状态定义
const ORDER_STATUS = {
  UNPAID_NEW: 0,    // 新建未支付
  UNPAID: 1,        // 未支付
};

// 状态标签配置
const STATUS_CONFIG = {
  [ORDER_STATUS.UNPAID_NEW]: { color: 'warning', text: '待付款' },
  [ORDER_STATUS.UNPAID]: { color: 'warning', text: '待付款' },
};

const PendingPayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  // 获取订单列表
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const userId = parseInt(localStorage.getItem('userId'), 10);
      const response = await orderNewService.getOrderList({
        current: 1,
        size: 50,
        userId: userId
      });

      if (response.code === 200) {
        console.log("获取订单列表成功");
        // 过滤出未删除的待付款订单并按创建时间倒序排序
        const validOrders = response.data.records
          .filter(order => order.isDeleted === 0 && (order.orderStatus === 0 || order.orderStatus === 1))
          .sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
        setOrders(validOrders);
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePayment = (order) => {
    // 跳转到结算页面，传递订单信息
    navigate('/consumer/checkout', {
      state: {
        selectedItems: [{
          id: order.orderId,
          orderCode: order.orderCode,
          totalMoney: order.totalMoney,
          orderStatus: order.orderStatus
        }]
      }
    });
  };

  // 渲染订单列表项
  const renderOrderItem = (order) => (
    <List.Item>
      <Card 
        style={{ width: '100%' }}
        styles={{ body: { padding: '12px' } }}
      >
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Text type="secondary">订单号: {order.orderCode}</Text>
            <Text type="secondary">{dayjs(order.createTime).format('YYYY-MM-DD HH:mm:ss')}</Text>
          </Space>
          <Tag color={STATUS_CONFIG[order.orderStatus]?.color || 'default'}>
            {STATUS_CONFIG[order.orderStatus]?.text || `状态${order.orderStatus}`}
          </Tag>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginTop: '8px' }}>
              <Text type="danger" style={{ fontSize: '16px' }}>
                总价: ¥{order.totalMoney.toFixed(2)}
              </Text>
            </div>
            {order.address && (
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  收货地址: {order.address}
                </Text>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button 
            type="primary" 
            size="small"
            onClick={() => handlePayment(order)}
          >
            去支付
          </Button>
        </div>
      </Card>
    </List.Item>
  );

  return (
    <div style={{ padding: '16px' }}>
      <Space style={{ marginBottom: '16px' }} align="center">
        <Button 
          type="link" 
          icon={<ShoppingOutlined />} 
          onClick={() => navigate('/consumer/orders')}
          style={{ padding: 0 }}
        />
        <Title level={4} style={{ margin: 0 }}>待付款订单</Title>
      </Space>
      
      <List
        loading={loading}
        dataSource={orders}
        renderItem={renderOrderItem}
        locale={{
          emptyText: <Empty description="暂无待付款订单" />
        }}
      />
    </div>
  );
};

export default PendingPayment;
