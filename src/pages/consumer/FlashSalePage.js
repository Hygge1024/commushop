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
  message,
  Spin,
  Empty,
  Divider 
} from 'antd';
import { 
  ThunderboltOutlined, 
  ClockCircleOutlined,
  ShoppingCartOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { activityService } from '../../services/activityService';
import { cartService } from '../../services/cartService';
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
        size: 999,
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

  const getActivityStatus = (activityData) => {
    if (!activityData || !activityData.activity) return { color: 'default', text: '未知' };
    
    const activity = activityData.activity;
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

  const handleProductClick = (product) => {
    navigate(`/consumer/product/${product.productId}`);
  };

  const handleAddToCart = async (productId, e) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      const userId = parseInt(localStorage.getItem('userId'), 10);
      if (!userId) {
        message.error('请先登录');
        return;
      }
      const response = await cartService.addCart({
        userId: userId,
        productId: productId,
        amount: 1
      });
      if (response.code === 200) {
        message.success('商品添加成功');
      } else {
        message.error(response.message || '商品添加失败');
      }
    } catch (error) {
      console.error('添加购物车失败:', error);
      message.error(error.message || '添加购物车失败');
    }
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
    const statusA = getActivityStatus(a);
    const statusB = getActivityStatus(b);
    
    const priority = { active: 0, upcoming: 1, ended: 2 };
    return priority[statusA.type] - priority[statusB.type];
  });

  return (
    <div className="flash-sale-container">
      {sortedActivities.map((activityData, index) => {
        const activityStatus = getActivityStatus(activityData);
        const activity = activityData.activity;

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
                <Text>{activityStatus.text}</Text>
                <Tag color={activityStatus.color}>
                  {activityStatus.type === 'upcoming' ? '即将开始' :
                   activityStatus.type === 'active' ? '抢购中' : '已结束'}
                </Tag>
              </div>

              <div className="products-grid">
                <Row gutter={[8, 16]}>
                  {activityData.products?.map((product) => (
                    <Col xs={12} sm={8} md={6} key={product.productId}>
                      <Badge.Ribbon
                        text={`省¥${(product.originalPrice - product.groupPrice).toFixed(2)}`}
                        color="#ff4d4f"
                      >
                        <Card
                          hoverable
                          bodyStyle={{ padding: '8px' }}
                          className="product-card"
                          onClick={() => handleProductClick(product)}
                          cover={
                            <div style={{ position: 'relative', paddingTop: '100%' }}>
                              <img
                                alt={product.productName}
                                src={product.imageUrl}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.src = getDefaultImage(product.productName);
                                }}
                              />
                            </div>
                          }
                        >
                          <div style={{ minHeight: '88px' }}>
                            <div style={{ 
                              fontSize: '14px',
                              fontWeight: '500',
                              marginBottom: '4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: '2',
                              WebkitBoxOrient: 'vertical',
                              lineHeight: '1.2'
                            }}>
                              {product.productName}
                            </div>
                            
                            <div style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginTop: '8px'
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ 
                                  color: '#ff4d4f',
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  lineHeight: '1'
                                }}>
                                  ¥{product.groupPrice.toFixed(2)}
                                </div>
                                <div style={{ 
                                  fontSize: '12px',
                                  color: '#999',
                                  textDecoration: 'line-through',
                                  marginTop: '2px'
                                }}>
                                  ¥{product.originalPrice.toFixed(2)}
                                </div>
                                <Progress
                                  percent={getSoldProgress(product.totalStock || 100, product.stockQuantity)}
                                  size="small"
                                  showInfo={false}
                                  strokeColor={{
                                    '0%': '#ff4d4f',
                                    '100%': '#ff7875',
                                  }}
                                  style={{ marginTop: '4px' }}
                                />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  剩余: {product.stockQuantity}
                                </Text>
                              </div>
                              <Button
                                type="primary"
                                size="middle"
                                icon={<ShoppingCartOutlined style={{ fontSize: '18px' }} />}
                                onClick={(e) => handleAddToCart(product.productId, e)}
                                disabled={activityStatus.type === 'ended' || product.stockQuantity <= 0}
                                style={{
                                  borderRadius: '20px',
                                  padding: '0 16px',
                                  height: '40px',
                                  width: '40px',
                                  minWidth: '40px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: '#ff4d4f',
                                  borderColor: '#ff4d4f'
                                }}
                              />
                            </div>
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
