import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, Select, DatePicker, message, Typography, Descriptions, Tag } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { orderNewService } from '../../services/orderNewService';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

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
    8: { color: 'red', text: '退款已拒绝' }
    // 9: { color: 'default', text: '退款成功' }
};


const AfterSalesManagement = () => {
  const [loading, setLoading] = useState(false);
  const [afterSalesList, setAfterSalesList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchForm] = Form.useForm();
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [processingVisible, setProcessingVisible] = useState(false);
  const [processingForm] = Form.useForm();

  // 获取售后列表（只获取订单状态为6的订单）
  const fetchAfterSalesList = async (params = {}) => {
    setLoading(true);
    try {
      // 构建查询参数
      const queryParams = {
        ...params,
        orderStatus: params.status || 6, // 使用选择的状态，默认为退款申请中
        current: params.current || pagination.current,
        size: params.pageSize || pagination.pageSize
      };

      // 处理空值参数
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === undefined || queryParams[key] === null) {
          delete queryParams[key];
        }
      });

      // 调用订单服务获取退款申请订单
      console.log('查询参数:', queryParams);
      const response = await orderNewService.getOrderList(queryParams);
      
      if (response.code === 200) {
        const { records, total, current, size } = response.data;
        
        // 将订单数据转换为售后处理数据格式
        const afterSalesData = records.map(order => ({
          id: order.orderId,
          orderCode: order.orderCode,
          userId: order.userId,
          type: 0, // 默认为退款类型
          reason: order.refundReason || '用户申请退款',
          description: order.remark || '无详细描述',
          createTime: order.refundApplyTime || order.createTime,
          updateTime: order.refundProcessTime || order.updateTime,
          amount: order.totalMoney,
          address: order.address,
          images: [],
          orderStatus: order.orderStatus,
          leaderId: order.leaderId
        }));

        setAfterSalesList(afterSalesData);
        setPagination({
          current: current,
          pageSize: size,
          total: total
        });
      } else {
        message.error(response.message || '获取售后列表失败');
      }
    } catch (error) {
      console.error('获取售后列表失败:', error);
      message.error('获取售后列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAfterSalesList();
  }, []);

  // 表格列配置
  const columns = [
    {
      title: '售后编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '订单编号',
      dataIndex: 'orderCode',
      key: 'orderCode',
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: '团长ID',
      dataIndex: 'leaderId',
      key: 'leaderId',
    },
    {
      title: '售后类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const types = ['退款', '换货', '维修'];
        return types[type] || '未知';
      },
    },
    {
      title: '申请原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '申请金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `¥${Number(amount).toFixed(2)}`,
    },
    {
      title: '处理状态',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (orderStatus) => (
        <Tag color={ORDER_STATUS[orderStatus]?.color || 'default'}>
          {ORDER_STATUS[orderStatus]?.text || '未知状态'}
        </Tag>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right', // 固定在右侧
      width: 300, // 设置列宽
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showDetail(record)}>
            查看详情
          </Button>
          <Button type="primary" size="small" onClick={() => handleApprove(record)}>
            同意
          </Button>
          <Button type="danger" size="small" onClick={() => handleReject(record)}>
            拒绝
          </Button>
        </Space>
      ),
    },
  ];

  // 查看详情
  const showDetail = (record) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  // 显示处理弹窗 - 不再使用
  const showProcessingModal = (record) => {
    setCurrentRecord(record);
    setProcessingVisible(true);
    processingForm.resetFields();
  };

  // 同意退款
  const handleApprove = async (record) => {
    Modal.confirm({
      title: '确认同意退款',
      content: `您确定要同意订单 ${record.orderCode} 的退款申请吗？`,
      onOk: async () => {
        try {
          // 调用同意退款API
          const response = await orderNewService.refund.approve(record.id, {
            refundProcessTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            refundResult: '管理员同意退款'
          });
          
          if (response.success) {
            message.success('同意退款成功');
            fetchAfterSalesList(); // 刷新列表
          } else {
            message.error(response.message || '同意退款失败');
          }
        } catch (error) {
          console.error('同意退款失败:', error);
          message.error('同意退款失败');
        }
      }
    });
  };
  
  // 拒绝退款
  const handleReject = async (record) => {
    Modal.confirm({
      title: '确认拒绝退款',
      content: (
        <div>
          <p>您确定要拒绝订单 {record.orderCode} 的退款申请吗？</p>
          <Form.Item label="拒绝原因" name="rejectReason">
            <Input.TextArea 
              rows={3} 
              placeholder="请输入拒绝原因"
              id="rejectReason"
            />
          </Form.Item>
        </div>
      ),
      onOk: async () => {
        try {
          const rejectReason = document.getElementById('rejectReason').value || '管理员拒绝退款';
          
          // 调用拒绝退款API
          const response = await orderNewService.refund.reject(record.id, {
            refundProcessTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            refundResult: rejectReason
          });
          
          if (response.success) {
            message.success('拒绝退款成功');
            fetchAfterSalesList(); // 刷新列表
          } else {
            message.error(response.message || '拒绝退款失败');
          }
        } catch (error) {
          console.error('拒绝退款失败:', error);
          message.error('拒绝退款失败');
        }
      }
    });
  };

  // 搜索
  const handleSearch = (values) => {
    const params = { ...values };
    
    // 处理日期范围
    if (values.dateRange) {
      params.startTime = values.dateRange[0].format('YYYY-MM-DD');
      params.endTime = values.dateRange[1].format('YYYY-MM-DD');
      delete params.dateRange;
    }
    
    fetchAfterSalesList({
      ...params,
      page: 1,
      size: pagination.pageSize,
    });
    
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    fetchAfterSalesList({
      page: 1,
      size: pagination.pageSize,
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  // 分页变化
  const handleTableChange = (pagination) => {
    setPagination(pagination);
    const values = searchForm.getFieldsValue();
    fetchAfterSalesList({
      ...values,
      page: pagination.current,
      size: pagination.pageSize,
    });
  };

  return (
    <div className="after-sales-management">
      <Card title="售后管理" bordered={false}>
        {/* 搜索表单 */}
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 24 }}
        >
          <Form.Item name="orderCode" label="订单编号">
            <Input placeholder="请输入订单编号" />
          </Form.Item>
          <Form.Item name="userId" label="用户ID">
            <Input placeholder="请输入用户ID" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
              {Object.entries(ORDER_STATUS).map(([key, { text }]) => (
                <Option key={key} value={Number(key)}>
                  {text}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="type" label="售后类型" initialValue={0}>
            <Select style={{ width: 120 }} disabled>
              <Option value={0}>退款</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="申请时间">
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={handleReset} icon={<ReloadOutlined />}>
              重置
            </Button>
          </Form.Item>
        </Form>

        {/* 售后列表 */}
        <Table
          columns={columns}
          dataSource={afterSalesList}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }} // 添加水平滚动支持
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: handleTableChange,
          }}
        />

        {/* 详情弹窗 */}
        <Modal
          title="售后详情"
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={[
            <Button key="back" onClick={() => setDetailVisible(false)}>
              关闭
            </Button>,
          ]}
          width={800}
        >
          {currentRecord && (
            <>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="售后编号" span={2}>
                  {currentRecord.id}
                </Descriptions.Item>
                <Descriptions.Item label="订单编号" span={2}>
                  {currentRecord.orderCode}
                </Descriptions.Item>
                <Descriptions.Item label="用户ID">
                  {currentRecord.userId}
                </Descriptions.Item>
                <Descriptions.Item label="团长ID">
                  {currentRecord.leaderId}
                </Descriptions.Item>
                <Descriptions.Item label="售后类型">
                  {['退款', '换货', '维修'][currentRecord.type] || '未知'}
                </Descriptions.Item>
                <Descriptions.Item label="订单状态">
                  <Tag color={ORDER_STATUS[currentRecord.orderStatus]?.color || 'default'}>
                    {ORDER_STATUS[currentRecord.orderStatus]?.text || '未知状态'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="申请金额">
                  ¥{Number(currentRecord.amount).toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="处理状态">
                  <Tag color={ORDER_STATUS[currentRecord.orderStatus]?.color || 'default'}>
                    {ORDER_STATUS[currentRecord.orderStatus]?.text || '未知状态'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="收货地址" span={2}>
                  {currentRecord.address || '无地址信息'}
                </Descriptions.Item>
                <Descriptions.Item label="申请时间">
                  {currentRecord.createTime ? dayjs(currentRecord.createTime).format('YYYY-MM-DD HH:mm:ss') : '未知'}
                </Descriptions.Item>
                <Descriptions.Item label="处理时间">
                  {currentRecord.updateTime ? dayjs(currentRecord.updateTime).format('YYYY-MM-DD HH:mm:ss') : '未处理'}
                </Descriptions.Item>
              </Descriptions>

              {/* 图片展示区域 */}
              {currentRecord.images && currentRecord.images.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Title level={5}>申请图片</Title>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {currentRecord.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`售后图片${index + 1}`}
                        style={{ width: 120, height: 120, objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Modal>

        {/* 处理售后弹窗 - 不再使用，保留代码作为参考 */}
        <Modal
          title="处理售后申请"
          open={processingVisible}
          onCancel={() => setProcessingVisible(false)}
          footer={null}
          style={{ display: 'none' }} /* 隐藏不再使用的弹窗 */
        >
          <Form
            form={processingForm}
            layout="vertical"
            onFinish={() => {}}
          >
            <Form.Item
              name="status"
              label="处理结果"
              rules={[{ required: true, message: '请选择处理结果' }]}
            >
              <Select placeholder="请选择处理结果">
                <Option value={1}>接受并处理</Option>
                <Option value={2}>完成</Option>
                <Option value={3}>拒绝</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="remark"
              label="处理备注"
              rules={[{ required: true, message: '请输入处理备注' }]}
            >
              <Input.TextArea rows={4} placeholder="请输入处理备注" />
            </Form.Item>
            <Form.Item>
              <div style={{ textAlign: 'right' }}>
                <Button style={{ marginRight: 8 }} onClick={() => setProcessingVisible(false)}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  提交
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default AfterSalesManagement;
