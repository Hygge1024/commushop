import React, { useState, useEffect } from 'react';
import { Modal, List, Typography, Space, Spin, Empty, message, Divider, Card, Tag, Descriptions, Button, Form, Rate, Input } from 'antd';
import { ShoppingCartOutlined, UserOutlined, PhoneOutlined, EnvironmentOutlined, ClockCircleOutlined, StarOutlined } from '@ant-design/icons';
import { orderNewService } from '../services/orderNewService';
import { evaluationService } from '../services/evaluationService';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { TextArea } = Input;

// 订单状态配置
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
  [ORDER_STATUS.REFUNDED]: { color: 'default', text: '退款成功' }
};

const OrderDetailModal = ({ visible, orderCode, onClose, initialOrderInfo }) => {
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderInfo, setOrderInfo] = useState(initialOrderInfo || null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [reviewForm] = Form.useForm();
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  
  // 确保当initialOrderInfo变化时更新orderInfo
  useEffect(() => {
    if (initialOrderInfo) {
      setOrderInfo(initialOrderInfo);
    }
  }, [initialOrderInfo]);

  useEffect(() => {
    if (visible && orderCode) {
      // 只有当没有从父组件传入订单信息时才获取订单详情
      if (!initialOrderInfo) {
        fetchOrderDetails();
      } else {
        // 如果有初始订单信息，只获取订单商品详情
        fetchOrderProductDetails();
      }
    }
  }, [visible, orderCode, initialOrderInfo]);

  // 获取完整的订单详情（包括订单信息和商品列表）
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      let detailsResponse;
      
      // 尝试使用orderNewService.getOrderDetailByOrderId
      try {
        const userId = localStorage.getItem('userId');
        detailsResponse = await orderNewService.getOrderDetailByOrderId({
          orderId: orderCode, // orderCode在这里实际上是orderId
          userId: userId ? parseInt(userId) : undefined,
          current: 1,
          size: 50
        });
        
        if (detailsResponse.code === 200 && detailsResponse.data.records) {
          setOrderDetails(detailsResponse.data.records);
          // 由于这个接口只返回商品信息，我们需要再调用getOrderListDetail获取订单基本信息
          const orderResponse = await orderNewService.getOrderListDetail({
            current: 1,
            size: 1,
            orderCode: orderCode
          });
          
          if (orderResponse.code === 200 && 
              orderResponse.data.records && 
              orderResponse.data.records.length > 0 && 
              orderResponse.data.records[0].order) {
            setOrderInfo(orderResponse.data.records[0].order);
          }
          return; // 如果成功获取到数据，直接返回
        }
      } catch (error) {
        console.log('使用getOrderDetailByOrderId获取失败，尝试使用getOrderListDetail');
      }
      
      // 如果上面的方法失败，回退到使用getOrderListDetail
      const response = await orderNewService.getOrderListDetail({
        current: 1,
        size: 50,
        orderCode: orderCode
      });

      if (response.code === 200 && response.data.records) {
        setOrderDetails(response.data.records);
        // 获取第一条记录的订单基本信息
        if (response.data.records.length > 0 && response.data.records[0].order) {
          const orderData = response.data.records[0].order;
          setOrderInfo(orderData);
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
  
  // 只获取订单的商品详情，不更新订单基本信息
  const fetchOrderProductDetails = async () => {
    try {
      setLoading(true);
      const response = await orderNewService.getOrderListDetail({
        current: 1,
        size: 50,
        orderCode: orderCode
      });

      if (response.code === 200 && response.data.records) {
        setOrderDetails(response.data.records);
        // 不更新orderInfo，保留从父组件传入的订单状态
      } else {
        message.error('获取订单商品详情失败');
      }
    } catch (error) {
      console.error('获取订单商品详情失败:', error);
      message.error('获取订单商品详情失败');
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

  // 打开评价弹窗
  const showReviewModal = (item) => {
    setCurrentProduct(item.product);
    setReviewModalVisible(true);
    reviewForm.resetFields();
  };

  // 处理评价提交
  const handleReviewSubmit = async (values) => {
    try {
      setReviewSubmitting(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        message.warning('请先登录');
        return;
      }

      const reviewData = {
        orderId: orderInfo.orderId, // 使用当前订单ID
        productId: currentProduct.productId,
        userId: parseInt(userId),
        evaluationContent: values.content,
        evaluationScore: values.score * 2 // 转换为10分制
      };

      const response = await evaluationService.addEvaluation(reviewData);
      if (response.code === 200) {
        message.success('评价提交成功');
        setReviewModalVisible(false);
        reviewForm.resetFields();
      } else {
        message.error('评价提交失败');
      }
    } catch (error) {
      console.error('提交评价失败:', error);
      message.error('评价提交失败');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <>
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
                          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary">数量: {item.amount}</Text>
                            <Space>
                              {orderInfo ? (
                                <>
                                  {/* 使用==而不是===，因为可能存在类型不匹配的问题 */}
                                  {orderInfo.orderStatus == ORDER_STATUS.RECEIVED && (
                                    <Button 
                                      type="primary" 
                                      size="small" 
                                      icon={<StarOutlined />}
                                      onClick={() => showReviewModal(item)}
                                    >
                                      评价
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <span>加载中...</span>
                              )}
                              <Text type="danger">小计: ¥{(item.amount * item.product.groupPrice).toFixed(2)}</Text>
                            </Space>
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

      {/* 评价弹窗 */}
      <Modal
        title="评价商品"
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          reviewForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        {currentProduct && (
          <div style={{ marginBottom: 16 }}>
            <Card styles={{ body: { padding: 12 } }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <img 
                  src={currentProduct.imageUrl} 
                  alt={currentProduct.productName}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                />
                <div>
                  <Text strong>{currentProduct.productName}</Text>
                  <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                    {currentProduct.productDesc || '暂无描述'}
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        )}
        <Form
          form={reviewForm}
          onFinish={handleReviewSubmit}
          layout="vertical"
          initialValues={{ score: 5 }}
        >
          <Form.Item
            name="score"
            label="评分"
            rules={[{ required: true, message: '请评分' }]}
          >
            <Rate 
              allowHalf
              style={{ fontSize: 24 }}
            />
          </Form.Item>
          <Form.Item
            name="content"
            label="评价内容"
            rules={[
              { required: true, message: '请填写评价内容' },
              { min: 5, message: '评价内容至少5个字' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="请分享您对商品的使用体验..."
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={reviewSubmitting}
              block
            >
              提交评价
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default OrderDetailModal;
