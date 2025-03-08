import React, { useState, useEffect } from 'react';
import { Typography, Tabs, Card, List, Tag, Space, Button, Empty, message } from 'antd';
import { ShoppingOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { productOrderService } from '../../../../services/productOrderService';
import { goodsService } from '../../../../services/goodsService';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// 订单状态定义
const ORDER_STATUS = {
  UNPAID_NEW: 0,    // 新建未支付
  UNPAID: 1,        // 未支付
  PAID: 2,          // 已支付（未发货）
  SHIPPED: 3,       // 已发货
  COMPLETED: 4,     // 已完成
  REFUND_PENDING: 5,    // 退款申请中
  REFUND_APPROVED: 6,   // 退款已批准
  REFUND_REJECTED: 7,   // 退款已拒绝
  REFUNDED: 8,         // 已退款
};

// 状态标签配置
const STATUS_CONFIG = {
  [ORDER_STATUS.UNPAID_NEW]: { color: 'warning', text: '未支付' },
  [ORDER_STATUS.UNPAID]: { color: 'warning', text: '未支付' },
  [ORDER_STATUS.PAID]: { color: 'processing', text: '已支付' },
  [ORDER_STATUS.SHIPPED]: { color: 'processing', text: '已发货' },
  [ORDER_STATUS.COMPLETED]: { color: 'success', text: '已完成' },
  [ORDER_STATUS.REFUND_PENDING]: { color: 'processing', text: '退款申请中' },
  [ORDER_STATUS.REFUND_APPROVED]: { color: 'success', text: '退款已批准' },
  [ORDER_STATUS.REFUND_REJECTED]: { color: 'error', text: '退款已拒绝' },
  [ORDER_STATUS.REFUNDED]: { color: 'default', text: '已退款' },
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersWithProducts, setOrdersWithProducts] = useState([]);

  // 获取订单列表
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const userId = parseInt(localStorage.getItem('userId'), 10);
      const response = await productOrderService.getOrderList({
        current: 1,
        size: 50,
        userId: userId
      });

      if (response.code === 200) {
        // 过滤掉已删除的订单
        const validOrders = response.data.records.filter(order => order.isDeleted === 0);
        setOrders(validOrders);
        
        // 获取订单对应的商品信息
        const ordersWithProductDetails = await Promise.all(
          validOrders.map(async (order) => {
            try {
              const productResponse = await goodsService.getGoodsDetail(order.productId);
              return {
                ...order,
                product: productResponse.data || {
                  productName: '商品信息获取失败',
                  imageUrl: ''
                }
              };
            } catch (error) {
              console.error('获取商品详情失败:', error);
              return {
                ...order,
                product: {
                  productName: '商品信息获取失败',
                  imageUrl: ''
                }
              };
            }
          })
        );
        setOrdersWithProducts(ordersWithProductDetails);
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
      return ordersWithProducts;
    }
    // 如果是待付款状态，同时显示status为0和1的订单
    if (status === '1') {
      return ordersWithProducts.filter(order => order.orderStatus === 0 || order.orderStatus === 1);
    }
    return ordersWithProducts.filter(order => order.orderStatus === parseInt(status));
  };

  const handlePayment = (order) => {
    // 跳转到结算页面，并传递订单信息
    navigate('/consumer/checkout', {
      state: {
        selectedItems: [{
          id: order.porderId,
          productId: order.productId,
          name: order.product.productName,
          price: order.totalMoney / order.amount,
          quantity: order.amount,
          image: order.product.imageUrl,
          orderStatus: order.orderStatus,
          totalMoney: order.totalMoney
        }]
      }
    });
  };

  // 渲染订单列表项
  const renderOrderItem = (order) => (
    <List.Item>
      <Card 
        style={{ width: '100%' }}
        bodyStyle={{ padding: '12px' }}
      >
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Text type="secondary">订单号: {order.porderId}</Text>
            <Text type="secondary">{dayjs(order.createTime).format('YYYY-MM-DD HH:mm:ss')}</Text>
          </Space>
          <Tag color={STATUS_CONFIG[order.orderStatus]?.color || 'default'}>
            {STATUS_CONFIG[order.orderStatus]?.text || `状态${order.orderStatus}`}
          </Tag>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <img 
            src={order.product.imageUrl || 'https://via.placeholder.com/100'} 
            alt={order.product.productName}
            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
          />
          <div style={{ flex: 1 }}>
            <Text strong style={{ fontSize: '14px' }}>{order.product.productName}</Text>
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">数量: {order.amount}</Text>
              <Text type="danger" style={{ marginLeft: '12px' }}>
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
          {order.orderStatus === ORDER_STATUS.SHIPPED && (
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
    { key: '3', label: `已发货${getFilteredOrders('3').length ? ` (${getFilteredOrders('3').length})` : ''}` },
    { key: '4', label: `已完成${getFilteredOrders('4').length ? ` (${getFilteredOrders('4').length})` : ''}` },
    { key: '5', label: `退款申请中${getFilteredOrders('5').length ? ` (${getFilteredOrders('5').length})` : ''}` },
    { key: '6', label: `退款已批准${getFilteredOrders('6').length ? ` (${getFilteredOrders('6').length})` : ''}` },
    { key: '7', label: `退款已拒绝${getFilteredOrders('7').length ? ` (${getFilteredOrders('7').length})` : ''}` },
    { key: '8', label: `已退款${getFilteredOrders('8').length ? ` (${getFilteredOrders('8').length})` : ''}` }
  ];

  return (
    <div style={{ padding: '16px' }}>
      <Title level={4} style={{ marginBottom: '16px' }}>我的订单</Title>
      
      <div style={{ 
        backgroundColor: '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: '8px',
        marginBottom: '16px',
        position: 'relative',  
      }}>
        <div style={{
          overflowX: 'auto',  
          overflowY: 'hidden', 
          WebkitOverflowScrolling: 'touch', 
          msOverflowStyle: 'none',  
          scrollbarWidth: 'none',   
          '&::-webkit-scrollbar': { display: 'none' }, 
        }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabs}
            tabBarGutter={24}
            tabBarStyle={{
              margin: '0 2px',  
              borderBottom: 'none',
            }}
          />
        </div>
        <div style={{  
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          backgroundColor: '#f0f0f0'
        }} />
      </div>

      <List
        loading={loading}
        dataSource={getFilteredOrders(activeTab)}
        renderItem={renderOrderItem}
        locale={{
          emptyText: <Empty description="暂无订单" />
        }}
        style={{
          background: '#f5f5f5',
          padding: '8px'
        }}
      />
    </div>
  );
};

export default OrdersPage;
