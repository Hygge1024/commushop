import React, { useState } from 'react';
import { Table, Space, Button, Card, Input, DatePicker, Form, Tag } from 'antd';
import { SearchOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;

const ActivityList = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // 表格列定义
    const columns = [
        {
            title: '活动编码',
            dataIndex: 'activityCode',
            key: 'activityCode',
            width: 120,
        },
        {
            title: '活动名称',
            dataIndex: 'activityName',
            key: 'activityName',
            width: 200,
        },
        {
            title: '活动状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const statusConfig = {
                    draft: { color: 'default', text: '草稿' },
                    pending: { color: 'orange', text: '待开始' },
                    active: { color: 'green', text: '进行中' },
                    ended: { color: 'red', text: '已结束' }
                };
                const { color, text } = statusConfig[status] || { color: 'default', text: status };
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: '开始时间',
            dataIndex: 'startTime',
            key: 'startTime',
            width: 180,
        },
        {
            title: '结束时间',
            dataIndex: 'endTime',
            key: 'endTime',
            width: 180,
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => console.log('查看详情', record)}>
                        查看详情
                    </Button>
                    <Button type="link" onClick={() => console.log('编辑', record)}>
                        编辑
                    </Button>
                    <Button type="link" danger onClick={() => console.log('删除', record)}>
                        删除
                    </Button>
                </Space>
            ),
        },
    ];

    // 示例数据
    const data = [
        {
            key: '1',
            activityCode: 'ACT20240101001',
            activityName: '新年特惠团购',
            status: 'active',
            startTime: '2024-01-01 00:00:00',
            endTime: '2024-01-07 23:59:59',
        },
        // 可以添加更多示例数据...
    ];

    // 搜索表单提交
    const onFinish = (values) => {
        const { dateRange, ...otherValues } = values;
        const params = {
            ...otherValues,
            startTime: dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
            endTime: dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
        };
        console.log('搜索参数:', params);
        // TODO: 调用后端API进行查询
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
                        <Button icon={<DeleteOutlined />} onClick={() => form.resetFields()}>
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

export default ActivityList; 