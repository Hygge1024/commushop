import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Card, Input, DatePicker, Select, Form, Modal, Descriptions, message, InputNumber, List, Avatar, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { paymentService } from '../../services/paymentService';
import { orderNewService } from '../../services/orderNewService';
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
    const [currentPayment, setCurrentPayment] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [orderProducts, setOrderProducts] = useState([]);
    const [orderProductsLoading, setOrderProductsLoading] = useState(false);

    useEffect(() => {
        // 管理员查看所有支付记录
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
                size: params.pageSize || pagination.pageSize
            };

            // 管理员可以查看所有用户的支付记录
            // 如果有userId参数，则过滤特定用户的记录
            // 如果没有，则查询所有记录（后端会使用默认值）

            // 处理日期范围
            if (dateRange && dateRange.length === 2) {
                queryParams.startTime = dateRange[0]?.format('YYYY-MM-DD HH:mm:ss');
                queryParams.endTime = dateRange[1]?.format('YYYY-MM-DD HH:mm:ss');
            }

            // 处理空值参数，移除值为空或undefined的参数
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === '' || queryParams[key] === undefined || queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            console.log('查询参数:', queryParams);
            const response = await paymentService.getPaymentPage(queryParams);
            
            if (response.code === 200) {
                const { records, total, current, size } = response.data;
                setPaymentList(records);
                setPagination({
                    current: current,
                    pageSize: size,
                    total: total
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

    // 显示支付详情
    const showPaymentDetail = async (payment) => {
        setCurrentPayment(payment);
        setDetailVisible(true);
        
        // 获取订单商品详情
        if (payment.orderId) {
            setOrderProductsLoading(true);
            try {
                const userId = localStorage.getItem('userId');
                const response = await orderNewService.getOrderDetailByOrderId({
                    orderId: payment.orderId,
                    current: 1,
                    size: 10
                });
                
                if (response && response.data && response.data.records) {
                    setOrderProducts(response.data.records);
                } else {
                    setOrderProducts([]);
                    message.warning('该订单暂无商品详情');
                }
            } catch (error) {
                console.error('获取订单商品详情失败:', error);
                message.error('获取订单商品详情失败');
                setOrderProducts([]);
            } finally {
                setOrderProductsLoading(false);
            }
        }
    };

    // 关闭弹窗
    const handleCancel = () => {
        setDetailVisible(false);
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
        // 将表单值转换为后端接口参数格式
        const params = {
            current: 1,
            orderId: values.orderId ? parseInt(values.orderId) : undefined,
            minAmount: values.minAmount,
            maxAmount: values.maxAmount,
            dateRange: values.dateRange
        };
        
        console.log('提交查询参数:', params);
        fetchPayments(params);
    };

    // 表格变化处理
    const handleTableChange = (pagination, filters, sorter) => {
        fetchPayments({
            current: pagination.current,
            pageSize: pagination.pageSize
        });
    };

    // 详情弹窗
    const PaymentDetailModal = ({ visible, payment, onClose}) => {
        if (!payment) return null;

        return (
            <Modal
                title="支付详情"
                open={visible}
                onCancel={onClose}
                footer={null}
                width={800}
            >
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="支付ID">{payment.paymentId}</Descriptions.Item>
                    <Descriptions.Item label="订单ID">{payment.orderId}</Descriptions.Item>
                    <Descriptions.Item label="支付金额">
                        ¥{payment.paymentAmount ? Number(payment.paymentAmount).toFixed(2) : '0.00'}
                    </Descriptions.Item>
                    <Descriptions.Item label="支付方式">{payment.paymentMethod}</Descriptions.Item>
                    <Descriptions.Item label="支付时间" span={2}>
                        {payment.paymentTime ? dayjs(payment.paymentTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                    </Descriptions.Item>
                </Descriptions>

                <div style={{ marginTop: 24 }}>
                    <h3>订单商品信息</h3>
                    <Spin spinning={orderProductsLoading}>
                        {orderProducts.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={orderProducts}
                                renderItem={item => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar 
                                                    shape="square" 
                                                    size={64} 
                                                    src={item.product.imageUrl}
                                                    alt={item.product.productName}
                                                />
                                            }
                                            title={
                                                <Space>
                                                    <span>{item.product.productName}</span>
                                                    <span style={{ color: '#999' }}>x{item.amount}</span>
                                                </Space>
                                            }
                                            description={
                                                <div>
                                                    <p>{item.product.productDesc}</p>
                                                    <Space>
                                                        <span>单价: ¥{Number(item.product.groupPrice).toFixed(2)}</span>
                                                        <span>小计: ¥{(item.product.groupPrice * item.amount).toFixed(2)}</span>
                                                    </Space>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="暂无商品信息" />
                        )}
                    </Spin>
                </div>
            </Modal>
        );
    };

    // 表格列定义
    const columns = [
        {
            title: '支付ID',
            dataIndex: 'paymentId',
            key: 'paymentId',
            width: 80,
        },
        {
            title: '订单ID',
            dataIndex: 'orderId',
            key: 'orderId',
            width: 80,
        },
        {
            title: '支付金额',
            dataIndex: 'paymentAmount',
            key: 'paymentAmount',
            width: 100,
            render: (amount) => amount ? `¥${Number(amount).toFixed(2)}` : '¥0.00',
        },
        {
            title: '支付方式',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            width: 120,
        },
        {
            title: '支付时间',
            dataIndex: 'paymentTime',
            key: 'paymentTime',
            width: 180,
            render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-',
        },
        {
            title: '操作',
            key: 'action',
            width: 100,
            fixed: 'right',
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <Form.Item name="orderId" label="订单ID">
                        <Input placeholder="请输入订单ID" style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item label="金额范围" style={{ marginBottom: 0 }}>
                        <Input.Group compact>
                            <Form.Item name="minAmount" noStyle>
                                <InputNumber 
                                    placeholder="最小金额" 
                                    style={{ width: 100 }} 
                                    min={0}
                                    precision={2}
                                />
                            </Form.Item>
                            <Input
                                style={{ width: 30, borderLeft: 0, borderRight: 0, pointerEvents: 'none', backgroundColor: '#fff' }}
                                placeholder="~"
                                disabled
                            />
                            <Form.Item name="maxAmount" noStyle>
                                <InputNumber 
                                    placeholder="最大金额" 
                                    style={{ width: 100 }} 
                                    min={0}
                                    precision={2}
                                />
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>
                    <Form.Item name="dateRange" label="支付时间">
                        <RangePicker showTime style={{ width: 380 }} />
                    </Form.Item>
                </div>
                <div>
                    <Form.Item>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                                查询
                            </Button>
                            <Button onClick={handleReset}>重置</Button>
                        </Space>
                    </Form.Item>
                </div>
            </Form>

            <Table
                columns={columns}
                dataSource={paymentList}
                rowKey={record => record.paymentId}
                pagination={pagination}
                onChange={handleTableChange}
                loading={loading}
                scroll={{ x: 1100 }}
            />

            <PaymentDetailModal
                visible={detailVisible}
                payment={currentPayment}
                onClose={handleCancel}
            />
        </Card>
    );
};

export default PaymentList;