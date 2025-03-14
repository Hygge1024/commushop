import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Button, message, Pagination, Space, Select } from 'antd';
import {
  ShopOutlined,
  RiseOutlined,
  TeamOutlined,
  CarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { orderNewService } from '../../services/orderNewService';
import './LeaderDashboard.css';
import { useNavigate } from 'react-router-dom';


const LeaderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalCompleted: 0,
    pendingDelivery: 0,
    pendingReceive: 0
  });
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();


  // 获取订单数据
  // 修改获取订单数据的函数
  const fetchOrders = async (page = current, size = pageSize) => {
    try {
      setLoading(true);
      const leaderId = parseInt(localStorage.getItem('userId'), 10);
      const response = await orderNewService.getOrderList({
        current: page,
        size: size,
        leaderId: leaderId
      });

      if (response.code === 200) {
        const orderData = response.data.records || [];
        setOrders(orderData);
        setTotal(response.data.total);

        // 计算统计数据
        const stats = orderData.reduce((acc, order) => {
          switch (order.orderStatus) {
            case 5: // 已完成
              acc.totalCompleted++;
              break;
            case 2: // 已支付，待发货
              acc.pendingDelivery++;
              break;
            case 3: // 已发货，待收货
            case 4: // 已送达，待收货
              acc.pendingReceive++;
              break;
            default:
              break;
          }
          return acc;
        }, {
          totalCompleted: 0,
          pendingDelivery: 0,
          pendingReceive: 0
        });

        setStatistics(stats);
      }
    } catch (error) {
      console.error('获取订单数据失败:', error);
      message.error('获取订单数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

  return (
    <div className="leader-dashboard">
      <div className="welcome-header">
        <h2>您好，团长</h2>
        <p>今天是 {new Date().toLocaleDateString()}</p>
      </div>

      <Row gutter={[16, 16]} className="statistics-row">
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="累计完成"
              value={statistics.totalCompleted}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="待配送"
              value={statistics.pendingDelivery}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="待收货"
              value={statistics.pendingReceive}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="待处理订单"
        extra={<Button type="link" onClick={() => fetchOrders(current, pageSize)}>刷新</Button>}
        className="orders-card"
        loading={loading}
      >
        <List
          dataSource={orders.filter(order => order.orderStatus === 2)}
          renderItem={(order) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  size="small"
                  onClick={() => navigate(`/leader/order/${order.orderId}`)}
                >
                  处理
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
              fetchOrders(page, size);
            },
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50']
          }}
        />
      </Card>
    </div>
  );
};

export default LeaderDashboard;
