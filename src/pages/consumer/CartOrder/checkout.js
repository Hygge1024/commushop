import React, { useState, useEffect } from 'react';
import { Card, List, Button, Typography, Space, Radio, Form, Input, message, Modal, Tabs } from 'antd';
import { ShoppingCartOutlined, EnvironmentOutlined, CreditCardOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderNewService } from '../../../services/orderNewService';
import { userService } from '../../../services/userService';
import { fixedService } from '../../../services/fixed.js';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
// 添加新的状态
// const [leaders, setLeaders] = useState([]);
// const [selectedLeader, setSelectedLeader] = useState(null);

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
  const [leaders, setLeaders] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
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
      // 获取订单详情
      const orderCode = location.state.selectedItems[0].orderCode;
      if (orderCode) {
        fetchOrderDetails(orderCode);
      }
    }
    fetchUserAddresses();
    fetchFixedPickupPoints();
    fetchUserInfo();
    fetchLeaders(); // 添加这行
  }, [location.state]);
  // 添加获取团长列表的函数
  const fetchLeaders = async () => {
    try {
      const response = await userService.getUserDetails(); // 获取所有用户
      if (response.code === 200) {
        // 筛选角色ID为3的用户作为团长
        const leadersList = response.data.filter(user => user.role.roleId === 3);
        setLeaders(leadersList);
      }
    } catch (error) {
      console.error('获取团长列表失败:', error);
      message.error('获取团长列表失败');
    }
  };
  const fetchOrderDetails = async (orderCode) => {
    try {
      const response = await orderNewService.getOrderListDetail({
        current: 1,
        size: 10,
        orderCode: orderCode
      });

      if (response.code === 200 && response.data.records) {
        setOrderDetails(response.data.records);
      } else {
        message.error('获取订单详情失败');
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
      message.error('获取订单详情失败');
    }
  };

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

  const handleAddressSelect = (id, type) => {
    // 根据类型和ID找到完整的地址对象
    const address = type === 'pickup'
      ? fixedPickupPoints.find(point => point.id === id)
      : privateAddresses.find(addr => addr.id === id);

    if (address) {
      setSelectedAddress({ ...address, type });
      if (type === 'private') {
        setReceiverInfo({
          name: address.name,
          phone: address.phone
        });
      }
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

    if (!selectedLeader) {
      message.warning('请选择配送团长');
      return;
    }

    // 显示支付弹窗
    setPaymentModalVisible(true);
  };

  const handlePaymentConfirm = async () => {
    try {
      setLoading(true);
      const addressString = `${receiverInfo.name}，${receiverInfo.phone}，${selectedAddress.address}`;

      // 获取订单信息
      const order = selectedItems[0];
      console.log(order);
      // 更新订单状态
      const orderData = {
        orderId: order.id, // 订单ID
        orderStatus: 2, // 已支付状态
        address: addressString,
        leaderId: selectedLeader, // 添加团长ID
        totalMoney: parseFloat(order.totalMoney || 0)
      };

      const response = await orderNewService.updateOrderStatus(orderData);

      if (response.code === 200) {
        setPaymentModalVisible(false);
        message.success('支付成功');
        // 支付成功后跳转到订单列表页面
        navigate('/consumer/orders');
      } else {
        message.error('支付失败，请稍后重试');
      }
    } catch (error) {
      console.error('支付失败:', error);
      message.error(error.message || '支付失败，请稍后重试');
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
            value={selectedAddress?.id}
          >
            <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '10px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {fixedPickupPoints.slice(0, 5).map(point => (
                  <Radio key={point.id} value={point.id}>
                    <Text>{point.address}</Text>
                  </Radio>
                ))}
                {fixedPickupPoints.length > 5 && (
                  <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '8px' }}>
                    {fixedPickupPoints.slice(5).map(point => (
                      <Radio key={point.id} value={point.id} style={{ display: 'block', marginBottom: '8px' }}>
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
            value={selectedAddress?.id}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {privateAddresses.map(address => (
                <Radio key={address.id} value={address.id}>
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
          {/* 添加团长选择 */}
          <div style={{ marginTop: '16px' }}>
            <Title level={5}>配送团长</Title>
            <Radio.Group
              onChange={(e) => setSelectedLeader(e.target.value)}
              value={selectedLeader}
            >
              <Space direction="vertical">
                {leaders.map(leader => (
                  <Radio key={leader.user.userId} value={leader.user.userId}>
                    <Space>
                      <Text>{leader.user.fullname}</Text>
                      <Text type="secondary">{leader.user.phoneNumber}</Text>
                    </Space>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>
        </Space>
      </div>
    </Card>
  );

  const renderOrderDetails = () => (
    <Card title="订单商品详情">
      {orderDetails.length > 0 ? (
        <List
          dataSource={orderDetails}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<img src={item.product.imageUrl} alt={item.product.productName} style={{ width: 80, height: 80, objectFit: 'cover' }} />}
                title={item.product.productName}
                description={
                  <Space direction="vertical">
                    <Text>数量: {item.amount}</Text>
                    <Text>单价: ¥{item.product.groupPrice.toFixed(2)}</Text>
                  </Space>
                }
              />
              <div>
                <Text type="danger">¥{(item.amount * item.product.groupPrice).toFixed(2)}</Text>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <List
          dataSource={selectedItems}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={`订单号: ${item.orderCode}`}
                description={
                  <Space direction="vertical">
                    <Text>总金额: ¥{item.totalMoney.toFixed(2)}</Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
      <div style={{ textAlign: 'right', marginTop: '16px' }}>
        <Text strong>总计: </Text>
        <Text type="danger" style={{ fontSize: '18px' }}>¥{getTotalPrice()}</Text>
      </div>
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Title level={4}>
          <Space>
            <ShoppingCartOutlined />
            确认订单
          </Space>
        </Title>

        {renderOrderDetails()}

        {renderAddressSelection()}

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

        <div style={{ textAlign: 'right', marginTop: '24px' }}>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleSubmitOrder}
          >
            立即支付
          </Button>
        </div>

        <Modal
          title="扫码支付"
          visible={paymentModalVisible}
          onCancel={() => setPaymentModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setPaymentModalVisible(false)}>
              取消
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={handlePaymentConfirm}
            >
              确认已支付
            </Button>
          ]}
        >
          <PaymentMethodContent method={paymentMethod} />
        </Modal>
      </Space>
    </div>
  );
};

export default Checkout;