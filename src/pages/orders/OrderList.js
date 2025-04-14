import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Card, Input, DatePicker, Select, Form, Tag, Modal, Descriptions, List, Typography, message, Checkbox } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { orderNewService } from '../../services/orderNewService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 订单状态配置
const ORDER_STATUS = {
    0: { color: 'red', text: '新建未支付' },
    1: { color: 'red', text: '未支付' },
    2: { color: 'orange', text: '已支付' },
    3: { color: 'gold', text: '已发货' },
    4: { color: 'blue', text: '已送达' },
    5: { color: 'green', text: '已收货' },
    6: { color: 'purple', text: '退款申请中' },
    7: { color: 'cyan', text: '退款已批准' },
    8: { color: 'red', text: '退款已拒绝' },
    9: { color: 'default', text: '退款成功' }
};

const OrderList = () => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [orderList, setOrderList] = useState([]);
    const [orderProducts, setOrderProducts] = useState([]);
    const [orderProductsLoading, setOrderProductsLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // 获取订单列表
    const fetchOrders = async (params = {}) => {
        try {
            setLoading(true);
            const queryParams = {
                ...params,
                current: params.current || pagination.current,
                size: params.pageSize || pagination.pageSize
            };

            // 处理空值参数，移除值为空或undefined的参数
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === '' || queryParams[key] === undefined || queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            console.log('查询参数:', queryParams);
            const response = await orderNewService.getOrderList(queryParams);
            
            if (response.code === 200) {
                const { records, total, current, size } = response.data;
                // 调整数据结构以适应表格
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
        // 默认查询所有订单
        fetchOrders();
    }, []);

    // 查看详情处理函数
    const showOrderDetail = async (record) => {
        setCurrentOrder(record);
        setIsModalVisible(true);
        
        // 获取订单商品详情
        if (record && record.orderCode) {
            setOrderProductsLoading(true);
            try {
                const response = await orderNewService.getOrderListDetail({
                    orderCode: record.orderCode
                });
                
                if (response && response.data && response.data.records) {
                    setOrderProducts(response.data.records);
                } else {
                    setOrderProducts([]);
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

    // 搜索表单提交
    const onFinish = (values) => {
        // 将表单值转换为后端接口参数格式
        const params = {
            current: 1,
            userId: values.userId ? parseInt(values.userId) : undefined,
            orderStatus: values.orderStatus !== undefined ? Number(values.orderStatus) : undefined,
            orderId: values.orderId ? parseInt(values.orderId) : undefined,
            leaderId: values.leaderId ? parseInt(values.leaderId) : undefined
        };
        
        console.log('提交查询参数:', params);
        fetchOrders(params);
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
        // 重置后查询所有订单
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
            >
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="订单ID" span={2}>
                        {order.orderId}
                    </Descriptions.Item>
                    <Descriptions.Item label="订单编号" span={2}>
                        {order.orderCode}
                    </Descriptions.Item>
                    <Descriptions.Item label="用户ID">
                        {order.userId}
                    </Descriptions.Item>
                    <Descriptions.Item label="团长ID">
                        {order.leaderId}
                    </Descriptions.Item>
                    <Descriptions.Item label="订单金额">
                        ¥{order.totalMoney ? Number(order.totalMoney).toFixed(2) : '0.00'}
                    </Descriptions.Item>
                    <Descriptions.Item label="订单状态">
                        {ORDER_STATUS[order.orderStatus]?.text || '未知状态'}
                    </Descriptions.Item>
                    <Descriptions.Item label="收货地址" span={2}>
                        {order.address || '无地址信息'}
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">
                        {order.createTime ? dayjs(order.createTime).format('YYYY-MM-DD HH:mm:ss') : '未知'}
                    </Descriptions.Item>
                    <Descriptions.Item label="更新时间">
                        {order.updateTime ? dayjs(order.updateTime).format('YYYY-MM-DD HH:mm:ss') : '未知'}
                    </Descriptions.Item>
                    <Descriptions.Item label="支付时间">
                        {order.payTime ? dayjs(order.payTime).format('YYYY-MM-DD HH:mm:ss') : '未支付'}
                    </Descriptions.Item>
                    <Descriptions.Item label="发货时间">
                        {order.deliveryTime ? dayjs(order.deliveryTime).format('YYYY-MM-DD HH:mm:ss') : '未发货'}
                    </Descriptions.Item>
                    <Descriptions.Item label="送达时间">
                        {order.arriveTime ? dayjs(order.arriveTime).format('YYYY-MM-DD HH:mm:ss') : '未送达'}
                    </Descriptions.Item>
                    <Descriptions.Item label="收货时间">
                        {order.receiveTime ? dayjs(order.receiveTime).format('YYYY-MM-DD HH:mm:ss') : '未收货'}
                    </Descriptions.Item>
                    <Descriptions.Item label="备注" span={2}>
                        {order.remark || '无'}
                    </Descriptions.Item>
                </Descriptions>

                {/* 售后信息 */}
                {order.orderStatus >= 6 && (
                    <div style={{ marginTop: 16 }}>
                        <Typography.Title level={5}>售后信息</Typography.Title>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="退款申请时间">
                                {order.refundApplyTime ? dayjs(order.refundApplyTime).format('YYYY-MM-DD HH:mm:ss') : '未知'}
                            </Descriptions.Item>
                            <Descriptions.Item label="退款处理时间">
                                {order.refundProcessTime ? dayjs(order.refundProcessTime).format('YYYY-MM-DD HH:mm:ss') : '未知'}
                            </Descriptions.Item>
                            <Descriptions.Item label="退款原因" span={2}>
                                {order.refundReason || '无'}
                            </Descriptions.Item>
                            <Descriptions.Item label="处理结果" span={2}>
                                {order.refundResult || '无'}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
                
                {/* 订单商品详情 */}
                <div style={{ marginTop: 16 }}>
                    <Typography.Title level={5}>订单商品详情</Typography.Title>
                    {orderProductsLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <span>加载中...</span>
                        </div>
                    ) : orderProducts.length > 0 ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={orderProducts}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<img src={item.product?.imageUrl} alt={item.product?.productName} style={{ width: 64, height: 64, objectFit: 'cover' }} />}
                                        title={item.product?.productName}
                                        description={
                                            <div>
                                                <p>商品描述: {item.product?.productDesc || '无描述'}</p>
                                                <p>原价: ¥{item.product?.originalPrice?.toFixed(2)}</p>
                                                <p>团购价: ¥{item.product?.groupPrice?.toFixed(2)}</p>
                                            </div>
                                        }
                                    />
                                    <div style={{ marginLeft: 20 }}>
                                        <p>数量: {item.amount}</p>
                                        <p>小计: ¥{(item.amount * item.product?.groupPrice).toFixed(2)}</p>
                                    </div>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                            暂无商品详情
                        </div>
                    )}
                </div>
            </Modal>
        );
    };

    // 表格列定义
    const columns = [
        {
            title: '订单ID',
            dataIndex: 'orderId',
            key: 'orderId',
            width: 80,
        },
        {
            title: '订单编号',
            dataIndex: 'orderCode',
            key: 'orderCode',
            width: 180,
            ellipsis: true,
        },
        {
            title: '用户ID',
            dataIndex: 'userId',
            key: 'userId',
            width: 80,
        },
        {
            title: '团长ID',
            dataIndex: 'leaderId',
            key: 'leaderId',
            width: 80,
        },
        {
            title: '收货地址',
            dataIndex: 'address',
            key: 'address',
            width: 250,
            ellipsis: true,
        },
        {
            title: '订单状态',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            width: 120,
            render: (status) => {
                const { color, text } = ORDER_STATUS[status] || { color: 'default', text: '未知状态' };
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: '订单金额',
            dataIndex: 'totalMoney',
            key: 'totalMoney',
            width: 100,
            render: (amount) => amount ? `¥${Number(amount).toFixed(2)}` : '¥0.00',
        },
        {
            title: '订单创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 180,
            render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '是否删除',
            dataIndex: 'isDeleted',
            key: 'isDeleted',
            width: 100,
            render: (isDeleted) => isDeleted === 0 ? <Tag color="green">正常</Tag> : <Tag color="red">已删除</Tag>,
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <Form.Item name="orderId" label="订单ID">
                        <Input placeholder="请输入订单ID" style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item name="userId" label="用户ID">
                        <Input placeholder="请输入用户ID" style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item name="orderStatus" label="订单状态">
                        <Select style={{ width: 120 }} allowClear>
                            {Object.entries(ORDER_STATUS).map(([value, { text }]) => (
                                <Option key={value} value={Number(value)}>{text}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="leaderId" label="团长ID">
                        <Input placeholder="请输入团长ID" style={{ width: 120 }} />
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
                dataSource={orderList}
                rowKey={record => record.orderId}
                pagination={pagination}
                onChange={handleTableChange}
                loading={loading}
                scroll={{ x: 1200 }}
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
