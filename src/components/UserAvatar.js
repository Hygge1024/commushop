import React, { useEffect, useState } from 'react';
import { Avatar, Dropdown, message } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
// import axios from '../utils/axios';
// import config from '../utils/config';
import { userService } from '../services/userService';
const UserAvatar = () => {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username'); // 从登录时保存的信息中获取用户名
    if (username) {
      fetchUserInfo(username);
    }
  }, []);

  // 获取用户信息
  const fetchUserInfo = async (username) => {
    try {
      // const response = await axios.get(`http://localhost:8080/api/userInfo/${username}`);
      console.log('Calling API with params:', username);

      const response = await userService.getUserInfo(username);

      console.log('用户信息响应:', response.data);

      if (response.success) {
        setUserInfo(response.data);
      } else {
        message.error('获取用户信息失败: ' + response.message);
      }
    } catch (error) {
      console.error('获取用户信息错误:', error);
      message.error('获取用户信息失败');
    }
  };

  const handleLogout = () => {
    // 清除所有localStorage数据
    localStorage.clear();
    
    // 清除可能存在的sessionStorage数据
    sessionStorage.clear();
    
    // 触发一个自定义事件通知其他组件
    window.dispatchEvent(new Event('userLogout'));
    message.success('已退出登录');
    navigate('/login');
  };

  const items = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <Avatar
          style={{
            backgroundColor: '#1890ff',
            marginRight: '8px'
          }}
          icon={<UserOutlined />}
        />
        <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
          {userInfo ? userInfo.fullname : '加载中...'}
        </span>
      </div>
    </Dropdown>
  );
};

export default UserAvatar;
