import React, { useState } from 'react';
import { Table, Space, Button, Card, Input, DatePicker, Select, Form, Tag, Modal, Descriptions, List, Typography } from 'antd';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrderList = () => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);

    // 查看详情处理函数
    const showOrderDetail = (order) => {
        setCurrentOrder(order);
        setIsModalVisible(true);
    };

    // 详情弹窗
    const OrderDetailModal = ({ visible, order, onClose }) => {
        if (!order) return null;

        return (
            <Modal
                title="订单详细信息"
                open={visible}
                onCancel={onClose}
                footer={[
                    <Button key="close" onClick={onClose}>
                        关闭
                    </Button>
                ]}
                width={800}
                styles={{
                    body: {
                        maxHeight: 'calc(90vh - 200px)',
                        overflowY: 'auto',
                        padding: '24px 24px 0',
                    }
                }}
            >
                <div style={{
                    paddingRight: '8px',
                }}>
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="订单ID" span={2}>
                            {order.order_id}
                        </Descriptions.Item>
                        <Descriptions.Item label="活动编号" span={2}>
                            {order.activity_id}
                        </Descriptions.Item>
                        <Descriptions.Item label="用户名称">
                            {order.user_name}
                        </Descriptions.Item>
                        <Descriptions.Item label="订单状态">
                            <Tag color={
                                order.status === 'paid' ? 'green' :
                                    order.status === 'pending' ? 'orange' :
                                        order.status === 'cancelled' ? 'red' : 'blue'
                            }>
                                {order.status === 'paid' ? '已付款' :
                                    order.status === 'pending' ? '待付款' :
                                        order.status === 'cancelled' ? '已取消' : '已完成'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="订单金额">
                            ¥{order.order_amount.toFixed(2)}
                        </Descriptions.Item>
                        <Descriptions.Item label="创建时间">
                            {order.create_time}
                        </Descriptions.Item>
                    </Descriptions>

                    <Typography.Title level={5} style={{ margin: '24px 0 16px' }}>
                        订单商品列表
                    </Typography.Title>
                    <List
                        bordered
                        dataSource={order.products}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    title={item.name}
                                    description={
                                        <Space direction="vertical">
                                            <span>商品ID: {item.product_id}</span>
                                            <span>单价: ¥{item.price.toFixed(2)}</span>
                                            <span>数量: {item.quantity}</span>
                                        </Space>
                                    }
                                />
                                <div>
                                    小计: ¥{(item.price * item.quantity).toFixed(2)}
                                </div>
                            </List.Item>
                        )}
                    />
                </div>
            </Modal>
        );
    };

    // 表格列定义
    const columns = [
        {
            title: '订单ID',
            dataIndex: 'order_id',
            key: 'order_id',
            width: 120,
        },
        {
            title: '活动名称',
            dataIndex: 'activity_name',
            key: 'activity_name',
            width: 200,
        },
        {
            title: '用户ID',
            dataIndex: 'user_id',
            key: 'user_id',
            width: 120,
        },
        {
            title: '订单状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const statusConfig = {
                    pending: { color: 'orange', text: '待付款' },
                    paid: { color: 'green', text: '已付款' },
                    cancelled: { color: 'red', text: '已取消' },
                    completed: { color: 'blue', text: '已完成' }
                };
                const { color, text } = statusConfig[status] || { color: 'default', text: status };
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: '订单金额',
            dataIndex: 'order_amount',
            key: 'order_amount',
            width: 120,
            render: (amount) => `¥${amount.toFixed(2)}`,
        },
        {
            title: '订单创建时间',
            dataIndex: 'create_time',
            key: 'create_time',
            width: 180,
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => showOrderDetail(record)}>
                        查看详情
                    </Button>
                    <Button type="link" danger>删除</Button>
                </Space>
            ),
        },
    ];

    // 示例数据，增加了详细信息
    const data = [
        {
            key: '1',
            order_id: 'ORD20240101001',
            activity_id: 'ACT001',
            activity_name: '新年特惠团购活动',
            user_id: 'USR001',
            user_name: '张三',
            status: 'paid',
            order_amount: 299.99,
            create_time: '2024-01-01 12:30:00',
            products: [
                {
                    product_id: 'P001',
                    name: '商品A',
                    price: 99.99,
                    quantity: 2
                },
                {
                    product_id: 'P002',
                    name: '商品B',
                    price: 100.01,
                    quantity: 1
                }
            ]
        },
        {
            key: '2',
            order_id: 'ORD20240101002',
            activity_name: '春节团购大促',
            user_id: 'USR002',
            status: 'pending',
            order_amount: 199.99,
            create_time: '2024-01-01 14:20:00',
        },
        // 可以添加更多示例数据...
    ];

    // 搜索表单提交
    const onFinish = (values) => {
        console.log('搜索条件:', values);
    };

    return (
        <Card title="订单查询">
            {/* 搜索表单 */}
            <Form
                form={form}
                layout="inline"
                onFinish={onFinish}
                style={{ marginBottom: 24 }}
            >
                <Form.Item name="order_id" label="订单ID">
                    <Input placeholder="请输入订单ID" />
                </Form.Item>
                <Form.Item name="activity_name" label="活动名称">
                    <Input placeholder="请输入活动名称" />
                </Form.Item>
                <Form.Item name="user_id" label="用户ID">
                    <Input placeholder="请输入用户ID" />
                </Form.Item>
                <Form.Item name="status" label="订单状态">
                    <Select style={{ width: 120 }} placeholder="请选择状态">
                        <Option value="pending">待付款</Option>
                        <Option value="paid">已付款</Option>
                        <Option value="cancelled">已取消</Option>
                        <Option value="completed">已完成</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="date_range" label="创建时间">
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

            {/* 订单列表 */}
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

            {/* 订单详情弹窗 */}
            <OrderDetailModal
                visible={isModalVisible}
                order={currentOrder}
                onClose={() => setIsModalVisible(false)}
            />
        </Card>
    );
};

export default OrderList; 
