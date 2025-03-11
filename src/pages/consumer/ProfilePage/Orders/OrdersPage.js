import React, { useState, useEffect } from 'react';
import { Typography, Tabs, Card, List, Tag, Space, Button, Empty, message } from 'antd';
import { ShoppingOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { orderNewService } from '../../../../services/orderNewService';
import OrderDetailModal from '../../../../components/OrderDetailModal';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// 订单状态定义
const ORDER_STATUS = {
  UNPAID_NEW: 0,    // 新建未支付
  UNPAID: 1,        // 未支付
  PAID: 2,          // 已支付（待发货）
  SHIPPED: 3,       // 已发货（运输中）
  DELIVERED: 4,     // 已送达（待收货）
  RECEIVED: 5,      // 已收货（完成）
  REFUND_PENDING: 6,    // 退款申请中
  REFUND_APPROVED: 7,   // 退款已批准
  REFUND_REJECTED: 8,   // 退款已拒绝
  REFUNDED: 9,         // 退款成功
};

// 状态标签配置
const STATUS_CONFIG = {
  [ORDER_STATUS.UNPAID_NEW]: { color: 'warning', text: '待付款' },
  [ORDER_STATUS.UNPAID]: { color: 'warning', text: '待付款' },
  [ORDER_STATUS.PAID]: { color: 'processing', text: '已支付' },
  [ORDER_STATUS.SHIPPED]: { color: 'processing', text: '运输中' },
  [ORDER_STATUS.DELIVERED]: { color: 'success', text: '待收货' },
  [ORDER_STATUS.RECEIVED]: { color: 'success', text: '已完成' },
  [ORDER_STATUS.REFUND_PENDING]: { color: 'warning', text: '退款申请中' },
  [ORDER_STATUS.REFUND_APPROVED]: { color: 'processing', text: '退款已批准' },
  [ORDER_STATUS.REFUND_REJECTED]: { color: 'error', text: '退款已拒绝' },
  [ORDER_STATUS.REFUNDED]: { color: 'default', text: '退款成功' },
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
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
        // 过滤掉已删除的订单
        const validOrders = response.data.records.filter(order => order.isDeleted === 0);
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

  // 根据状态筛选订单
  const getFilteredOrders = (status) => {
    if (status === 'all') {
      return orders;
    }
    // 如果是待付款状态，同时显示status为0和1的订单
    if (status === '1') {
      return orders.filter(order => order.orderStatus === 0 || order.orderStatus === 1);
    }
    return orders.filter(order => order.orderStatus === parseInt(status));
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handlePayment = (order) => {
    // 跳转到结算页面，并传递订单信息
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
        style={{ width: '100%', cursor: 'pointer' }}
        bodyStyle={{ padding: '12px' }}
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
          {(order.orderStatus === ORDER_STATUS.UNPAID_NEW || order.orderStatus === ORDER_STATUS.UNPAID) && (
            <Button 
              type="primary" 
              size="small"
              onClick={() => handlePayment(order)}
            >
              去支付
            </Button>
          )}
          {order.orderStatus === ORDER_STATUS.DELIVERED && (
            <Button type="primary" size="small">确认收货</Button>
          )}
        </div>
      </Card>
    </List.Item>
  );

  const tabs = [
    { key: 'all', label: '全部订单' },
    { key: '1', label: `待付款${getFilteredOrders('1').length ? ` (${getFilteredOrders('1').length})` : ''}` },
    { key: '2', label: `已支付${getFilteredOrders('2').length ? ` (${getFilteredOrders('2').length})` : ''}` },
    { key: '3', label: `运输中${getFilteredOrders('3').length ? ` (${getFilteredOrders('3').length})` : ''}` },
    { key: '4', label: `待收货${getFilteredOrders('4').length ? ` (${getFilteredOrders('4').length})` : ''}` },
    { key: '5', label: `已完成${getFilteredOrders('5').length ? ` (${getFilteredOrders('5').length})` : ''}` },
    { key: '6', label: `退款申请${getFilteredOrders('6').length ? ` (${getFilteredOrders('6').length})` : ''}` }
  ];

  return (
    <div style={{ padding: '16px' }}>
      <Title level={4} style={{ marginBottom: '16px' }}>我的订单</Title>
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={tabs}
      />
      <List
        loading={loading}
        dataSource={getFilteredOrders(activeTab)}
        renderItem={renderOrderItem}
        locale={{
          emptyText: <Empty description="暂无订单" />
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

export default OrdersPage;
