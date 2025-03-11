import React, { useState, useEffect } from 'react';
import { Typography, Card, List, Tag, Space, Button, Empty, message, Modal } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { orderNewService } from '../../../../services/orderNewService';
import OrderDetailModal from '../../../../components/OrderDetailModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// 订单状态定义
const ORDER_STATUS = {
  DELIVERED: 4,     // 已送达（待收货）
  RECEIVED: 5,      // 已收货（完成）
};

// 状态标签配置
const STATUS_CONFIG = {
  [ORDER_STATUS.DELIVERED]: { color: 'success', text: '待收货' },
};

const PendingReceive = () => {
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
        // 过滤出未删除的待收货订单
        const validOrders = response.data.records.filter(order => 
          order.isDeleted === 0 && order.orderStatus === ORDER_STATUS.DELIVERED
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

  // 确认收货
  const handleConfirmReceive = (order) => {
    Modal.confirm({
      title: '确认收货',
      content: '确认已收到商品吗？确认后订单将完成。',
      onOk: async () => {
        try {
          const response = await orderNewService.updateOrderStatus({
            orderId: order.orderId,
            orderStatus: ORDER_STATUS.RECEIVED // 已完成
          });
          
          if (response.code === 200) {
            message.success('确认收货成功');
            fetchOrders(); // 刷新订单列表
          } else {
            message.error('确认收货失败');
          }
        } catch (error) {
          console.error('确认收货失败:', error);
          message.error('确认收货失败');
        }
      }
    });
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
          <Button type="primary" size="small" onClick={() => handleConfirmReceive(order)}>
            确认收货
          </Button>
          <Button size="small">查看物流</Button>
          <Button size="small">联系客服</Button>
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
        <Title level={4} style={{ margin: 0 }}>待收货订单</Title>
      </Space>
      
      <List
        loading={loading}
        dataSource={orders}
        renderItem={renderOrderItem}
        locale={{
          emptyText: <Empty description="暂无待收货订单" />
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

export default PendingReceive;
