import React, { useState, useEffect, useCallback } from 'react';
import { 
    Table, Space, Button, Card, Input, DatePicker, Form, Tag, message, 
    Modal, Descriptions, List, InputNumber, Select, Popconfirm
} from 'antd';
import { 
    SearchOutlined, DeleteOutlined, PlusOutlined, 
    MinusCircleOutlined, EditOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { activityService } from '../../services/activityService';
import { goodsService } from '../../services/goodsService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const ActivityList = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        size: 10,
        total: 0
    });
    const [searchParams, setSearchParams] = useState({
        activityCode: '',
        activityName: '',
        startTime: null,
        endTime: null
    });
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [currentActivity, setCurrentActivity] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [removedProducts, setRemovedProducts] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [editForm] = Form.useForm();

    // 表格列定义
    const columns = [
        {
            title: '活动编码',
            dataIndex: ['activity', 'activityCode'],
            key: 'activityCode',
            width: 180,
        },
        {
            title: '活动名称',
            dataIndex: ['activity', 'activityName'],
            key: 'activityName',
            width: 200,
        },
        {
            title: '活动状态',
            key: 'status',
            width: 120,
            render: (_, record) => {
                const now = dayjs();
                const startTime = dayjs(record.activity.activityStartTime);
                const endTime = dayjs(record.activity.activityEndTime);
                
                let status;
                if (now.isBefore(startTime)) {
                    status = { color: 'orange', text: '待开始' };
                } else if (now.isAfter(endTime)) {
                    status = { color: 'red', text: '已结束' };
                } else {
                    status = { color: 'green', text: '进行中' };
                }
                
                return <Tag color={status.color}>{status.text}</Tag>;
            },
        },
        {
            title: '开始时间',
            dataIndex: ['activity', 'activityStartTime'],
            key: 'activityStartTime',
            width: 180,
            render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
        },
        {
            title: '结束时间',
            dataIndex: ['activity', 'activityEndTime'],
            key: 'activityEndTime',
            width: 180,
            render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
        },
        {
            title: '参与商品',
            dataIndex: 'products',
            key: 'products',
            width: 200,
            render: (products) => (
                <Space direction="vertical">
                    {products?.map((product) => (
                        <Tag key={product.productId}>
                            {product.productName}
                        </Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleView(record)}>
                        查看详情
                    </Button>
                    <Button type="link" onClick={() => handleEdit(record)}>
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这个活动吗？"
                        description="删除后无法恢复，请谨慎操作。"
                        onConfirm={() => handleDelete(record)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" danger>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // 获取活动列表数据
    const fetchData = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const response = await activityService.getActivityList({
                current: params.current || pagination.current,
                size: params.pageSize || pagination.size,
                activityCode: searchParams.activityCode,
                activityName: searchParams.activityName,
                startTime: searchParams.startTime,
                endTime: searchParams.endTime
            });

            if (response.code === 200 && response.data) {
                setData(response.data.records);
                setPagination({
                    current: response.data.current,
                    size: response.data.size,
                    total: response.data.total
                });
            } else {
                message.error(response.message || '获取活动列表失败');
            }
        } catch (error) {
            console.error('获取活动列表失败:', error);
            message.error('获取活动列表失败');
        }
        setLoading(false);
    }, [pagination.current, pagination.size, searchParams]);

    // 首次加载和搜索参数变化时获取数据
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 表格分页、排序、筛选变化时的回调
    const handleTableChange = (newPagination, filters, sorter) => {
        fetchData({
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        });
    };

    // 搜索表单提交
    const onFinish = (values) => {
        const { dateRange, ...otherValues } = values;
        const newSearchParams = {
            ...otherValues,
            startTime: dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss') || null,
            endTime: dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss') || null,
        };
        setSearchParams(newSearchParams);
        setPagination(prev => ({ ...prev, current: 1 })); // 重置到第一页
    };

    // 查看详情
    const handleView = (record) => {
        setCurrentActivity(record);
        setViewModalVisible(true);
    };

    // 编辑活动
    const handleEdit = (record) => {
        setEditingActivity(record);
        setRemovedProducts([]);
        setSelectedProducts(record.products.map(p => p.productId));
        
        // 设置表单初始值
        editForm.setFieldsValue({
            activityName: record.activity.activityName,
            activityTime: [
                dayjs(record.activity.activityStartTime),
                dayjs(record.activity.activityEndTime)
            ],
            minGroupSize: record.activity.minGroupSize,
            maxGroupSize: record.activity.maxGroupSize
        });

        fetchAvailableProducts();
        setEditModalVisible(true);
    };

    // 从活动中移除商品
    const handleRemoveProduct = (productId) => {
        setRemovedProducts([...removedProducts, productId]);
        setSelectedProducts(selectedProducts.filter(id => id !== productId));
    };

    // 添加商品到活动
    const handleAddProduct = (productId) => {
        if (!selectedProducts.includes(productId)) {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    // 保存活动更新
    const handleSaveEdit = async () => {
        try {
            const values = await editForm.validateFields();
            const [startTime, endTime] = values.activityTime;

            // 构建更新数据
            const updateData = {
                activityId: editingActivity.activity.activityId,
                activityCode: editingActivity.activity.activityCode,
                activityName: values.activityName,
                activityStartTime: startTime.format('YYYY-MM-DDTHH:mm:ss'),
                activityEndTime: endTime.format('YYYY-MM-DDTHH:mm:ss'),
                minGroupSize: values.minGroupSize,
                maxGroupSize: values.maxGroupSize,
                productIds: selectedProducts
            };

            // 先移除需要删除的商品
            for (const productId of removedProducts) {
                await activityService.removeProductFromActivity(
                    editingActivity.activity.activityCode,
                    productId
                );
            }

            // 更新活动信息
            const response = await activityService.updateActivity(updateData);
            if (response.code === 200) {
                message.success('活动更新成功');
                setEditModalVisible(false);
                fetchData(); // 刷新列表
            } else {
                message.error(response.message || '更新失败');
            }
        } catch (error) {
            console.error('更新活动失败:', error);
            message.error('更新活动失败');
        }
    };

    // 获取可选商品列表
    const fetchAvailableProducts = async () => {
        try {
            const response = await goodsService.getGoodsList({
                current: 1,
                size: 100
            });
            if (response.code === 200) {
                setAvailableProducts(response.data.records);
            }
        } catch (error) {
            message.error('获取商品列表失败');
        }
    };

    // 删除活动
    const handleDelete = async (record) => {
        try {
            const response = await activityService.deleteActivity(record.activity.activityId);
            if (response.code === 200) {
                message.success('活动删除成功');
                fetchData(); // 刷新列表
            } else {
                message.error(response.message || '删除失败');
            }
        } catch (error) {
            console.error('删除活动失败:', error);
            message.error('删除活动失败');
        }
    };

    return (
        <Card title="活动列表">
            {/* 搜索表单 */}
            <Form
                form={form}
                layout="inline"
                onFinish={onFinish}
                style={{ marginBottom: 24 }}
            >
                <Form.Item name="activityCode" label="活动编码">
                    <Input placeholder="请输入活动编码" />
                </Form.Item>
                <Form.Item name="activityName" label="活动名称">
                    <Input placeholder="请输入活动名称" />
                </Form.Item>
                <Form.Item name="dateRange" label="活动时间">
                    <RangePicker
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                    />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                            搜索
                        </Button>
                        <Button icon={<DeleteOutlined />} onClick={() => {
                            form.resetFields();
                            setSearchParams({
                                activityCode: '',
                                activityName: '',
                                startTime: null,
                                endTime: null
                            });
                        }}>
                            重置
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/activities/create')}
                        >
                            新建活动
                        </Button>
                    </Space>
                </Form.Item>
            </Form>

            {/* 活动列表 */}
            <Table
                columns={columns}
                dataSource={data}
                pagination={{
                    ...pagination,
                    showTotal: (total) => `共 ${total} 条数据`,
                    showSizeChanger: true,
                    showQuickJumper: true,
                }}
                onChange={handleTableChange}
                loading={loading}
                scroll={{ x: 1200 }}
                bordered
                rowKey={(record) => record.activity.activityId}
            />

            {/* 活动详情弹窗 */}
            <Modal
                title="活动详情"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        关闭
                    </Button>
                ]}
                width={900}
                bodyStyle={{
                    maxHeight: 'calc(100vh - 300px)',
                    overflowY: 'auto',
                    paddingRight: '20px'
                }}
            >
                {currentActivity && (
                    <div style={{ paddingRight: '4px' }}>
                        <Descriptions title="活动信息" bordered column={2}>
                            <Descriptions.Item label="活动编码">
                                {currentActivity.activity.activityCode}
                            </Descriptions.Item>
                            <Descriptions.Item label="活动名称">
                                {currentActivity.activity.activityName}
                            </Descriptions.Item>
                            <Descriptions.Item label="开始时间">
                                {dayjs(currentActivity.activity.activityStartTime).format('YYYY-MM-DD HH:mm:ss')}
                            </Descriptions.Item>
                            <Descriptions.Item label="结束时间">
                                {dayjs(currentActivity.activity.activityEndTime).format('YYYY-MM-DD HH:mm:ss')}
                            </Descriptions.Item>
                            <Descriptions.Item label="最小成团人数">
                                {currentActivity.activity.minGroupSize}
                            </Descriptions.Item>
                            <Descriptions.Item label="最大成团人数">
                                {currentActivity.activity.maxGroupSize}
                            </Descriptions.Item>
                            <Descriptions.Item label="活动状态" span={2}>
                                {(() => {
                                    const now = dayjs();
                                    const startTime = dayjs(currentActivity.activity.activityStartTime);
                                    const endTime = dayjs(currentActivity.activity.activityEndTime);
                                    
                                    let status;
                                    if (now.isBefore(startTime)) {
                                        status = { color: 'orange', text: '待开始' };
                                    } else if (now.isAfter(endTime)) {
                                        status = { color: 'red', text: '已结束' };
                                    } else {
                                        status = { color: 'green', text: '进行中' };
                                    }
                                    
                                    return <Tag color={status.color}>{status.text}</Tag>;
                                })()}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: '24px' }}>
                            <h3>参与商品列表</h3>
                            <List
                                itemLayout="horizontal"
                                dataSource={currentActivity.products}
                                renderItem={product => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                product.imageUrl ? (
                                                    <img 
                                                        src={product.imageUrl} 
                                                        alt={product.productName}
                                                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '4px' }}
                                                    />
                                                ) : null
                                            }
                                            title={<span style={{ fontSize: '16px', fontWeight: 500 }}>{product.productName}</span>}
                                            description={
                                                <div style={{ marginTop: '8px' }}>
                                                    {product.productDesc}
                                                </div>
                                            }
                                        />
                                        <div>
                                            <Space direction="vertical" align="end">
                                                <div>
                                                    <Tag color="red">原价: ¥{product.originalPrice.toFixed(2)}</Tag>
                                                    <Tag color="green">团购价: ¥{product.groupPrice.toFixed(2)}</Tag>
                                                </div>
                                                <div>
                                                    <Tag color="blue">库存: {product.stockQuantity}</Tag>
                                                </div>
                                            </Space>
                                        </div>
                                    </List.Item>
                                )}
                                style={{
                                    marginTop: '16px'
                                }}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            {/* 编辑活动弹窗 */}
            <Modal
                title="编辑活动"
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onOk={handleSaveEdit}
                width={900}
                bodyStyle={{
                    maxHeight: 'calc(100vh - 300px)',
                    overflowY: 'auto',
                    paddingRight: '20px'
                }}
            >
                {editingActivity && (
                    <Form
                        form={editForm}
                        layout="vertical"
                    >
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <Tag>活动编码: {editingActivity.activity.activityCode}</Tag>
                            </div>
                            
                            <Form.Item
                                label="活动名称"
                                name="activityName"
                                rules={[{ required: true, message: '请输入活动名称' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="活动时间"
                                name="activityTime"
                                rules={[{ required: true, message: '请选择活动时间' }]}
                            >
                                <RangePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>

                            <Space style={{ display: 'flex', marginBottom: '16px' }}>
                                <Form.Item
                                    label="最小成团人数"
                                    name="minGroupSize"
                                    rules={[{ required: true, message: '请输入最小成团人数' }]}
                                >
                                    <InputNumber min={1} />
                                </Form.Item>

                                <Form.Item
                                    label="最大成团人数"
                                    name="maxGroupSize"
                                    rules={[{ required: true, message: '请输入最大成团人数' }]}
                                >
                                    <InputNumber min={1} />
                                </Form.Item>
                            </Space>
                        </div>

                        <div>
                            <h3>活动商品</h3>
                            <List
                                dataSource={editingActivity.products.filter(
                                    p => !removedProducts.includes(p.productId)
                                )}
                                renderItem={product => (
                                    <List.Item
                                        actions={[
                                            <Popconfirm
                                                title="确定要移除该商品吗？"
                                                onConfirm={() => handleRemoveProduct(product.productId)}
                                            >
                                                <Button 
                                                    type="link" 
                                                    danger
                                                    icon={<MinusCircleOutlined />}
                                                >
                                                    移除
                                                </Button>
                                            </Popconfirm>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.productName}
                                                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                                                    />
                                                ) : null
                                            }
                                            title={product.productName}
                                            description={
                                                <Space>
                                                    <Tag color="red">原价: ¥{product.originalPrice.toFixed(2)}</Tag>
                                                    <Tag color="green">团购价: ¥{product.groupPrice.toFixed(2)}</Tag>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />

                            <div style={{ marginTop: '16px' }}>
                                <h4>添加商品</h4>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="选择要添加的商品"
                                    onChange={handleAddProduct}
                                    value={null}
                                >
                                    {availableProducts
                                        .filter(p => !selectedProducts.includes(p.productId))
                                        .map(product => (
                                            <Select.Option 
                                                key={product.productId} 
                                                value={product.productId}
                                            >
                                                {product.productName} - ¥{product.groupPrice}
                                            </Select.Option>
                                        ))
                                    }
                                </Select>

                                {/* 新增的已选商品展示区域 */}
                                {selectedProducts.length > 0 && (
                                    <div style={{ marginTop: '16px' }}>
                                        <h4>新选择的商品</h4>
                                        <List
                                            size="small"
                                            dataSource={availableProducts.filter(p => 
                                                selectedProducts.includes(p.productId) && 
                                                !editingActivity.products.find(ep => ep.productId === p.productId)
                                            )}
                                            renderItem={product => (
                                                <List.Item
                                                    actions={[
                                                        <Button 
                                                            type="link" 
                                                            danger
                                                            icon={<MinusCircleOutlined />}
                                                            onClick={() => {
                                                                setSelectedProducts(
                                                                    selectedProducts.filter(id => id !== product.productId)
                                                                );
                                                            }}
                                                        >
                                                            取消选择
                                                        </Button>
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        avatar={
                                                            product.imageUrl ? (
                                                                <img
                                                                    src={product.imageUrl}
                                                                    alt={product.productName}
                                                                    style={{ 
                                                                        width: 40, 
                                                                        height: 40, 
                                                                        objectFit: 'cover',
                                                                        borderRadius: '4px'
                                                                    }}
                                                                />
                                                            ) : null
                                                        }
                                                        title={
                                                            <span style={{ fontSize: '14px' }}>
                                                                {product.productName}
                                                            </span>
                                                        }
                                                        description={
                                                            <Space size={4}>
                                                                <Tag color="red">原价: ¥{product.originalPrice.toFixed(2)}</Tag>
                                                                <Tag color="green">团购价: ¥{product.groupPrice.toFixed(2)}</Tag>
                                                                <Tag color="blue">库存: {product.stockQuantity}</Tag>
                                                            </Space>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                            style={{
                                                backgroundColor: '#fafafa',
                                                padding: '8px',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Form>
                )}
            </Modal>
        </Card>
    );
};

export default ActivityList;