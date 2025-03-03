import React, { useEffect, useState } from 'react';
import { Avatar, Dropdown, message } from 'antd';
import { UserOutlined, LogoutOutlined ,CopyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
const UserAvatar = () => {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  
  const fetchUserInfo = async () => {
    try {
      const username = localStorage.getItem('username');
      if (username) {
        const response = await userService.getUserInfo(username);
        if (response.success) {
          setUserInfo(response.data);
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  useEffect(() => {
    fetchUserInfo();

    // 监听用户信息更新事件
    const handleUserInfoUpdate = () => {
      fetchUserInfo();
    };

    window.addEventListener('userInfoUpdate', handleUserInfoUpdate);

    return () => {
      window.removeEventListener('userInfoUpdate', handleUserInfoUpdate);
    };
  }, []);

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
  const handleCopyToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigator.clipboard.writeText(token)
        .then(() => {
          message.success('Token已复制到剪贴板');
        })
        .catch(() => {
          message.error('复制失败，请手动复制');
        });
    } else {
      message.error('未找到Token信息');
    }
  };

  const items = [
    {
      key: 'copyToken',
      icon: <CopyOutlined />,
      label: '复制Token',
      onClick: handleCopyToken,
    },
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
