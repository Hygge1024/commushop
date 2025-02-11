import React, { useEffect, useState } from 'react';
import { Avatar, Dropdown, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../services/userService';

const UserAvatar = () => {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await getUserInfo('john_doe');
      if (response.success) {
        setUserInfo(response.data);
      } else {
        message.error('获取用户信息失败');
      }
    } catch (error) {
      message.error('获取用户信息失败');
    }
  };

  const items = [
    {
      key: '1',
      label: '个人设置',
      onClick: () => navigate('/settings')
    },
    {
      key: '2',
      label: '退出登录',
      onClick: () => {
        // 这里添加退出登录逻辑
        message.success('退出成功');
      }
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
          {userInfo?.fullname || '加载中...'}
        </span>
      </div>
    </Dropdown>
  );
};

export default UserAvatar;
