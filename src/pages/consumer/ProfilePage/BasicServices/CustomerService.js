import React from 'react';
import { Card, List, Typography, Space } from 'antd';
import { CustomerServiceOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const CustomerService = () => {
  const contactMethods = [
    {
      icon: <CustomerServiceOutlined style={{ fontSize: '24px' }} />,
      title: '在线客服',
      description: '工作时间：09:00 - 21:00',
      action: '点击咨询'
    },
    {
      icon: <PhoneOutlined style={{ fontSize: '24px' }} />,
      title: '电话客服',
      description: '400-123-4567',
      action: '点击拨打'
    },
    {
      icon: <MailOutlined style={{ fontSize: '24px' }} />,
      title: '邮件支持',
      description: 'support@example.com',
      action: '发送邮件'
    }
  ];

  return (
    <Card title="帮助与客服">
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={contactMethods}
        renderItem={(item) => (
          <List.Item>
            <Card hoverable>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                {item.icon}
                <Title level={4}>{item.title}</Title>
                <Paragraph>{item.description}</Paragraph>
                <a>{item.action}</a>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default CustomerService;
