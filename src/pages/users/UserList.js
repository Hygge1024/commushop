import React, { useState } from 'react';
import { Table, Space, Button, Card, Input, Form, Tag, Modal, Descriptions, List } from 'antd';
import { SearchOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const UserList = () => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // 表格列定义
    const columns = [
        {
            title: '用户ID',
            dataIndex: 'userId',
            key: 'userId',
            width: 100,
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            width: 120,
        },
        {
            title: '姓名',
            dataIndex: 'fullname',
            key: 'fullname',
            width: 120,
        },
        {
            title: '手机号',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            width: 150,
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            width: 200,
        },
        {
            title: '性别',
            dataIndex: 'gender',
            key: 'gender',
            width: 80,
            render: (gender) => gender === 1 ? '男' : '女',
        },
        {
            title: '状态',
            dataIndex: 'userState',
            key: 'userState',
            width: 100,
            render: (state) => (
                <Tag color={state === 1 ? 'green' : 'red'}>
                    {state === 1 ? '正常' : '禁用'}
                </Tag>
            ),
        },
        {
            title: '角色',
            dataIndex: ['role', 'roleName'],
            key: 'roleName',
            width: 120,
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => showUserDetail(record)}
                    >
                        查看详情
                    </Button>
                </Space>
            ),
        },
    ];

    // 示例数据
    const data = [
        {
            userId: 1,
            username: "10000001",
            phoneNumber: "18553125790",
            fullname: "张主管",
            email: "389133390@qq.com",
            userState: 1,
            gender: 1,
            role: {
                roleId: 1,
                roleName: "管理员",
                roleDescription: "管理团购系统，维护商品信息",
                roleCreateTime: "2025-01-21T11:19:54"
            },
            userAddresses: [
                {
                    addressId: 1,
                    userId: 1,
                    addressDetail: "浙江省，杭州市，钱塘区，浙江工商大学金沙港生活区7幢124",
                    isDefault: true
                },
                {
                    addressId: 2,
                    userId: 1,
                    addressDetail: "123 Main St, Springfield, IL",
                    isDefault: true
                }
            ]
        },
    ];

    // 查看用户详情
    const showUserDetail = (user) => {
        setCurrentUser(user);
        setIsModalVisible(true);
    };

    // 搜索表单提交
    const onFinish = (values) => {
        console.log('搜索参数:', values);
        // TODO: 调用后端API进行查询
    };

    return (
        <Card title="用户查询">
            {/* 搜索表单 */}
            <Form
                form={form}
                layout="inline"
                onFinish={onFinish}
                style={{ marginBottom: 24 }}
            >
                <Form.Item name="userId" label="用户ID">
                    <Input placeholder="请输入用户ID" />
                </Form.Item>
                <Form.Item name="username" label="用户名">
                    <Input placeholder="请输入用户名" />
                </Form.Item>
                <Form.Item name="phoneNumber" label="手机号">
                    <Input placeholder="请输入手机号" />
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

            {/* 用户列表 */}
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
                scroll={{ x: 1300 }}
                bordered
            />

            {/* 用户详情弹窗 */}
            <Modal
                title="用户详细信息"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
                styles={{
                    body: {
                        maxHeight: 'calc(90vh - 200px)',
                        overflowY: 'auto',
                    }
                }}
            >
                {currentUser && (
                    <>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="用户ID">{currentUser.userId}</Descriptions.Item>
                            <Descriptions.Item label="用户名">{currentUser.username}</Descriptions.Item>
                            <Descriptions.Item label="姓名">{currentUser.fullname}</Descriptions.Item>
                            <Descriptions.Item label="手机号">{currentUser.phoneNumber}</Descriptions.Item>
                            <Descriptions.Item label="邮箱">{currentUser.email}</Descriptions.Item>
                            <Descriptions.Item label="性别">
                                {currentUser.gender === 1 ? '男' : '女'}
                            </Descriptions.Item>
                            <Descriptions.Item label="状态">
                                <Tag color={currentUser.userState === 1 ? 'green' : 'red'}>
                                    {currentUser.userState === 1 ? '正常' : '禁用'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="角色">{currentUser.role.roleName}</Descriptions.Item>
                            <Descriptions.Item label="角色描述" span={2}>
                                {currentUser.role.roleDescription}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 24 }}>
                            <h3>用户地址列表</h3>
                            <List
                                bordered
                                dataSource={currentUser.userAddresses}
                                renderItem={item => (
                                    <List.Item>
                                        <Space>
                                            {item.isDefault && <Tag color="blue">默认</Tag>}
                                            {item.addressDetail}
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </>
                )}
            </Modal>
        </Card>
    );
};

export default UserList; 