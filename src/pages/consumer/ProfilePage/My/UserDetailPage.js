import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Avatar, Card, Radio } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  IdcardOutlined,
  LeftOutlined 
} from '@ant-design/icons';
import { userService } from '../../../../services/userService';
import { useNavigate } from 'react-router-dom';
import './UserDetailPage.css';

const UserDetailPage = () => {
  const [form] = Form.useForm();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      fetchUserInfo(username);
    }
  }, []);

  const fetchUserInfo = async (username) => {
    try {
      setLoading(true);
      const response = await userService.getUserInfo(username);
      console.log("用户详情", response);
      if (response.success) {
        const userData = response.data;
        setUserInfo(userData);
        form.setFieldsValue({
          userId: userData.userId,
          username: userData.username,
          fullname: userData.fullname,
          phoneNumber: userData.phoneNumber,
          email: userData.email,
          gender: userData.gender,
          createdTime: userData.createdTime
        });
      } else {
        message.error('获取用户信息失败: ' + response.message);
      }
    } catch (error) {
      console.error('获取用户信息错误:', error);
      message.error('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // 保持 userId 和 username 不变
      const updatedValues = {
        ...values,
        userId: userInfo.userId,
        username: userInfo.username,
        createdTime: userInfo.createdTime
      };
      const response = await userService.updateUserInfo(updatedValues);
      if (response.success) {
        message.success('更新成功');
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        // 重新获取用户信息以更新 UserAvatar 显示
        const username = localStorage.getItem('username');
        // 触发用户信息更新事件
        window.dispatchEvent(new Event('userInfoUpdate'));

        navigate(-1);
      } else {
        message.error('更新失败: ' + response.message);
      }
    } catch (error) {
      console.error('更新用户信息错误:', error);
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="user-detail-container">
      <div className="back-button" onClick={() => navigate(-1)}>
        <LeftOutlined /> 返回
      </div>
      <Card className="user-detail-card">
        <div className="user-detail-header">
          <Avatar size={80} icon={<UserOutlined />} src={userInfo?.avatar} />
          <h2>{userInfo?.fullname || '用户信息'}</h2>
          <p className="user-id">用户账号: {userInfo?.username}</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="user-detail-form"
        >
          <Form.Item
            name="username"
            label="用户名"
          >
            <Input prefix={<UserOutlined />} disabled />
          </Form.Item>

          <Form.Item
            name="fullname"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="性别"
          >
            <Radio.Group>
              <Radio value={1}>男</Radio>
              <Radio value={0}>女</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="注册时间"
          >
            <Input value={formatDate(userInfo?.createdTime)} disabled />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UserDetailPage;
