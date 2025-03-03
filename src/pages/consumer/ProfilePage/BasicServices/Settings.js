import React from 'react';
import { Card, List, Switch, Space } from 'antd';
import { BellOutlined, SecurityScanOutlined, NotificationOutlined } from '@ant-design/icons';

const Settings = () => {
  const settings = [
    {
      title: '消息通知',
      description: '接收商品、订单、活动等相关通知',
      icon: <BellOutlined />,
      defaultChecked: true
    },
    {
      title: '安全提醒',
      description: '接收账户安全相关的提醒',
      icon: <SecurityScanOutlined />,
      defaultChecked: true
    },
    {
      title: '营销信息',
      description: '接收优惠、促销等营销信息',
      icon: <NotificationOutlined />,
      defaultChecked: false
    }
  ];

  return (
    <Card title="系统设置">
      <List
        itemLayout="horizontal"
        dataSource={settings}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Switch defaultChecked={item.defaultChecked} />
            ]}
          >
            <List.Item.Meta
              avatar={item.icon}
              title={item.title}
              description={item.description}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default Settings;
