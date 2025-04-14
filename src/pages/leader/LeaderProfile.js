import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button, Row, Col, Statistic, Modal, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { chatMessageService } from '../../services/chatMessageService';
import {
  UserOutlined,
  TeamOutlined,
  RiseOutlined,
  ShopOutlined,
  SettingOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
  MessageOutlined
} from '@ant-design/icons';
import './LeaderProfile.css';

const LeaderProfile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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

  // 获取未读消息数量
  const fetchUnreadCount = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const response = await chatMessageService.getUnreadCount(userId);
        if (response.success) {
          setUnreadCount(response.data);
        }
      }
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchUnreadCount();
    
    // 每分钟更新一次未读消息数量
    const intervalId = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(intervalId);
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
          <div className="menu-item" onClick={() => navigate('/leader/chat-management')}>
            <MessageOutlined />
            <span>消息管理</span>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
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
