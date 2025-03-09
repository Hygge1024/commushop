import React, { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { userService } from '../../../../services/userService';

const ChangePassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const { oldPassword, newPassword, confirmPassword } = values;
      const username = localStorage.getItem('username');

      if (!username) {
        message.error('请先登录');
        return;
      }

      const response = await userService.updatePassword({
        username: username,
        oldPassword: oldPassword,
        newPassword: newPassword
      });

      if (response.code === 200) {
        message.success('密码修改成功，请重新登录');
        // 清除登录信息，跳转到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      } else {
        message.error(response.message || '密码修改失败');
      }
    } catch (error) {
      console.error('修改密码错误:', error);
      message.error('密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="修改登录密码">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 400, margin: '0 auto' }}
      >
        <Form.Item
          name="oldPassword"
          label="当前密码"
          rules={[
            { required: true, message: '请输入当前密码' },
            { min: 6, message: '密码长度不能小于6位' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入当前密码"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码长度不能小于6位' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入新密码"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认新密码"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请再次输入新密码"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            确认修改
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePassword;
