import React, { useState, useEffect } from 'react';
import { Typography, Card, List, Tag, Space, Button, Empty, message, Modal, Input } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { orderNewService } from '../../../../services/orderNewService';
import OrderDetailModal from '../../../../components/OrderDetailModal';
import { chatMessageService } from '../../../../services/chatMessageService';

import dayjs from 'dayjs';

const { Title, Text, TextArea } = Typography;

// 订单状态定义
const ORDER_STATUS = {
  REFUND_PENDING: 6,    // 退款申请中
  REFUND_APPROVED: 7,   // 退款已批准
  REFUND_REJECTED: 8,   // 退款已拒绝
  REFUNDED: 9,         // 退款成功
};

// 状态标签配置
const STATUS_CONFIG = {
  [ORDER_STATUS.REFUND_PENDING]: { color: 'warning', text: '退款申请中' },
  [ORDER_STATUS.REFUND_APPROVED]: { color: 'processing', text: '退款已批准' },
  [ORDER_STATUS.REFUND_REJECTED]: { color: 'error', text: '退款已拒绝' },
  [ORDER_STATUS.REFUNDED]: { color: 'default', text: '退款成功' },
};

const Refund = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [refundReason, setRefundReason] = useState('');
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
          const response = await orderNewService.updateOrderStatus({
            orderId: order.orderId,
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
          const response = await orderNewService.updateOrderStatus({
            orderId: order.orderId,
            orderStatus: order.previousStatus || 3 // 恢复到之前的状态，默认为运输中
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
          {order.orderStatus === ORDER_STATUS.REFUND_PENDING && (
            <Button size="small" onClick={() => handleCancelRefund(order)}>
              取消退款
            </Button>
          )}
           <Button 
                      size="small" 
                      onClick={async (e) => {
                        e.stopPropagation();
                        const userId = localStorage.getItem('userId');
                        try {
                          await chatMessageService.sendMessage(
                            userId,
                            1,
                            `请查看我当前的订单 ${order.orderCode}`
                          );
                          message.success('消息已发送给管理员');
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
        <Title level={4} style={{ margin: 0 }}>退款订单</Title>
      </Space>
      
      <List
        loading={loading}
        dataSource={orders}
        renderItem={renderOrderItem}
        locale={{
          emptyText: <Empty description="暂无退款订单" />
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

export default Refund;
