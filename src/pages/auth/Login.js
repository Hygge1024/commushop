import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import config from '../../utils/config';
import  api  from '../../services/api';
import  {userService}  from '../../services/userService';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // const from = location.state?.from?.pathname || '/dashboard';

    const onFinish = async (values) => {
        console.log("开始登录");
        try {
             // 清理之前的登录状态
             localStorage.clear();
             sessionStorage.clear();
             console.log("开始提交");
            const response = await api.post(config.api.login, null, {
                params: {
                    username: values.username,
                    password: values.password
                }
            });
            console.log("提交结束？");
            console.log('登录响应:', response);

            // 登录成功
            if (response.success) {
                message.success('登录成功');
                // 存储 token 和 refresh token
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.setItem('username', values.username);

                //获取用户详情(进行身份判断)
                try{
                    // console.log("开始进行身份认证");
                    const userResponse = await userService.getUserDetail(values.username);
                    // console.log("用户认证结束");
                    const roleID = userResponse.data.role.roleId;
                    console.log("当前用户:"+values.username+"的角色ID是"+roleID);
                     // 保存用户角色ID
                    localStorage.setItem('roleId', roleID.toString());
               
                    switch(roleID){
                        case 1:
                            navigate('/dashboard', { replace: true });
                            window.location.reload();
                            break;
                        case 2:
                            navigate('/consumer_home', { replace: true });
                            window.location.reload();
                            console.log("消费者首页");
                            break;
                        case 3:
                            navigate('/leader_home', { replace: true });
                            window.location.reload();
                            break;
                        default:
                            console.error("您没有权限登录:未知的用户角色");
                            break;
                    }
                    if (!roleID) {
                        message.error('获取用户角色失败');
                        return;
                    }
                    // 统一跳转到根路由，让App.js根据roleID处理具体跳转
                    navigate('/', { replace: true });
                }catch{
                    message.error('获取用户信息失败');
                    console.error('获取用户信息失败');
                }

                // 跳转到主页
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