import React from 'react';
import { Card, Avatar, Button, Row, Col, Statistic } from 'antd';
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

  return (
    <div className="leader-profile">
      <Card className="profile-card">
        <div className="profile-header">
          <Avatar size={64} icon={<UserOutlined />} />
          <div className="profile-info">
            <h2>团长小xxx</h2>
            <p>ID: 10086username</p>
          </div>
          <Button 
            type="link" 
            icon={<SettingOutlined />}
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
       
        </Card>
      </div>

      <Card title="团长信息" className="shop-info">
        <p><strong>店铺名称：</strong> 优选生活超市</p>
        <p><strong>营业时间：</strong> 08:00 - 22:00</p>
        <p><strong>联系电话：</strong> 021-12345678</p>
        <p><strong>店铺地址：</strong> 上海市浦东新区XX路XX号</p>
      </Card>
    </div>
  );
};

export default LeaderProfile;
