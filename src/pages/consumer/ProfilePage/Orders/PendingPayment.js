import React, { useState, useEffect } from 'react';
import { Typography, Card, List, Tag, Space, Button, Empty, message } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productOrderService } from '../../../../services/productOrderService';
import { goodsService } from '../../../../services/goodsService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// 订单状态定义
const ORDER_STATUS = {
  UNPAID_NEW: 0,    // 新建未支付
  UNPAID: 1,        // 未支付
};

// 状态标签配置
const STATUS_CONFIG = {
  [ORDER_STATUS.UNPAID_NEW]: { color: 'warning', text: '未支付' },
  [ORDER_STATUS.UNPAID]: { color: 'warning', text: '未支付' },
};

const PendingPayment = () => {
  const navigate = useNavigate();
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
        console.log("获取订单列表成功");
        // 过滤出未删除的待付款订单并按创建时间倒序排序
        const validOrders = response.data.records
          .filter(order => order.isDeleted === 0 && (order.orderStatus === 0 || order.orderStatus === 1))
          .sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
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
        dataSource={ordersWithProducts}
        renderItem={renderOrderItem}
        locale={{
          emptyText: <Empty description="暂无待付款订单" />
        }}
        style={{
          background: '#f5f5f5',
          padding: '8px'
        }}
      />
    </div>
  );
};

export default PendingPayment;
