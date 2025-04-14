import React, { useState, useEffect } from 'react';
import { Typography, Card, List, Tag, Space, Button, Empty, message } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { orderNewService } from '../../../../services/orderNewService';
import { chatMessageService } from '../../../../services/chatMessageService';
import OrderDetailModal from '../../../../components/OrderDetailModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// 订单状态定义
const ORDER_STATUS = {
  PAID: 2,        // 已支付（待发货）
};

// 状态标签配置
const STATUS_CONFIG = {
  [ORDER_STATUS.PAID]: { color: 'processing', text: '已支付' },
};

const PendingDelivery = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

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
        // 过滤出未删除的待发货订单
        const validOrders = response.data.records.filter(order => 
          order.isDeleted === 0 && order.orderStatus === ORDER_STATUS.PAID
        );
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

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  // 渲染订单列表项
  const renderOrderItem = (order) => (
    <List.Item>
      <Card 
        style={{ width: '100%', cursor: 'pointer' }}
        styles={{ body: { padding: '12px' } }}
        onClick={() => handleOrderClick(order)}
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
            size="small" 
            onClick={async (e) => {
              e.stopPropagation();
              const userId = localStorage.getItem('userId');
              try {
                await chatMessageService.sendMessage(
                  userId,
                  order.leaderId,
                  `请查看我当前的订单 ${order.orderCode}`
                );
                message.success('消息已发送给团长');
                // 跳转到聊天管理页面
                navigate('/consumer/basic-services/chat-management');
              } catch (error) {
                console.error('发送消息失败:', error);
                message.error('发送消息失败');
              }
            }}
          >联系团长</Button>
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
        <Title level={4} style={{ margin: 0 }}>待发货订单</Title>
      </Space>
      
      <List
        loading={loading}
        dataSource={orders}
        renderItem={renderOrderItem}
        locale={{
          emptyText: <Empty description="暂无待发货订单" />
        }}
      />

      <OrderDetailModal
        visible={detailModalVisible}
        orderCode={selectedOrder?.orderCode}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default PendingDelivery;
