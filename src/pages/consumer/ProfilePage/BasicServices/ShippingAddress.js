import React, { useState, useEffect } from 'react';
import {
  List,
  Button,
  Modal,
  Form,
  Input,
  message,
  Typography,
  Card,
  Space,
  Empty,
  Cascader
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined
} from '@ant-design/icons';
import { userService } from '../../../../services/userService';
import { useraddressService } from '../../../../services/useraddressService';
import { areaData } from '../../../../utils/areaData'; // 省市区数据
import styles from './ShippingAddress.module.css';

const { Title, Text } = Typography;

const ShippingAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 获取地址列表
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const username = localStorage.getItem('username');
      const response = await userService.getUserDetail(username);
      if (response.code === 200) {
        setAddresses(response.data.userAddresses || []);
      } else {
        message.error(response.message || '获取地址列表失败');
      }
    } catch (error) {
      console.error('获取地址列表失败:', error);
      message.error('获取地址列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // 添加新地址
  const handleAddAddress = async (values) => {
    try {
      const username = localStorage.getItem('username');
      // 构建完整的地址字符串
      const areaString = values.area.join('，');
      const fullAddress = [
        values.fullname,
        values.phone,
        areaString,
        values.detailAddress
      ].join('，');

      const response = await useraddressService.addUserAddress(username, {
        addressDetail: fullAddress
      });

      if (response.code === 200) {
        message.success('添加地址成功');
        form.resetFields();
        setIsModalVisible(false);
        fetchAddresses();
      } else {
        message.error(response.message || '添加地址失败');
      }
    } catch (error) {
      console.error('添加地址失败:', error);
      message.error('添加地址失败');
    }
  };

  // 删除地址
  const handleDeleteAddress = async (addressId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个收货地址吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const username = localStorage.getItem('username');
          const response = await useraddressService.deleteUserAddress(addressId, username);
          if (response.code === 200) {
            message.success('删除地址成功');
            fetchAddresses();
          } else {
            message.error(response.message || '删除地址失败');
          }
        } catch (error) {
          console.error('删除地址失败:', error);
          message.error('删除地址失败');
        }
      }
    });
  };

  // 表单验证规则
  const phoneValidator = (_, value) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!value) {
      return Promise.reject('请输入手机号码');
    }
    if (!phoneRegex.test(value)) {
      return Promise.reject('请输入正确的手机号码');
    }
    return Promise.resolve();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={4}>收货地址管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          添加新地址
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Empty
          description="暂无收货地址"
          className={styles.empty}
        />
      ) : (
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 2,
            xl: 3,
            xxl: 3,
          }}
          dataSource={addresses}
          loading={loading}
          renderItem={(item) => (
            <List.Item>
              <Card
                className={styles.addressCard}
                actions={[
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteAddress(item.addressId)}
                  >
                    删除
                  </Button>
                ]}
              >
                <div className={styles.addressContent}>
                  <Space className={styles.addressIcon}>
                    <EnvironmentOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  </Space>
                  <div className={styles.addressInfo}>
                    <Text className={styles.addressDetail}>{item.addressDetail}</Text>
                    {item.isDefault && (
                      <Text type="secondary" className={styles.defaultTag}>
                        默认地址
                      </Text>
                    )}
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}

      <Modal
        title="添加新地址"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddAddress}
        >
          <Form.Item
            name="fullname"
            label="收件人"
            rules={[
              { required: true, message: '请输入收件人姓名' },
              { max: 20, message: '姓名不能超过20个字符' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder="请输入收件人姓名" 
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号码"
            rules={[
              { validator: phoneValidator }
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="请输入手机号码"
            />
          </Form.Item>

          <Form.Item
            name="area"
            label="所在地区"
            rules={[
              { required: true, message: '请选择所在地区' },
              { type: 'array', message: '请选择完整的地区信息' }
            ]}
          >
            <Cascader
              options={areaData}
              placeholder="请选择省/市/区"
              showSearch={{
                filter: (inputValue, path) => {
                  return path.some(option => {
                    return option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
                  });
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="detailAddress"
            label="详细地址"
            rules={[
              { required: true, message: '请输入详细地址' },
              { max: 100, message: '地址长度不能超过100个字符' }
            ]}
          >
            <Input.TextArea
              placeholder="请输入详细地址，如街道名称、门牌号等"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>

          <Form.Item className={styles.modalFooter}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ShippingAddress;
