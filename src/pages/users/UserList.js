import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Button, Space, Modal, Descriptions, message, Tag } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { userService } from '../../services/userService';
import dayjs from 'dayjs';

const UserList = () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchForm, setSearchForm] = useState({
        userId: '',
        username: '',
        phone: ''
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [current, pageSize]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getUserList({
                current,
                size: pageSize,
                ...searchForm
            });
            
            if (response.code === 200) {
                setUsers(response.data.records);
                setTotal(response.data.total);
            } else {
                message.error(response.message || '获取用户列表失败');
            }
        } catch (error) {
            console.error('获取用户列表失败:', error);
            message.error('获取用户列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrent(1);
        fetchUsers();
    };

    const handleReset = () => {
        setSearchForm({
            userId: '',
            username: '',
            phone: ''
        });
        setCurrent(1);
        fetchUsers();
    };

    const handleViewDetails = (record) => {
        setSelectedUser(record);
        setModalVisible(true);
    };

    const columns = [
        {
            title: '用户ID',
            dataIndex: 'userId',
            key: 'userId',
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '真实姓名',
            dataIndex: 'realName',
            key: 'realName',
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === '正常' ? 'green' : 'red'}>
                    {status}
                </Tag>
            ),
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color="blue">{role}</Tag>
            ),
        },
        {
            title: '创建时间',
            dataIndex: 'createdTime',
            key: 'createdTime',
            render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleViewDetails(record)}>
                        查看详情
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Space style={{ marginBottom: '16px' }}>
                    <Input
                        placeholder="用户ID"
                        value={searchForm.userId}
                        onChange={e => setSearchForm(prev => ({ ...prev, userId: e.target.value }))}
                        style={{ width: 200 }}
                        prefix={<UserOutlined />}
                    />
                    <Input
                        placeholder="用户名"
                        value={searchForm.username}
                        onChange={e => setSearchForm(prev => ({ ...prev, username: e.target.value }))}
                        style={{ width: 200 }}
                        prefix={<UserOutlined />}
                    />
                    <Input
                        placeholder="手机号"
                        value={searchForm.phone}
                        onChange={e => setSearchForm(prev => ({ ...prev, phone: e.target.value }))}
                        style={{ width: 200 }}
                    />
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                        搜索
                    </Button>
                    <Button onClick={handleReset}>重置</Button>
                </Space>

                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="userId"
                    loading={loading}
                    pagination={{
                        current,
                        pageSize,
                        total,
                        onChange: (page, size) => {
                            setCurrent(page);
                            setPageSize(size);
                        },
                        showSizeChanger: true,
                        showTotal: (total) => `共 ${total} 条记录`,
                    }}
                />

                <Modal
                    title="用户详情"
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={null}
                    width={800}
                >
                    {selectedUser && (
                        <>
                            <Descriptions title="基本信息" bordered column={2}>
                                <Descriptions.Item label="用户ID">{selectedUser.userId}</Descriptions.Item>
                                <Descriptions.Item label="用户名">{selectedUser.username}</Descriptions.Item>
                                <Descriptions.Item label="真实姓名">{selectedUser.realName}</Descriptions.Item>
                                <Descriptions.Item label="手机号">{selectedUser.phone}</Descriptions.Item>
                                <Descriptions.Item label="邮箱">{selectedUser.email}</Descriptions.Item>
                                <Descriptions.Item label="性别">{selectedUser.gender}</Descriptions.Item>
                                <Descriptions.Item label="状态">{selectedUser.status}</Descriptions.Item>
                                <Descriptions.Item label="角色">{selectedUser.role}</Descriptions.Item>
                                <Descriptions.Item label="角色描述" span={2}>
                                    {selectedUser.roleDescription}
                                </Descriptions.Item>
                                <Descriptions.Item label="创建时间" span={2}>
                                    {dayjs(selectedUser.createdTime).format('YYYY-MM-DD HH:mm:ss')}
                                </Descriptions.Item>
                            </Descriptions>

                            <Descriptions title="地址信息" bordered style={{ marginTop: '24px' }}>
                                {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                                    selectedUser.addresses.map((address, index) => (
                                        <Descriptions.Item key={index} label={`地址${index + 1}`} span={3}>
                                            {address}
                                        </Descriptions.Item>
                                    ))
                                ) : (
                                    <Descriptions.Item span={3}>暂无地址信息</Descriptions.Item>
                                )}
                            </Descriptions>
                        </>
                    )}
                </Modal>
            </Card>
        </div>
    );
};

export default UserList;