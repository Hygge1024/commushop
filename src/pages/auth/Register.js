import React from 'react';
import { Form, Input, Button, Card, message, Radio, Select } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import config from '../../utils/config';

const Register = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const response = await axios.post('/api/register', {
                ...values,
                roleId: 1 // 默认角色ID
            });

            if (response.data.success) {
                message.success('注册成功');
                navigate('/login');
            }
        } catch (error) {
            message.error('注册失败: ' + error.message);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f0f2f5'
        }}>
            <Card style={{ width: 400 }}>
                <h2 style={{ textAlign: 'center', marginBottom: 24 }}>CommuShop 注册</h2>
                <Form
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[
                            { required: true, message: '请输入用户名!' },
                            { min: 3, message: '用户名至少3个字符!' }
                        ]}
                    >
                        <Input placeholder="请输入用户名" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="密码"
                        rules={[
                            { required: true, message: '请输入密码!' },
                            { min: 6, message: '密码至少6个字符!' }
                        ]}
                    >
                        <Input.Password placeholder="请输入密码" />
                    </Form.Item>

                    <Form.Item
                        name="fullname"
                        label="姓名"
                        rules={[{ required: true, message: '请输入姓名!' }]}
                    >
                        <Input placeholder="请输入姓名" />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label="手机号"
                        rules={[
                            { required: true, message: '请输入手机号!' },
                            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号!' }
                        ]}
                    >
                        <Input placeholder="请输入手机号" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                            { required: true, message: '请输入邮箱!' },
                            { type: 'email', message: '请输入有效的邮箱地址!' }
                        ]}
                    >
                        <Input placeholder="请输入邮箱" />
                    </Form.Item>

                    <Form.Item
                        name="gender"
                        label="性别"
                        rules={[{ required: true, message: '请选择性别!' }]}
                    >
                        <Radio.Group>
                            <Radio value={1}>男</Radio>
                            <Radio value={0}>女</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            注册
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        已有账号？ <Link to="/login">立即登录</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Register; 