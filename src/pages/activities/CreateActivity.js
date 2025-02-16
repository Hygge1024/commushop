import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Button, Card, InputNumber, Table, message, Modal } from 'antd';
import { activityService } from '../../services/activityService';
import { goodsService } from '../../services/goodsService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const CreateActivity = () => {
    const [form] = Form.useForm();
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [productList, setProductList] = useState([]);
    const [productPagination, setProductPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [loading, setLoading] = useState(false);

    // 获取商品列表
    const fetchProducts = async (params = { current: 1, size: 10 }) => {
        try {
            setLoading(true);
            const response = await goodsService.getGoodsList(params);
            if (response.code === 200) {
                setProductList(response.data.records);
                setProductPagination({
                    current: params.current,
                    pageSize: params.size,
                    total: response.data.total
                });
            }
        } catch (error) {
            message.error('获取商品列表失败');
            console.error('获取商品列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // 商品选择的表格列定义
    const columns = [
        {
            title: '商品ID',
            dataIndex: 'productId',
            key: 'productId',
        },
        {
            title: '商品名称',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: '商品原始价格',
            dataIndex: 'originalPrice',
            key: 'originalPrice',
            render: (price) => `¥${price.toFixed(2)}`
        },
        {
            title: '商品团购价格',
            dataIndex: 'groupPrice',
            key: 'groupPrice',
            render: (price) => `¥${price.toFixed(2)}`
        },
        {
            title: '库存',
            dataIndex: 'stock',
            key: 'stock',
        }
    ];

    const handleTableChange = (pagination) => {
        fetchProducts({
            current: pagination.current,
            size: pagination.pageSize
        });
    };

    const onFinish = async (values) => {
        if (selectedProducts.length === 0) {
            message.error('请选择至少一个商品');
            return;
        }

        try {
            const [startTime, endTime] = values.activity_time;
            const activityData = {
                activityName: values.activity_name,
                activityStartTime: startTime.format('YYYY-MM-DDTHH:mm:ss'),
                activityEndTime: endTime.format('YYYY-MM-DDTHH:mm:ss'),
                minGroupSize: values.group_size.min,
                maxGroupSize: values.group_size.max
            };

            const productIds = selectedProducts.map(product => product.productId);
            const response = await activityService.createActivity(activityData, productIds);
            
            if (response.code === 200) {
                message.success('活动创建成功');
                form.resetFields();
                setSelectedProducts([]);
            } else {
                message.error(response.message || '创建失败');
            }
        } catch (error) {
            console.error('创建活动失败:', error);
            message.error('创建活动失败');
        }
    };

    return (
        <Card title="创建新活动">
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 1000 }}
            >
                <Form.Item
                    name="activity_name"
                    label="活动名称"
                    rules={[{ required: true, message: '请输入活动名称' }]}
                >
                    <Input placeholder="请输入活动名称" />
                </Form.Item>

                <Form.Item
                    name="activity_time"
                    label="活动时间"
                    rules={[{ required: true, message: '请选择活动时间' }]}
                >
                    <RangePicker
                        showTime
                        style={{ width: '100%' }}
                        placeholder={['开始时间', '结束时间']}
                    />
                </Form.Item>

                <Form.Item
                    name="group_size"
                    label="成团人数"
                    rules={[{ required: true, message: '请设置成团人数' }]}
                >
                    <Input.Group compact>
                        <Form.Item
                            name={['group_size', 'min']}
                            noStyle
                            rules={[{ required: true, message: '请输入最小成团人数' }]}
                        >
                            <InputNumber
                                style={{ width: 100 }}
                                min={1}
                                placeholder="最小人数"
                            />
                        </Form.Item>
                        <Input
                            style={{ width: 30, borderLeft: 0, borderRight: 0, pointerEvents: 'none' }}
                            placeholder="~"
                            disabled
                        />
                        <Form.Item
                            name={['group_size', 'max']}
                            noStyle
                            rules={[{ required: true, message: '请输入最大成团人数' }]}
                        >
                            <InputNumber
                                style={{ width: 100 }}
                                min={1}
                                placeholder="最大人数"
                            />
                        </Form.Item>
                    </Input.Group>
                </Form.Item>

                <Form.Item
                    label="活动商品"
                    required
                >
                    <div>
                        <Button 
                            type="primary" 
                            style={{ marginBottom: 16 }}
                            onClick={() => setProductModalVisible(true)}
                        >
                            选择商品
                        </Button>
                        <Table
                            columns={columns}
                            dataSource={selectedProducts}
                            rowKey="productId"
                            size="small"
                        />
                    </div>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        创建活动
                    </Button>
                </Form.Item>
            </Form>

            <Modal
                title="选择商品"
                open={productModalVisible}
                onOk={() => setProductModalVisible(false)}
                onCancel={() => setProductModalVisible(false)}
                width={1000}
            >
                <Table
                    columns={columns}
                    dataSource={productList}
                    rowKey="productId"
                    rowSelection={{
                        type: 'checkbox',
                        selectedRowKeys: selectedProducts.map(p => p.productId),
                        onChange: (_, selectedRows) => {
                            setSelectedProducts(selectedRows);
                        }
                    }}
                    pagination={productPagination}
                    onChange={handleTableChange}
                    loading={loading}
                />
            </Modal>
        </Card>
    );
};

export default CreateActivity;