import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Badge, 
  Progress, 
  Tag, 
  Statistic, 
  Image,
  message,
  Spin,
  Empty,
  Divider 
} from 'antd';
import { 
  ThunderboltOutlined, 
  ClockCircleOutlined, 
  TeamOutlined,
  ShoppingCartOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { activityService } from '../../services/activityService';
import dayjs from 'dayjs';
import './FlashSalePage.css';

const { Title, Text } = Typography;
const { Countdown } = Statistic;

const FlashSalePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await activityService.getActivityList({
        current: 1,
        size: 10,
      });

      if (response.code === 200 && response.data) {
        console.log("获取信息成功");
        setActivities(response.data.records);
      } else {
        setError(response.message || '获取活动列表失败');
      }
    } catch (error) {
      console.error('获取活动列表失败:', error);
      setError('获取活动列表失败，请稍后重试');
      message.error('获取活动列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getActivityStatus = (activity) => {
    if (!activity) return { color: 'default', text: '未知' };
    
    const now = dayjs();
    const startTime = dayjs(activity.activityStartTime);
    const endTime = dayjs(activity.activityEndTime);
    
    if (now.isBefore(startTime)) {
      const diffHours = startTime.diff(now, 'hour');
      if (diffHours <= 24) {
        return { 
          color: 'orange', 
          text: `${diffHours}小时后开始`,
          type: 'upcoming'
        };
      }
      return { 
        color: 'orange', 
        text: startTime.format('MM-DD HH:mm') + ' 开始',
        type: 'upcoming'
      };
    } else if (now.isAfter(endTime)) {
      return { 
        color: 'red', 
        text: '已结束',
        type: 'ended'
      };
    } else {
      const diffHours = endTime.diff(now, 'hour');
      return { 
        color: 'green', 
        text: `抢购中 (剩余${diffHours}小时)`,
        type: 'active'
      };
    }
  };

  const calculateDiscount = (original, group) => {
    return Math.round((1 - group / original) * 100);
  };

  const getSoldProgress = (total, remaining) => {
    const sold = total - remaining;
    return Math.round((sold / total) * 100);
  };

  const handleJoinGroup = (productId) => {
    message.success('已加入拼团');
    // TODO: 实现加入拼团逻辑
  };

  const getDefaultImage = (productName) => {
    return `https://via.placeholder.com/300x300/1890ff/ffffff?text=${encodeURIComponent(productName)}`;
  };

  if (loading) {
    return (
      <div className="flash-sale-loading">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flash-sale-error">
        <Empty
          description={error}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/consumer/home')}>
            返回首页
          </Button>
        </Empty>
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="flash-sale-empty">
        <Empty
          description="暂无秒杀活动"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/consumer/home')}>
            返回首页
          </Button>
        </Empty>
      </div>
    );
  }

  // 对活动进行排序：进行中 > 即将开始 > 已结束
  const sortedActivities = [...activities].sort((a, b) => {
    const statusA = getActivityStatus(a.activity);
    const statusB = getActivityStatus(b.activity);
    
    const priority = { active: 0, upcoming: 1, ended: 2 };
    return priority[statusA.type] - priority[statusB.type];
  });

  return (
    <div className="flash-sale-container">
      {sortedActivities.map((activityData, index) => {
        const activity = activityData.activity;
        const products = activityData.products;
        const activityStatus = getActivityStatus(activity);

        return (
          <React.Fragment key={activity.activityId}>
            {index > 0 && <Divider style={{ margin: '32px 0' }} />}
            <Card className="activity-card">
              <div className="activity-header">
                <div className="activity-title">
                  <ThunderboltOutlined className="flash-icon" />
                  <Title level={4}>{activity.activityName}</Title>
                </div>
                <div className="activity-countdown">
                  <ClockCircleOutlined />
                  {activityStatus.type === 'upcoming' ? (
                    <Text>距开始: <Countdown value={dayjs(activity.activityStartTime)} format="D 天 H 时 m 分 s 秒" /></Text>
                  ) : activityStatus.type === 'active' ? (
                    <Text>距结束: <Countdown value={dayjs(activity.activityEndTime)} format="D 天 H 时 m 分 s 秒" /></Text>
                  ) : (
                    <Text type="secondary">活动已结束</Text>
                  )}
                </div>
              </div>

              <div className="activity-status">
                <FireOutlined style={{ color: '#ff4d4f' }} />
                <Text>
                  {activityStatus.text}
                  {activity.minGroupSize && activity.maxGroupSize && 
                    ` · ${activity.minGroupSize}-${activity.maxGroupSize}人成团`}
                </Text>
                <Tag color={activityStatus.color}>
                  {activityStatus.type === 'upcoming' ? '即将开始' :
                   activityStatus.type === 'active' ? '抢购中' : '已结束'}
                </Tag>
              </div>

              <div className="products-grid">
                <Row gutter={[16, 16]}>
                  {products?.map((product) => (
                    <Col xs={12} sm={8} md={6} key={product.productId}>
                      <Badge.Ribbon
                        text={`省¥${(product.originalPrice - product.groupPrice).toFixed(2)}`}
                        color="red"
                      >
                        <Card
                          className="product-card"
                          cover={
                            <Image
                              alt={product.productName}
                              src={product.imageUrl || getDefaultImage(product.productName)}
                              fallback={getDefaultImage(product.productName)}
                              preview={false}
                            />
                          }
                          bodyStyle={{ padding: '12px', flex: 1 }}
                        >
                          <div className="product-info">
                            <Title level={5} className="product-name" ellipsis={{ rows: 2 }}>
                              {product.productName}
                            </Title>
                            
                            <div className="price-info">
                              <Text type="danger" className="group-price">
                                ¥{product.groupPrice.toFixed(2)}
                              </Text>
                              <Text type="secondary" className="original-price">
                                ¥{product.originalPrice.toFixed(2)}
                              </Text>
                              <Tag color="red" className="discount-tag">
                                {calculateDiscount(product.originalPrice, product.groupPrice)}% OFF
                              </Tag>
                            </div>

                            <div className="stock-info">
                              <Progress
                                percent={getSoldProgress(product.totalStock || 100, product.stockQuantity)}
                                size="small"
                                showInfo={false}
                                strokeColor={{
                                  '0%': '#108ee9',
                                  '100%': '#87d068',
                                }}
                              />
                              <div className="stock-text">
                                <Text type="secondary">
                                  剩余: {product.stockQuantity}
                                </Text>
                                <Text type="secondary">
                                  <TeamOutlined /> {activity.minGroupSize}人团
                                </Text>
                              </div>
                            </div>

                            <Button
                              type="primary"
                              icon={<ShoppingCartOutlined />}
                              block
                              onClick={() => handleJoinGroup(product.productId)}
                              disabled={activityStatus.type === 'ended' || product.stockQuantity <= 0}
                            >
                              {activityStatus.type === 'upcoming' ? '提醒我' :
                               product.stockQuantity <= 0 ? '已抢光' :
                               activityStatus.type === 'ended' ? '已结束' :
                               '立即抢购'}
                            </Button>
                          </div>
                        </Card>
                      </Badge.Ribbon>
                    </Col>
                  ))}
                </Row>
              </div>
            </Card>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default FlashSalePage;
