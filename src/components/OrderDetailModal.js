import React, { useState, useEffect } from 'react';
import { Modal, List, Typography, Space, Spin, Empty, message, Divider, Card, Tag, Descriptions } from 'antd';
import { ShoppingCartOutlined, UserOutlined, PhoneOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { orderNewService } from '../services/orderNewService';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

// 订单状态配置
const ORDER_STATUS = {
  NEW_UNPAID: 0,    // 新建未支付
  UNPAID: 1,        // 未支付
  PAID: 2,          // 已支付（待发货）
  DELIVERED: 3,     // 已发货（待收货）
  REFUND: 4,        // 退款中
  REFUNDED: 5,      // 已退款
  COMPLETED: 6      // 已完成
};

const STATUS_CONFIG = {
  [ORDER_STATUS.NEW_UNPAID]: { color: 'default', text: '新建未支付' },
  [ORDER_STATUS.UNPAID]: { color: 'default', text: '未支付' },
  [ORDER_STATUS.PAID]: { color: 'processing', text: '已支付' },
  [ORDER_STATUS.DELIVERED]: { color: 'warning', text: '待收货' },
  [ORDER_STATUS.REFUND]: { color: 'error', text: '退款中' },
  [ORDER_STATUS.REFUNDED]: { color: 'success', text: '已退款' },
  [ORDER_STATUS.COMPLETED]: { color: 'success', text: '已完成' }
};

const OrderDetailModal = ({ visible, orderCode, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    if (visible && orderCode) {
      fetchOrderDetails();
    }
  }, [visible, orderCode]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderNewService.getOrderListDetail({
        current: 1,
        size: 50,
        orderCode: orderCode
      });

      if (response.code === 200 && response.data.records) {
        setOrderDetails(response.data.records);
        // 获取第一条记录的订单基本信息
        if (response.data.records.length > 0) {
          setOrderInfo(response.data.records[0].order);
        }
      } else {
        message.error('获取订单详情失败');
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
      message.error('获取订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 解析地址信息
  const parseAddress = (address) => {
    if (!address) return { name: '', phone: '', address: '' };
    const parts = address.split('，');
    return {
      name: parts[0] || '',
      phone: parts[1] || '',
      address: parts.slice(2).join('，') || ''
    };
  };

  const renderOrderInfo = () => {
    if (!orderInfo) return null;
    const addressInfo = parseAddress(orderInfo.address);

    return (
      <>
        <Card className="order-info-card" styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Text strong>订单号: {orderInfo.orderCode}</Text>
                <Tag color={STATUS_CONFIG[orderInfo.orderStatus]?.color}>
                  {STATUS_CONFIG[orderInfo.orderStatus]?.text}
                </Tag>
              </Space>
              <Text type="secondary">
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                {dayjs(orderInfo.createTime).format('YYYY-MM-DD HH:mm:ss')}
              </Text>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <Descriptions title="收货信息" column={1} size="small">
              <Descriptions.Item label={<><UserOutlined /> 收货人</>}>
                {addressInfo.name}
              </Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> 联系电话</>}>
                {addressInfo.phone}
              </Descriptions.Item>
              <Descriptions.Item label={<><EnvironmentOutlined /> 收货地址</>}>
                {addressInfo.address}
              </Descriptions.Item>
            </Descriptions>
          </Space>
        </Card>

        <Title level={5} style={{ marginBottom: 16 }}>
          <ShoppingCartOutlined style={{ marginRight: 8 }} />
          商品信息
        </Title>
      </>
    );
  };

  const calculateTotal = () => {
    return orderDetails.reduce((total, item) => 
      total + (item.amount * item.product.groupPrice), 0
    ).toFixed(2);
  };

  return (
    <Modal
      title="订单详情"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      styles={{ 
        body: { 
          maxHeight: '80vh', 
          overflow: 'auto',
          padding: '24px'
        } 
      }}
    >
      <Spin spinning={loading}>
        {orderDetails.length > 0 ? (
          <>
            {renderOrderInfo()}
            
            <List
              dataSource={orderDetails}
              renderItem={item => (
                <List.Item>
                  <Card style={{ width: '100%' }} styles={{ body: { padding: 12 } }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.productName}
                        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text strong>{item.product.productName}</Text>
                          <Space direction="vertical" size={2} align="end">
                            <Text type="secondary" delete style={{ fontSize: '12px' }}>
                              原价: ¥{item.product.originalPrice.toFixed(2)}
                            </Text>
                            <Text type="danger">
                              优惠价: ¥{item.product.groupPrice.toFixed(2)}
                            </Text>
                          </Space>
                        </div>
                        <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                          {item.product.productDesc || '暂无描述'}
                        </Text>
                        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                          <Text type="secondary">数量: {item.amount}</Text>
                          <Text type="danger">小计: ¥{(item.amount * item.product.groupPrice).toFixed(2)}</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />

            <div style={{ 
              marginTop: 16, 
              textAlign: 'right', 
              padding: '16px 0', 
              borderTop: '1px solid #f0f0f0' 
            }}>
              <Space size="large">
                <Text>共 {orderDetails.length} 件商品</Text>
                <Text strong>
                  订单总价: <Text type="danger" style={{ fontSize: 16 }}>¥{calculateTotal()}</Text>
                </Text>
              </Space>
            </div>
          </>
        ) : (
          <Empty description="暂无订单详情" />
        )}
      </Spin>
    </Modal>
  );
};

export default OrderDetailModal;
