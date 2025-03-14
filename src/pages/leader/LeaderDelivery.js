import React, { useState, useEffect } from 'react';
import { Tabs, Card, List, Tag, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { orderNewService } from '../../services/orderNewService';
import { CarOutlined } from '@ant-design/icons';
import './LeaderDelivery.css';

const LeaderDelivery = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState('2'); // 默认显示待发货
  const navigate = useNavigate();

  // 获取订单数据
  const fetchOrders = async (page = current, size = pageSize, status = activeTab) => {
    try {
      setLoading(true);
      const leaderId = parseInt(localStorage.getItem('userId'), 10);
      const response = await orderNewService.getOrderList({
        current: page,
        size: size,
        leaderId: leaderId,
        orderStatus: parseInt(status)
      });

      if (response.code === 200) {
        setOrders(response.data.records || []);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('获取订单数据失败:', error);
      message.error('获取订单数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, pageSize, activeTab);
  }, [activeTab]);

  const getStatusTag = (status) => {
    const statusMap = {
      2: { color: 'orange', text: '待发货' },
      3: { color: 'blue', text: '配送中' },
      4: { color: 'cyan', text: '待收货' },
      5: { color: 'green', text: '已完成' }
    };
    const { color, text } = statusMap[status] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  const renderOrderList = (orders) => (
    <List
      dataSource={orders}
      renderItem={(order) => (
        <List.Item
          actions={[
            <Button
              type="primary"
              size="small"
              onClick={() => navigate(`/leader/order/${order.orderId}`)}
            >
              查看详情
            </Button>
          ]}
        >
          <List.Item.Meta
            title={
              <div className="order-title">
                <span>订单号: {order.orderCode}</span>
                {getStatusTag(order.orderStatus)}
              </div>
            }
            description={
              <div className="order-info">
                <div>收货地址: {order.address}</div>
                <div>金额: ¥{order.totalMoney.toFixed(2)}</div>
                <div>时间: {new Date(order.createTime).toLocaleString()}</div>
              </div>
            }
          />
        </List.Item>
      )}
      pagination={{
        current: current,
        pageSize: pageSize,
        total: total,
        onChange: (page, size) => {
          setCurrent(page);
          setPageSize(size);
          fetchOrders(page, size, activeTab);
        },
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条记录`,
        pageSizeOptions: ['10', '20', '50']
      }}
    />
  );

  // 添加状态计数的 state
  const [statusCounts, setStatusCounts] = useState({
    2: 0,
    3: 0,
    4: 0,
    5: 0
  });

  // 获取所有状态的订单数量
  const fetchStatusCounts = async () => {
    try {
      const leaderId = parseInt(localStorage.getItem('userId'), 10);
      const statuses = [2, 3, 4, 5];
      const counts = {};

      await Promise.all(statuses.map(async (status) => {
        const response = await orderNewService.getOrderList({
          current: 1,
          size: 1,
          leaderId: leaderId,
          orderStatus: status
        });
        counts[status] = response.code === 200 ? response.data.total : 0;
      }));

      setStatusCounts(counts);
    } catch (error) {
      console.error('获取订单数量统计失败:', error);
    }
  };

  // 在组件加载和订单状态更新时获取数量
  useEffect(() => {
    fetchStatusCounts();
  }, []);

  const items = [
    {
      key: '2',
      label: `待发货 (${statusCounts[2]})`,
      children: <Card loading={loading}>{renderOrderList(orders)}</Card>
    },
    {
      key: '3',
      label: `配送中 (${statusCounts[3]})`,
      children: <Card loading={loading}>{renderOrderList(orders)}</Card>
    },
    {
      key: '4',
      label: `待收货 (${statusCounts[4]})`,
      children: <Card loading={loading}>{renderOrderList(orders)}</Card>
    },
    {
      key: '5',
      label: `已完成 (${statusCounts[5]})`,
      children: <Card loading={loading}>{renderOrderList(orders)}</Card>
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Tabs
        defaultActiveKey="2"
        items={items}
        onChange={(key) => {
          setActiveTab(key);
          setCurrent(1);
          fetchStatusCounts(); // 切换标签时更新数量
        }}
      />
    </div>
  );
};

export default LeaderDelivery;
