import React, { useState } from 'react';
import { Table, Space, Button, Card, Input, DatePicker, Select, Form, Tag } from 'antd';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const PaymentList = () => {
    const [form] = Form.useForm();

    // 表格列定义
    const columns = [
        {
            title: '支付ID',
            dataIndex: 'payment_id',
            key: 'payment_id',
            width: 120,
        },
        {
            title: '订单ID',
            dataIndex: 'order_id',
            key: 'order_id',
            width: 120,
        },
        {
            title: '活动ID',
            dataIndex: 'activity_id',
            key: 'activity_id',
            width: 120,
        },
        {
            title: '支付金额',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
            render: (amount) => `¥${amount.toFixed(2)}`,
        },
        {
            title: '支付时间',
            dataIndex: 'payment_time',
            key: 'payment_time',
            width: 180,
        },
        {
            title: '支付方式',
            dataIndex: 'payment_method',
            key: 'payment_method',
            width: 120,
            render: (method) => {
                const methodConfig = {
                    alipay: { color: 'blue', text: '支付宝' },
                    wechat: { color: 'green', text: '微信' },
                    bank: { color: 'orange', text: '银行卡' }
                };
                const { color, text } = methodConfig[method] || { color: 'default', text: method };
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => console.log('查看详情', record)}>
                        查看详情
                    </Button>
                </Space>
            ),
        },
    ];

    // 示例数据
    const data = [
        {
            key: '1',
            payment_id: 'PAY20240101001',
            order_id: 'ORD20240101001',
            activity_id: 'ACT001',
            amount: 299.99,
            payment_time: '2024-01-01 12:30:00',
            payment_method: 'alipay',
        },
        {
            key: '2',
            payment_id: 'PAY20240101002',
            order_id: 'ORD20240101002',
            activity_id: 'ACT002',
            amount: 199.99,
            payment_time: '2024-01-01 14:20:00',
            payment_method: 'wechat',
        },
    ];

    // 搜索表单提交
    const onFinish = (values) => {
        console.log('搜索条件:', values);
    };

    return (
        <Card title="支付查询">
            {/* 搜索表单 */}
            <Form
                form={form}
                layout="inline"
                onFinish={onFinish}
                style={{ marginBottom: 24 }}
            >
                <Form.Item name="payment_id" label="支付ID">
                    <Input placeholder="请输入支付ID" />
                </Form.Item>
                <Form.Item name="order_id" label="订单ID">
                    <Input placeholder="请输入订单ID" />
                </Form.Item>
                <Form.Item name="activity_id" label="活动ID">
                    <Input placeholder="请输入活动ID" />
                </Form.Item>
                <Form.Item name="payment_method" label="支付方式">
                    <Select style={{ width: 120 }} placeholder="请选择支付方式">
                        <Option value="alipay">支付宝</Option>
                        <Option value="wechat">微信</Option>
                        <Option value="bank">银行卡</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="date_range" label="支付时间">
                    <RangePicker showTime />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                            搜索
                        </Button>
                        <Button icon={<DeleteOutlined />} onClick={() => form.resetFields()}>
                            重置
                        </Button>
                    </Space>
                </Form.Item>
            </Form>

            {/* 支付列表 */}
            <Table
                columns={columns}
                dataSource={data}
                pagination={{
                    total: data.length,
                    pageSize: 10,
                    showTotal: (total) => `共 ${total} 条数据`,
                    showSizeChanger: true,
                    showQuickJumper: true,
                }}
                scroll={{ x: 1200 }}
                bordered
            />
        </Card>
    );
};

export default PaymentList; 