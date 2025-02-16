import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Card, Input, DatePicker, Select, Form, Modal, Descriptions, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { paymentService } from '../../services/paymentService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const PaymentList = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [paymentList, setPaymentList] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentPayment, setCurrentPayment] = useState(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    // 获取支付列表
    const fetchPayments = async (params = {}) => {
        try {
            setLoading(true);
            const { dateRange, ...restParams } = params;
            const queryParams = {
                ...restParams,
                current: params.current || pagination.current,
                size: params.pageSize || pagination.pageSize,
                startTime: dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
                endTime: dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss')
            };

            const response = await paymentService.getPaymentList(queryParams);
            if (response.code === 200) {
                setPaymentList(response.data.records);
                setPagination({
                    current: response.data.current,
                    pageSize: response.data.size,
                    total: response.data.total
                });
            } else {
                message.error(response.message || '获取支付列表失败');
            }
        } catch (error) {
            console.error('获取支付列表失败:', error);
            message.error('获取支付列表失败');
        } finally {
            setLoading(false);
        }
    };

    // 查看详情
    const showPaymentDetail = (record) => {
        setCurrentPayment(record);
        setIsModalVisible(true);
    };

    // 重置表单
    const handleReset = () => {
        form.resetFields();
        fetchPayments({
            current: 1,
            pageSize: pagination.pageSize
        });
    };

    // 表单提交
    const onFinish = (values) => {
        fetchPayments({
            current: 1,
            ...values
        });
    };

    // 表格变化处理
    const handleTableChange = (pagination, filters, sorter) => {
        fetchPayments({
            current: pagination.current,
            pageSize: pagination.pageSize
        });
    };

    // 详情弹窗
    const PaymentDetailModal = ({ visible, payment, onClose }) => {
        if (!payment) return null;

        return (
            <Modal
                title="支付详细信息"
                open={visible}
                onCancel={onClose}
                footer={[
                    <Button key="close" onClick={onClose}>
                        关闭
                    </Button>
                ]}
                width={800}
            >
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="支付ID" span={2}>
                        {payment.payment.paymentId}
                    </Descriptions.Item>
                    <Descriptions.Item label="订单ID">
                        {payment.order.orderId}
                    </Descriptions.Item>
                    <Descriptions.Item label="活动ID">
                        {payment.activity.activityId}
                    </Descriptions.Item>
                    <Descriptions.Item label="支付金额">
                        ¥{payment.payment.paymentAmount.toFixed(2)}
                    </Descriptions.Item>
                    <Descriptions.Item label="支付方式">
                        {payment.payment.paymentMethod}
                    </Descriptions.Item>
                    <Descriptions.Item label="支付时间" span={2}>
                        {dayjs(payment.payment.paymentTime).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                    <Descriptions.Item label="活动名称" span={2}>
                        {payment.activity.activityName}
                    </Descriptions.Item>
                    <Descriptions.Item label="活动时间" span={2}>
                        {dayjs(payment.activity.activityStartTime).format('YYYY-MM-DD HH:mm:ss')} 至 {dayjs(payment.activity.activityEndTime).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                    <Descriptions.Item label="订单数量">
                        {payment.order.quantity}
                    </Descriptions.Item>
                    <Descriptions.Item label="订单创建时间">
                        {dayjs(payment.order.createTime).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                </Descriptions>
            </Modal>
        );
    };

    // 表格列定义
    const columns = [
        {
            title: '支付ID',
            dataIndex: ['payment', 'paymentId'],
            key: 'paymentId',
            width: 120,
        },
        {
            title: '订单ID',
            dataIndex: ['order', 'orderId'],
            key: 'orderId',
            width: 120,
        },
        {
            title: '活动ID',
            dataIndex: ['activity', 'activityId'],
            key: 'activityId',
            width: 120,
        },
        {
            title: '支付金额',
            dataIndex: ['payment', 'paymentAmount'],
            key: 'paymentAmount',
            width: 120,
            render: (amount) => `¥${amount.toFixed(2)}`,
        },
        {
            title: '支付时间',
            dataIndex: ['payment', 'paymentTime'],
            key: 'paymentTime',
            width: 180,
            render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '支付方式',
            dataIndex: ['payment', 'paymentMethod'],
            key: 'paymentMethod',
            width: 120,
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => showPaymentDetail(record)}>
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
                <Form.Item name="paymentId" label="支付ID">
                    <Input placeholder="请输入支付ID" />
                </Form.Item>
                <Form.Item name="orderId" label="订单ID">
                    <Input placeholder="请输入订单ID" />
                </Form.Item>
                <Form.Item name="activityId" label="活动ID">
                    <Input placeholder="请输入活动ID" />
                </Form.Item>
                <Form.Item name="paymentMethod" label="支付方式">
                    <Select style={{ width: 120 }} allowClear>
                        <Option value="微信支付">微信支付</Option>
                        <Option value="支付宝">支付宝</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="dateRange" label="支付时间">
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
                dataSource={paymentList}
                rowKey={record => record.payment.paymentId}
                pagination={pagination}
                onChange={handleTableChange}
                loading={loading}
            />

            <PaymentDetailModal
                visible={isModalVisible}
                payment={currentPayment}
                onClose={() => {
                    setIsModalVisible(false);
                    setCurrentPayment(null);
                }}
            />
        </Card>
    );
};

export default PaymentList;