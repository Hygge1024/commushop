import React, { useState, useEffect } from 'react';
import { Card, List, Button, Typography, Space, Radio, Form, Input, message, Modal, Tabs } from 'antd';
import { ShoppingCartOutlined, EnvironmentOutlined, CreditCardOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { productOrderService } from '../../../services/productOrderService.js';
import { userService } from '../../../services/userService';
import { fixedService } from '../../../services/fixed.js';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const PaymentMethodContent = ({ method }) => {
  if (method === 'wechat') {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <img 
          src="http://8.137.53.253:9000/commoshop/product/wechat_qr.jpg" 
          alt="微信支付二维码" 
          style={{ width: '200px', height: '200px' }}
        />
        <p style={{ marginTop: '10px' }}>请使用微信扫描二维码支付</p>
      </div>
    );
  } else if (method === 'alipay') {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <img 
          src="http://8.137.53.253:9000/commoshop/product/alipay_qr.jpg" 
          alt="支付宝支付二维码" 
          style={{ width: '200px', height: '200px' }}
        />
        <p style={{ marginTop: '10px' }}>请使用支付宝扫描二维码支付</p>
      </div>
    );
  }
  return null;
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fixedPickupPoints, setFixedPickupPoints] = useState([]);
  const [privateAddresses, setPrivateAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('wechat');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    if (location.state?.selectedItems) {
      setSelectedItems(location.state.selectedItems);
    }
    fetchUserAddresses();
    fetchFixedPickupPoints();
    fetchUserInfo();
  }, [location.state]);

  const fetchUserInfo = async () => {
    try {
      const username = localStorage.getItem('username');
      const response = await userService.getUserInfo(username);
      if (response.code === 200) {
        setReceiverInfo({
          name: response.data.fullname || '2',
          phone: response.data.phoneNumber || '1'
        });
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      message.error('获取用户信息失败');
    }
  };

  const fetchUserAddresses = async () => {
    try {
      const username = localStorage.getItem('username');
      const response = await userService.getUserDetail(username);
      if (response.code === 200 && response.data.userAddresses) {
        setPrivateAddresses(response.data.userAddresses.map(addr => {
          const parts = addr.addressDetail.split('，');
          return {
            id: addr.addressId,
            name: parts[0],
            phone: parts[1],
            address: parts.slice(2).join('，')
          };
        }));
      }
    } catch (error) {
      message.error('获取地址列表失败');
    }
  };

  const fetchFixedPickupPoints = async () => {
    try {
      const response = await fixedService.getFixed({
        current: 1,
        size: 10
      });
      if (response.code === 200 && response.data.records) {
        setFixedPickupPoints(response.data.records.map(point => ({
          id: point.locationId,
          address: point.fixedAddress
        })));
      } else {
        message.error('获取固定提货点失败');
      }
    } catch (error) {
      console.error('获取固定提货点失败:', error);
      message.error('获取固定提货点失败');
    }
  };

  const getTotalPrice = () => {
    return selectedItems.reduce((total, item) => total + item.totalMoney, 0).toFixed(2);
  };

  const handleAddressSelect = (address, type) => {
    setSelectedAddress({ ...address, type });
    if (type === 'private') {
      setReceiverInfo({
        name: address.name,
        phone: address.phone
      });
    }
  };

  const handleReceiverInfoChange = (field, value) => {
    setReceiverInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitOrder = async () => {
    if (!selectedAddress) {
      message.warning('请选择收货地址');
      return;
    }

    if (!receiverInfo.name || !receiverInfo.phone) {
      message.warning('请填写收件人信息');
      return;
    }

    // 显示支付弹窗
    setPaymentModalVisible(true);
  };

  const handlePaymentConfirm = async () => {
    try {
      setLoading(true);
      const addressString = `${receiverInfo.name}，${receiverInfo.phone}，${selectedAddress.address}`;

      // 对每个商品进行更新
      const updatePromises = selectedItems.map(item => {
        // Handle both cases: direct porderId from PendingPayment and object from CartPage
        const orderId = typeof item.id === 'object' ? item.id.porderId : item.id;
        
        const orderData = {
          porderId: orderId,
          orderStatus: 2, // 更新为已支付状态
          address: addressString,
          leaderId: 1
        };
        // console.log("当前的商品信息为:" + JSON.stringify(orderData));
        return productOrderService.updateOrderStatus(orderData);
      });

      // 等待所有更新完成
      const results = await Promise.all(updatePromises);
      // 检查是否所有更新都成功
      const hasError = results.some(response => response.code !== 200);

      if (!hasError) {
        setPaymentModalVisible(false);
        message.success('支付成功');
        navigate('/consumer/orders');
      } else {
        message.error('部分订单支付失败，请检查后重试');
      }
    } catch (error) {
      console.error('支付失败:', error);
      message.error('支付失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const renderAddressSelection = () => (
    <Card
      type="inner"
      title={
        <Space>
          <EnvironmentOutlined />
          <span>收货地址</span>
        </Space>
      }
      style={{ marginTop: '16px' }}
    >
      <Tabs defaultActiveKey="pickup">
        <TabPane tab="固定提货点" key="pickup">
          <Radio.Group
            onChange={(e) => handleAddressSelect(e.target.value, 'pickup')}
            value={selectedAddress?.type === 'pickup' ? selectedAddress : null}
          >
            <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '10px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {fixedPickupPoints.slice(0, 5).map(point => (
                  <Radio key={point.id} value={point}>
                    <Text>{point.address}</Text>
                  </Radio>
                ))}
                {fixedPickupPoints.length > 5 && (
                  <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '8px' }}>
                    {fixedPickupPoints.slice(5).map(point => (
                      <Radio key={point.id} value={point} style={{ display: 'block', marginBottom: '8px' }}>
                        <Text>{point.address}</Text>
                      </Radio>
                    ))}
                  </div>
                )}
              </Space>
            </div>
          </Radio.Group>
        </TabPane>
        <TabPane tab="私人地址" key="private">
          <Radio.Group
            onChange={(e) => handleAddressSelect(e.target.value, 'private')}
            value={selectedAddress?.type === 'private' ? selectedAddress : null}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {privateAddresses.map(address => (
                <Radio key={address.id} value={address}>
                  <Text>{address.address}</Text>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </TabPane>
      </Tabs>

      <div style={{ marginTop: '16px', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
        <Title level={5}>收件人信息</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            prefix={<UserOutlined />}
            placeholder="收件人姓名"
            value={receiverInfo.name}
            onChange={(e) => handleReceiverInfoChange('name', e.target.value)}
          />
          <Input
            prefix={<PhoneOutlined />}
            placeholder="手机号码"
            value={receiverInfo.phone}
            onChange={(e) => handleReceiverInfoChange('phone', e.target.value)}
          />
        </Space>
      </div>
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={4}>
            <ShoppingCartOutlined /> 确认订单
          </Title>

          {renderAddressSelection()}

          {/* 商品清单 */}
          <Card
            type="inner"
            title="商品清单"
            style={{ marginTop: '16px' }}
          >
            <List
              itemLayout="horizontal"
              dataSource={selectedItems}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />}
                    title={item.name}
                    description={
                      <Space direction="vertical">
                        <Text>数量：{item.quantity}</Text>
                        <Text type="danger">单价：¥{(item.totalMoney / item.quantity).toFixed(2)}</Text>
                      </Space>
                    }
                  />
                  <div>
                    <Text type="danger">总价：¥{item.totalMoney.toFixed(2)}</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>

          {/* 支付方式 */}
          <Card
            type="inner"
            title={
              <Space>
                <CreditCardOutlined />
                <span>支付方式</span>
              </Space>
            }
            style={{ marginTop: '16px' }}
          >
            <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
              <Space direction="vertical">
                <Radio value="wechat">微信支付</Radio>
                <Radio value="alipay">支付宝支付</Radio>
              </Space>
            </Radio.Group>
          </Card>

          {/* 订单总结 */}
          <Card
            type="inner"
            style={{ marginTop: '16px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>商品总额：</Text>
                <Text>¥{getTotalPrice()}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>运费：</Text>
                <Text>¥0.00</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <Text strong>实付款：</Text>
                <Text type="danger" strong style={{ fontSize: '20px' }}>¥{getTotalPrice()}</Text>
              </div>
            </Space>
          </Card>

          {/* 提交订单 */}
          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <Space>
              <Text>
                合计: <Text type="danger" strong>¥{getTotalPrice()}</Text>
              </Text>
              <Button type="primary" onClick={handleSubmitOrder} loading={loading}>
                提交订单
              </Button>
            </Space>
          </div>

          <Modal
            title="请扫码支付"
            visible={paymentModalVisible}
            onCancel={() => setPaymentModalVisible(false)}
            footer={[
              <Button key="cancel" onClick={() => setPaymentModalVisible(false)}>
                取消
              </Button>,
              <Button key="submit" type="primary" loading={loading} onClick={handlePaymentConfirm}>
                我已支付
              </Button>
            ]}
          >
            <PaymentMethodContent method={paymentMethod} />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Text strong>支付金额：</Text>
              <Text type="danger" strong>¥{getTotalPrice()}</Text>
            </div>
          </Modal>
        </Card>
      </Space>
    </div>
  );
};

export default Checkout;