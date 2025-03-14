import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button, Row, Col, Statistic, Modal, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import {
  UserOutlined,
  TeamOutlined,
  RiseOutlined,
  ShopOutlined,
  SettingOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import './LeaderProfile.css';

const LeaderProfile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const username = localStorage.getItem('username');
      const response = await userService.getUserInfo(username);
      if (response.code === 200) {
        setUserInfo(response.data);
      }
    } catch (error) {
      message.error('获取用户信息失败');
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 处理修改信息
  const handleUpdateInfo = async (values) => {
    try {
      const response = await userService.updateUserInfo({
        ...values,
        userId: userInfo.userId
      });
      if (response.code === 200) {
        message.success('信息更新成功');
        setIsModalVisible(false);
        fetchUserInfo();
      }
    } catch (error) {
      message.error('更新失败');
    }
  };

  // 处理退出登录
  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      onOk: () => {
        localStorage.clear();
        navigate('/login');
      }
    });
  };

  return (
    <div className="leader-profile">
      <Card className="profile-card">
        <div className="profile-header">
          <Avatar size={64} src={userInfo?.avatar} icon={<UserOutlined />} />
          <div className="profile-info">
            <h2>{userInfo?.fullname || '团长'}</h2>
            <p>ID: {userInfo?.userId}</p>
          </div>
          <Button
            type="link"
            icon={<SettingOutlined />}
            onClick={() => navigate('/consumer/my/detail')}
            className="settings-button"
          >
            设置
          </Button>
        </div>
      </Card>

      <div className="profile-menu">
        <Card>
          <div className="menu-item">
            <BellOutlined />
            <span>消息通知</span>
            <span className="notification-badge">3</span>
          </div>
          <div className="menu-item">
            <SafetyCertificateOutlined />
            <span>账号安全</span>
          </div>
          <div className="menu-item">
            <SettingOutlined />
            <span>系统设置</span>
          </div>
          <div className="menu-item" onClick={handleLogout}>
            <LogoutOutlined />
            <span>退出登录</span>
          </div>
        </Card>
      </div>

      {/* <Card title="团长信息" className="shop-info">
        <p><strong>店铺名称：</strong> {userInfo?.shopName || '未设置'}</p>
        <p><strong>营业时间：</strong> {userInfo?.businessHours || '未设置'}</p>
        <p><strong>联系电话：</strong> {userInfo?.phone || '未设置'}</p>
        <p><strong>店铺地址：</strong> {userInfo?.address || '未设置'}</p>
      </Card> */}

      <Modal
        title="修改信息"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleUpdateInfo}
          initialValues={userInfo}
        >
          <Form.Item name="username" label="用户名">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="店铺地址">
            <Input />
          </Form.Item>
          <Form.Item name="shopName" label="店铺名称">
            <Input />
          </Form.Item>
          <Form.Item name="businessHours" label="营业时间">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaderProfile;
