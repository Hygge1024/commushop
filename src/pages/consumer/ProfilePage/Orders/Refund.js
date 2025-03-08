import React, { useState, useEffect } from 'react';
import { Typography, Card, List, Tag, Space, Button, Empty, message, Modal, Input } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productOrderService } from '../../../../services/productOrderService';
import { goodsService } from '../../../../services/goodsService';
import dayjs from 'dayjs';

const { Title, Text, TextArea } = Typography;

// 订单状态定义
const ORDER_STATUS = {
  REFUND_PENDING: 5,    // 退款申请中
  REFUND_APPROVED: 6,   // 退款已批准
  REFUND_REJECTED: 7,   // 退款已拒绝
  REFUNDED: 8,         // 已退款
};

// 状态标签配置
const STATUS_CONFIG = {
  [ORDER_STATUS.REFUND_PENDING]: { color: 'processing', text: '退款申请中' },
  [ORDER_STATUS.REFUND_APPROVED]: { color: 'success', text: '退款已批准' },
  [ORDER_STATUS.REFUND_REJECTED]: { color: 'error', text: '退款已拒绝' },
  [ORDER_STATUS.REFUNDED]: { color: 'default', text: '已退款' },
};

const Refund = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersWithProducts, setOrdersWithProducts] = useState([]);
  const [refundReason, setRefundReason] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

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
        // 过滤出未删除的退款相关订单
        const validOrders = response.data.records.filter(order => 
          order.isDeleted === 0 && 
          [
            ORDER_STATUS.REFUND_PENDING,
            ORDER_STATUS.REFUND_APPROVED,
            ORDER_STATUS.REFUND_REJECTED,
            ORDER_STATUS.REFUNDED
          ].includes(order.orderStatus)
        );
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

  // 申请退款
  const handleRefundRequest = (order) => {
    setSelectedOrder(order);
    Modal.confirm({
      title: '申请退款',
      content: (
        <div>
          <p>请输入退款原因：</p>
          <Input.TextArea
            rows={4}
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="请详细描述退款原因"
          />
        </div>
      ),
      onOk: async () => {
        if (!refundReason.trim()) {
          message.error('请输入退款原因');
          return;
        }

        try {
          const response = await productOrderService.updateOrderStatus({
            porderId: order.porderId,
            orderStatus: ORDER_STATUS.REFUND_PENDING,
            refundReason: refundReason
          });
          
          if (response.code === 200) {
            message.success('退款申请已提交');
            setRefundReason('');
            setSelectedOrder(null);
            fetchOrders(); // 刷新订单列表
          } else {
            message.error('退款申请提交失败');
          }
        } catch (error) {
          console.error('退款申请失败:', error);
          message.error('退款申请失败');
        }
      },
      onCancel: () => {
        setRefundReason('');
        setSelectedOrder(null);
      }
    });
  };

  // 取消退款申请
  const handleCancelRefund = (order) => {
    Modal.confirm({
      title: '取消退款申请',
      content: '确定要取消退款申请吗？',
      onOk: async () => {
        try {
          const response = await productOrderService.updateOrderStatus({
            porderId: order.porderId,
            orderStatus: order.previousStatus || ORDER_STATUS.SHIPPED // 恢复到之前的状态，默认为已发货
          });
          
          if (response.code === 200) {
            message.success('已取消退款申请');
            fetchOrders(); // 刷新订单列表
          } else {
            message.error('取消退款申请失败');
          }
        } catch (error) {
          console.error('取消退款申请失败:', error);
          message.error('取消退款申请失败');
        }
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
            {order.refundReason && (
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  退款原因: {order.refundReason}
                </Text>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {order.orderStatus === ORDER_STATUS.REFUND_PENDING && (
            <Button size="small" onClick={() => handleCancelRefund(order)}>
              取消退款
            </Button>
          )}
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
        <Title level={4} style={{ margin: 0 }}>退款订单</Title>
      </Space>
      
      <List
        loading={loading}
        dataSource={ordersWithProducts}
        renderItem={renderOrderItem}
        locale={{
          emptyText: <Empty description="暂无退款订单" />
        }}
        style={{
          background: '#f5f5f5',
          padding: '8px'
        }}
      />
    </div>
  );
};

export default Refund;
