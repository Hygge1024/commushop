import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from '../../utils/axios';
import config from '../../utils/config';
import  api  from '../../services/api';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    const onFinish = async (values) => {
        // try {
        //     const response = await axios.post(config.api.login, null, {
        //         params: {
        //             username: values.username,
        //             password: values.password
        //         }
        //     });

        //     console.log('登录响应:', response.data);

        //     // 登录成功
        //     if (response.data.success) {
        //         message.success('登录成功');
        //         localStorage.setItem('token', response.data.data.token);
        //         localStorage.setItem('username', values.username);
        //         // console.log('登录成功,Token为:', localStorage.getItem('token'));
        //         navigate(from, { replace: true });
        //         return; // 添加return防止继续执行
        //     }

        //     // 登录失败
        //     message.error(response.data.message || '登录失败');

        // } catch (error) {
        //     // 防止页面刷新，需要阻止默认行为
        //     if (error.response) {
        //         // 服务器返回错误
        //         message.error(error.response.data.message || '登录失败');
        //     } else if (error.request) {
        //         // 请求发送失败
        //         message.error('网络连接失败，请检查网络');
        //     } else {
        //         // 其他错误
        //         message.error('登录失败: ' + error.message);
        //     }
        // }
        try {
            const response = await api.post(config.api.login, null, {
                params: {
                    username: values.username,
                    password: values.password
                }
            });

            console.log('登录响应:', response);

            // 登录成功
            if (response.success) {
                message.success('登录成功');
                // 存储 token 和 refresh token
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.setItem('username', values.username);
                navigate(from, { replace: true });
                return; // 添加return防止继续执行
            }

            // 登录失败
            message.error(response.message || '登录失败');

        } catch (error) {
            // 防止页面刷新，需要阻止默认行为
            if (error.response) {
                // 服务器返回错误
                message.error(error.response.data?.message || '登录失败');
            } else if (error.request) {
                // 请求发送失败
                message.error('网络连接失败，请检查网络');
            } else {
                // 其他错误
                message.error('登录失败: ' + error.message);
            }
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: `url('/login.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <Card style={{ width: 400 }}>
                <h2 style={{ textAlign: 'center', marginBottom: 24 }}>CommuShop 登录</h2>
                <Form
                    name="login"
                    onFinish={onFinish}
                    initialValues={{ remember: true }}
                    onFinishFailed={(errorInfo) => {
                        console.log('表单验证失败:', errorInfo);
                    }}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入用户名!' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="用户名"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="密码"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                        >
                            登录
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        还没有账号？ <Link to="/register">立即注册</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login; 