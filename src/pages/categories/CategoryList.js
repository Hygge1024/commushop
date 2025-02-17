import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { categoryService } from '../../services/categoryService';
import dayjs from 'dayjs';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingCategory, setEditingCategory] = useState(null);

    // 获取类别列表
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoryService.getAllCategories();
            if (response.code === 200) {
                setCategories(response.data);
            } else {
                message.error(response.message || '获取类别列表失败');
            }
        } catch (error) {
            console.error('获取类别列表失败:', error);
            message.error('获取类别列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // 表格列定义
    const columns = [
        {
            title: '类别ID',
            dataIndex: 'categoryId',
            key: 'categoryId',
            width: 100,
        },
        {
            title: '类别名称',
            dataIndex: 'categoryName',
            key: 'categoryName',
            width: 200,
        },
        {
            title: '状态',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (isActive) => (
                <span style={{ color: isActive ? '#52c41a' : '#ff4d4f' }}>
                    {isActive ? '启用' : '禁用'}
                </span>
            ),
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (createdAt) => dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    >
                        删除
                    </Button>
                </Space>
            ),
        },
    ];

    // 处理添加/编辑
    const handleAddEdit = async (values) => {
        try {
            if (editingCategory) {
                // 编辑模式
                const response = await categoryService.updateCategory({
                    ...values,
                    categoryId: editingCategory.categoryId,
                });
                if (response.code === 200) {
                    message.success('类别更新成功');
                    fetchCategories();
                } else {
                    message.error(response.message || '类别更新失败');
                }
            } else {
                // 添加模式
                const response = await categoryService.createCategory({
                    categoryName: values.categoryName
                });
                if (response.code === 200) {
                    message.success('类别创建成功');
                    fetchCategories();
                } else {
                    message.error(response.message || '类别创建失败');
                }
            }
            handleModalClose();
        } catch (error) {
            console.error('操作失败:', error);
            message.error('操作失败');
        }
    };

    // 处理编辑
    const handleEdit = (category) => {
        setEditingCategory(category);
        form.setFieldsValue({
            categoryName: category.categoryName,
            isActive: category.isActive,
        });
        setModalVisible(true);
    };

    // 处理删除
    const handleDelete = (category) => {
        Modal.confirm({
            title: '确认删除',
            content: `确定要删除类别 "${category.categoryName}" 吗？`,
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                try {
                    const response = await categoryService.deleteCategory(category.categoryId);
                    if (response.code === 200) {
                        message.success('类别删除成功');
                        fetchCategories();
                    } else {
                        message.error(response.message || '类别删除失败');
                    }
                } catch (error) {
                    console.error('删除失败:', error);
                    message.error('删除失败');
                }
            },
        });
    };

    // 处理模态框关闭
    const handleModalClose = () => {
        setModalVisible(false);
        setEditingCategory(null);
        form.resetFields();
    };

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalVisible(true)}
                >
                    添加类别
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={categories}
                rowKey="categoryId"
                loading={loading}
                pagination={false}
            />

            <Modal
                title={editingCategory ? '编辑类别' : '添加类别'}
                open={modalVisible}
                onCancel={handleModalClose}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddEdit}
                >
                    <Form.Item
                        name="categoryName"
                        label="类别名称"
                        rules={[{ required: true, message: '请输入类别名称' }]}
                    >
                        <Input placeholder="请输入类别名称" />
                    </Form.Item>

                    {editingCategory && (
                        <Form.Item
                            name="isActive"
                            label="状态"
                            valuePropName="checked"
                            initialValue={true}
                        >
                            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                确定
                            </Button>
                            <Button onClick={handleModalClose}>取消</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryList;
