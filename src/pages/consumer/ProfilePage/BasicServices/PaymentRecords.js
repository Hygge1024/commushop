import React, { useState, useEffect } from 'react';
import { Table, Typography, Card, Tag, Space, Spin, Empty, message, DatePicker, Button, Row, Col, Grid, List, Skeleton } from 'antd';
import { ArrowLeftOutlined, SearchOutlined, WalletOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../../../services/paymentService';
import { orderNewService } from '../../../../services/orderNewService';
import OrderDetailModal from '../../../../components/OrderDetailModal';
import dayjs from 'dayjs';
import './PaymentRecords.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

const PaymentRecords = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [loading, setLoading] = useState(false);
  const [allPayments, setAllPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [dateRange, setDateRange] = useState(null);
  const isMobile = !screens.md;
  
  // 订单详情弹窗状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrderCode, setSelectedOrderCode] = useState(null);

  // 支付方式标签颜色映射
  const paymentMethodColors = {
    '微信支付': 'green',
    '支付宝': 'blue'
  };

  // 支付状态标签颜色映射 - 根据是否有支付时间来判断支付状态
  const getPaymentStatus = (record) => {
    return record.paymentTime ? { text: '已支付', color: 'success' } : { text: '待支付', color: 'warning' };
  };

  // 获取支付记录
  const fetchPaymentRecords = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        message.error('用户未登录');
        return;
      }

      const queryParams = {
        current: 1,
        size: 100, // 获取更多数据以便前端过滤
        userId: parseInt(userId)
      };

      const response = await paymentService.getPaymentPage(queryParams);

      if (response.code === 200) {
        const records = response.data.records || [];
        setAllPayments(records);
        setFilteredPayments(records);
        setPagination({
          current: 1,
          pageSize: 10,
          total: records.length
        });
        
        // 如果有日期范围，立即过滤
        if (dateRange && dateRange[0] && dateRange[1]) {
          filterByDateRange(records, dateRange);
        }
      } else {
        message.error(response.msg || '获取支付记录失败');
      }
    } catch (error) {
      console.error('获取支付记录失败:', error);
      message.error('获取支付记录失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 根据日期范围过滤支付记录
  const filterByDateRange = (payments = allPayments, range = dateRange) => {
    if (!range || !range[0] || !range[1]) {
      // 如果没有日期范围，显示所有记录
      setFilteredPayments(payments);
      setPagination({
        ...pagination,
        current: 1,
        total: payments.length
      });
      return;
    }
    
    const startDate = range[0].startOf('day');
    const endDate = range[1].endOf('day');
    
    console.log('过滤日期范围:', startDate.format('YYYY-MM-DD HH:mm:ss'), 'to', endDate.format('YYYY-MM-DD HH:mm:ss'));
    
    const filtered = payments.filter(item => {
      if (!item.paymentTime) return false;
      
      const paymentDate = dayjs(item.paymentTime);
      return paymentDate.isAfter(startDate) && paymentDate.isBefore(endDate);
    });
    
    console.log('过滤前记录数:', payments.length, '过滤后记录数:', filtered.length);
    
    setFilteredPayments(filtered);
    setPagination({
      ...pagination,
      current: 1,
      total: filtered.length
    });
  };

  useEffect(() => {
    fetchPaymentRecords();
  }, []);

  // 处理表格分页变化
  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current
    });
  };

  // 处理日期范围变化
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // 处理搜索按钮点击
  const handleSearch = () => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      console.log('执行搜索，日期范围:', dateRange[0].format('YYYY-MM-DD'), 'to', dateRange[1].format('YYYY-MM-DD'));
      filterByDateRange(allPayments, dateRange);
      message.success('已过滤支付记录');
    } else {
      message.info('请选择日期范围');
    }
  };

  // 处理重置按钮点击
  const handleReset = () => {
    setDateRange(null);
    setFilteredPayments(allPayments);
    setPagination({
      ...pagination,
      current: 1,
      total: allPayments.length
    });
    message.success('已重置过滤条件');
  };
  // 订单详情弹窗相关函数
  const showOrderDetail = async (orderId) => {
    console.log('查看订单详情:', orderId);
    if (orderId) {
      try {
        const userId = localStorage.getItem('userId');
        const response = await orderNewService.getOrderDetailByOrderId({
          orderId: orderId,
          userId: userId ? parseInt(userId) : undefined,
          current: 1,
          size: 10
        });
        
        if (response && response.data && response.data.records) {
          // 如果成功获取到订单详情，显示弹窗
          setSelectedOrderCode(orderId);
          setDetailModalVisible(true);
          console.log('获取订单详情:', response.data.records);
        } else {
          message.error('未找到订单详情');
        }
      } catch (error) {
        console.error('获取订单详情失败:', error);
        message.error('获取订单详情失败');
      }
    }
  };

  const closeOrderDetail = () => {
    setDetailModalVisible(false);
    setSelectedOrderCode(null);
  };

  // 表格列定义
  const columns = [
    {
      title: '支付ID',
      dataIndex: 'paymentId',
      key: 'paymentId',
    },
    {
      title: '订单ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (orderId) => <a onClick={() => showOrderDetail(orderId)}>{orderId}</a>,
    },
    {
      title: '支付金额',
      dataIndex: 'paymentAmount',
      key: 'paymentAmount',
      render: (amount) => <Text type="danger">¥{parseFloat(amount).toFixed(2)}</Text>,
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => (
        <Tag color={paymentMethodColors[method] || 'default'}>
          {method}
        </Tag>
      ),
    },
    {
      title: '支付状态',
      key: 'status',
      render: (_, record) => {
        const status = getPaymentStatus(record);
        return (
          <Tag color={status.color}>
            {status.text}
          </Tag>
        );
      },
    },
    {
      title: '支付时间',
      dataIndex: 'paymentTime',
      key: 'paymentTime',
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showOrderDetail(record.orderId)}>查看订单！！</a>
        </Space>
      ),
    },
  ];

  // 手机端列表项渲染函数
  const renderListItem = (item) => {
    const status = getPaymentStatus(item);
    
    return (
      <List.Item
        key={item.paymentId}
        actions={[
          <a key="view-order" onClick={() => showOrderDetail(item.orderId)}>
            查看订单
          </a>
        ]}
      >
        <Skeleton avatar title={false} loading={loading} active>
          <List.Item.Meta
            avatar={<WalletOutlined className="payment-icon" style={{ fontSize: 24, color: '#1890ff' }} />}
            title={
              <div className="payment-list-title">
                <span>订单 #{item.orderId}</span>
                <Tag color={paymentMethodColors[item.paymentMethod] || 'default'}>
                  {item.paymentMethod}
                </Tag>
              </div>
            }
            description={
              <div className="payment-list-desc">
                <Text type="danger" strong>¥{parseFloat(item.paymentAmount).toFixed(2)}</Text>
                <div className="payment-list-info">
                  <Tag color={status.color}>{status.text}</Tag>
                  <span className="payment-time">
                    {item.paymentTime ? dayjs(item.paymentTime).format('YYYY-MM-DD HH:mm') : '-'}
                  </span>
                </div>
              </div>
            }
          />
        </Skeleton>
      </List.Item>
    );
  };

  // 移动端分页处理
  const handleListChange = (page) => {
    setPagination({
      ...pagination,
      current: page
    });
  };

  return (
    <div className="payment-records-container">
      <div className="page-header">
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/consumer')}
          className="back-button"
        >
          返回
        </Button>
        <Title level={4}>支付记录</Title>
      </div>

      <Card className="filter-card">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={8} lg={8}>
            <div className="filter-item">
              <span className="filter-label">支付日期:</span>
              <RangePicker 
                value={dateRange}
                onChange={handleDateRangeChange}
                style={{ width: '100%' }}
                picker="date"
              />
            </div>
          </Col>
          <Col xs={24} sm={24} md={16} lg={16}>
            <div className="filter-buttons">
              <Button 
                type="primary" 
                icon={<SearchOutlined />} 
                onClick={handleSearch}
                disabled={loading}
              >
                搜索
              </Button>
              <Button 
                onClick={handleReset} 
                style={{ marginLeft: 8 }}
                disabled={loading}
              >
                重置
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="table-card">
        <Spin spinning={loading}>
          {filteredPayments.length > 0 ? (
            isMobile ? (
              <List
                className="payment-mobile-list"
                itemLayout="horizontal"
                dataSource={filteredPayments}
                renderItem={renderListItem}
                pagination={{
                  onChange: handleListChange,
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  size: "small",
                  showSizeChanger: false
                }}
              />
            ) : (
              <Table 
                columns={columns} 
                dataSource={filteredPayments}
                rowKey="paymentId"
                pagination={pagination}
                onChange={handleTableChange}
                scroll={{ x: 'max-content' }}
              />
            )
          ) : (
            <Empty description="暂无支付记录" />
          )}
        </Spin>
      </Card>

      {/* 订单详情弹窗 */}
      <OrderDetailModal 
        visible={detailModalVisible}
        orderCode={selectedOrderCode}
        onClose={closeOrderDetail}
      />
    </div>
  );
};

export default PaymentRecords;
