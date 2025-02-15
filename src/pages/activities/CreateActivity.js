import React from 'react';
import { Form, Input, DatePicker, Select, Button, Card, InputNumber, Table } from 'antd';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const CreateActivity = () => {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log('提交的表单数据:', values);
    };

    // 商品选择的表格列定义
    const columns = [
        {
            title: '商品ID',
            dataIndex: 'product_id',
            key: 'product_id',
        },
        {
            title: '商品名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '商品原始价格',
            dataIndex: 'originprice',
            key: 'originprice',
        },
        {
            title: '商品团购价格',
            dataIndex: 'groupprice',
            key: 'groupprice',
        },
        {
            title: '库存',
            dataIndex: 'stock',
            key: 'stock',
        }
    ];

    // 示例数据
    const productData = [
        {
            key: '1',
            product_id: 'P001',
            name: '示例商品1',
            originprice: '¥100.00',
            groupprice: '¥99.00',
            stock: 100
        },
        // 更多商品数据...
    ];

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
                                min={2}
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
                                min={2}
                                placeholder="最大人数"
                            />
                        </Form.Item>
                    </Input.Group>
                </Form.Item>

                <Form.Item
                    name="products"
                    label="活动商品"
                    rules={[{ required: true, message: '请选择活动商品' }]}
                >
                    <div>
                        <Button type="primary" style={{ marginBottom: 16 }}>
                            选择商品
                        </Button>
                        <Table
                            columns={columns}
                            dataSource={productData}
                            rowSelection={{
                                type: 'checkbox',
                                onChange: (selectedRowKeys, selectedRows) => {
                                    console.log('选中的商品:', selectedRows);
                                }
                            }}
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
        </Card>
    );
};

export default CreateActivity; 