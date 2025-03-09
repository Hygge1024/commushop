import React from 'react';
import { Card, List, Button, Badge } from 'antd';
import { 
  CustomerServiceOutlined,
  MessageOutlined,
  SolutionOutlined,
  TeamOutlined,
  ShopOutlined
} from '@ant-design/icons';
import './LeaderService.css';

const LeaderService = () => {
  const serviceItems = [
    {
      icon: <MessageOutlined />,
      title: '客户反馈',
      count: 5,
      description: '待处理的客户反馈'
    },
    {
      icon: <SolutionOutlined />,
      title: '订单管理',
      count: 12,
      description: '需要处理的订单问题'
    },
  ];

  const recentMessages = [
    {
      id: 1,
      user: '张三',
      content: '订单配送延迟问题',
      time: '10分钟前',
      status: 'unread'
    },
    {
      id: 2,
      user: '李四',
      content: '商品质量反馈',
      time: '30分钟前',
      status: 'read'
    }
  ];

  return (
    <div className="leader-service">
      <div className="service-header">
        <CustomerServiceOutlined className="service-icon" />
        <h2>服务中心</h2>
      </div>

      <div className="service-grid">
        {serviceItems.map((item, index) => (
          <Card key={index} className="service-card">
            <Badge count={item.count} offset={[-5, 5]}>
              <div className="service-card-content">
                {item.icon}
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </Badge>
          </Card>
        ))}
      </div>

      <Card title="最近消息" className="recent-messages">
        <List
          itemLayout="horizontal"
          dataSource={recentMessages}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" size="small">
                  处理
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="message-title">
                    <span>{item.user}</span>
                    {item.status === 'unread' && (
                      <Badge status="error" />
                    )}
                  </div>
                }
                description={
                  <div className="message-content">
                    <div>{item.content}</div>
                    <small>{item.time}</small>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default LeaderService;
