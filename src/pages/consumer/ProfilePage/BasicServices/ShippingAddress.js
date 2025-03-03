import React, { useState } from 'react';
import { Card, List, Button, Modal, Form, Input, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const ShippingAddress = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleAddAddress = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Success:', values);
      setIsModalVisible(false);
      form.resetFields();
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  return (
    <Card 
      title="收货地址"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAddress}>
          新增地址
        </Button>
      }
    >
      <List
        dataSource={[]}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button type="link" icon={<EditOutlined />}>编辑</Button>,
              <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
            ]}
          >
            <List.Item.Meta
              title={item?.name}
              description={`${item?.province} ${item?.city} ${item?.district} ${item?.address}`}
            />
            <div>{item?.phone}</div>
          </List.Item>
        )}
      />

      <Modal
        title="添加收货地址"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="收货人"
            rules={[{ required: true, message: '请输入收货人姓名' }]}
          >
            <Input placeholder="请输入收货人姓名" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号码"
            rules={[
              { required: true, message: '请输入手机号码' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
            ]}
          >
            <Input placeholder="请输入手机号码" />
          </Form.Item>

          <Form.Item
            name="address"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入详细地址" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ShippingAddress;
