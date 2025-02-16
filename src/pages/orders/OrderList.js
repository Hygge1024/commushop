import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Card, Input, DatePicker, Select, Form, Tag, Modal, Descriptions, List, Typography, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { orderService } from '../../services/orderService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 订单状态配置
const ORDER_STATUS = {
    1: { color: 'red', text: '未支付' },
    2: { color: 'orange', text: '支付中' },
    3: { color: 'gold', text: '待发货' },
    4: { color: 'blue', text: '已发货' },
    5: { color: 'green', text: '已完成' }
};

const OrderList = () => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [orderList, setOrderList] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // 获取订单列表
    const fetchOrders = async (params = {}) => {
        try {
            setLoading(true);
            // 处理日期范围
            const { dateRange, ...restParams } = params;
            const queryParams = {
                ...restParams,
                current: params.current || pagination.current,
                size: params.pageSize || pagination.pageSize,
                startTime: dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
                endTime: dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss')
            };

            const response = await orderService.getOrderList(queryParams);
            if (response.code === 200) {
                const { records, total, current, size } = response.data;
                setOrderList(records);
                setPagination({
                    current: current,
                    pageSize: size,
                    total: total
                });
            } else {
                message.error(response.message || '获取订单列表失败');
            }
        } catch (error) {
            console.error('获取订单列表失败:', error);
            message.error('获取订单列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // 查看详情处理函数
    const showOrderDetail = (record) => {
        setCurrentOrder(record);
        setIsModalVisible(true);
    };

    // 搜索表单提交
    const onFinish = (values) => {
        fetchOrders({
            current: 1,
            ...values
        });
    };

    // 表格变化处理
    const handleTableChange = (pagination, filters, sorter) => {
        fetchOrders({
            current: pagination.current,
            pageSize: pagination.pageSize
        });
    };

    // 重置表单
    const handleReset = () => {
        form.resetFields();
        fetchOrders({
            current: 1,
            pageSize: pagination.pageSize
        });
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
                <div style={{ paddingRight: '8px' }}>
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="订单ID" span={2}>
                            {order.order.orderId}
                        </Descriptions.Item>
                        <Descriptions.Item label="活动名称" span={2}>
                            {order.activity.activityName}
                        </Descriptions.Item>
                        <Descriptions.Item label="用户ID">
                            {order.order.userId}
                        </Descriptions.Item>
                        <Descriptions.Item label="订单状态">
                            <Tag color={ORDER_STATUS[order.order.orderStatus]?.color || 'default'}>
                                {ORDER_STATUS[order.order.orderStatus]?.text || '未知状态'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="订单金额">
                            ¥{order.order.orderAmount.toFixed(2)}
                        </Descriptions.Item>
                        <Descriptions.Item label="创建时间">
                            {dayjs(order.order.createTime).format('YYYY-MM-DD HH:mm:ss')}
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
                                    title={
                                        <Typography.Title level={4} style={{ margin: 0 }}>
                                            {item.productName}
                                        </Typography.Title>
                                    }
                                    description={
                                        <Space direction="vertical" size="middle">
                                            <Space direction="vertical" size={4}>
                                                <Typography.Text>商品ID: {item.productId}</Typography.Text>
                                                <Typography.Text delete>原价: ¥{item.originalPrice.toFixed(2)}</Typography.Text>
                                                <Typography.Text type="danger" strong style={{ fontSize: '16px' }}>
                                                    团购价: ¥{item.groupPrice.toFixed(2)}
                                                </Typography.Text>
                                                <Typography.Text>购买数量: {order.order.quantity}</Typography.Text>
                                                <Typography.Text type="secondary">
                                                    小计: ¥{(item.groupPrice * order.order.quantity).toFixed(2)}
                                                </Typography.Text>
                                            </Space>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                    
                    <div style={{ marginTop: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <Typography.Title level={5} style={{ margin: '0 0 8px' }}>
                            订单金额计算
                        </Typography.Title>
                        <Space direction="vertical" size={4}>
                            {order.products.map(item => (
                                <Typography.Text key={item.productId}>
                                    {item.productName}: ¥{item.groupPrice.toFixed(2)} × {order.order.quantity} = ¥{(item.groupPrice * order.order.quantity).toFixed(2)}
                                </Typography.Text>
                            ))}
                            <Typography.Text type="danger" strong style={{ fontSize: '16px' }}>
                                订单总金额: ¥{order.order.orderAmount.toFixed(2)}
                            </Typography.Text>
                        </Space>
                    </div>
                </div>
            </Modal>
        );
    };

    // 表格列定义
    const columns = [
        {
            title: '订单ID',
            dataIndex: ['order', 'orderId'],
            key: 'orderId',
            width: 120,
        },
        {
            title: '活动名称',
            dataIndex: ['activity', 'activityName'],
            key: 'activityName',
            width: 200,
        },
        {
            title: '用户ID',
            dataIndex: ['order', 'userId'],
            key: 'userId',
            width: 120,
        },
        {
            title: '订单状态',
            dataIndex: ['order', 'orderStatus'],
            key: 'orderStatus',
            width: 120,
            render: (status) => {
                const { color, text } = ORDER_STATUS[status] || { color: 'default', text: '未知状态' };
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: '订单金额',
            dataIndex: ['order', 'orderAmount'],
            key: 'orderAmount',
            width: 120,
            render: (amount) => `¥${amount.toFixed(2)}`,
        },
        {
            title: '订单创建时间',
            dataIndex: ['order', 'createTime'],
            key: 'createTime',
            width: 180,
            render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
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
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Form
                form={form}
                layout="inline"
                onFinish={onFinish}
                style={{ marginBottom: 16 }}
            >
                <Form.Item name="activityName" label="活动名称">
                    <Input placeholder="请输入活动名称" />
                </Form.Item>
                <Form.Item name="userId" label="用户ID">
                    <Input placeholder="请输入用户ID" />
                </Form.Item>
                <Form.Item name="orderStatus" label="订单状态">
                    <Select style={{ width: 120 }} allowClear>
                        {Object.entries(ORDER_STATUS).map(([value, { text }]) => (
                            <Option key={value} value={Number(value)}>{text}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="dateRange" label="创建时间">
                    <RangePicker showTime />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                            查询
                        </Button>
                        <Button onClick={handleReset}>重置</Button>
                    </Space>
                </Form.Item>
            </Form>

            <Table
                columns={columns}
                dataSource={orderList}
                rowKey={record => record.order.orderId}
                pagination={pagination}
                onChange={handleTableChange}
                loading={loading}
            />

            <OrderDetailModal
                visible={isModalVisible}
                order={currentOrder}
                onClose={() => {
                    setIsModalVisible(false);
                    setCurrentOrder(null);
                }}
            />
        </Card>
    );
};

export default OrderList;
