import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, message, Empty, Tabs, Button } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { recommendService } from '../../services/recommendService';
import { cartService } from '../../services/cartService';
import './RecommendationPage.css';

const { TabPane } = Tabs;
const { Meta } = Card;

const RecommendationPage = () => {
  const [cfProducts, setCfProducts] = useState([]);
  const [contentProducts, setContentProducts] = useState([]);
  const [cfLoading, setCfLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.warning('请先登录');
      setCfLoading(false);
      setContentLoading(false);
      return;
    }

    // 获取基于协同过滤的推荐
    try {
      setCfLoading(true);
      const cfResponse = await recommendService.getCFRecommendProducts(userId, 10);
      if (cfResponse.success) {
        setCfProducts(cfResponse.data || []);
      } else {
        message.error(cfResponse.message || '获取协同过滤推荐失败');
      }
    } catch (error) {
      console.error('获取协同过滤推荐错误:', error);
      message.error('获取协同过滤推荐出错');
    } finally {
      setCfLoading(false);
    }

    // 获取基于内容的推荐
    try {
      setContentLoading(true);
      const contentResponse = await recommendService.getContentRecommendProducts(userId, 10);
      if (contentResponse.success) {
        setContentProducts(contentResponse.data || []);
      } else {
        message.error(contentResponse.message || '获取内容推荐失败');
      }
    } catch (error) {
      console.error('获取内容推荐错误:', error);
      message.error('获取内容推荐出错');
    } finally {
      setContentLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.warning('请先登录');
      return;
    }

    try {
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

  const handleProductClick = (productId) => {
    // 确保productId是数字类型
    const id = parseInt(productId, 10);
    // 使用数字ID进行导航
    navigate(`/consumer/product/${id}`);
  };

  const renderProductList = (products, loading) => {
    if (loading) {
      return (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      );
    }

    if (!products || products.length === 0) {
      return <Empty description="暂无推荐商品" />;
    }

    return (
      <Row gutter={[16, 16]} className="product-list">
        {products.map(product => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.productId}>
            <Card
              hoverable
              className="product-card"
              onClick={(e) => {
                handleProductClick(product.productId);
              }}
              style={{ 
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                margin: 0,
                background: '#fff',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
              cover={
                <div 
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止事件冒泡到Card
                    handleProductClick(product.productId);
                  }}
                  style={{ 
                    padding: 0, 
                    margin: 0, 
                    lineHeight: 0, 
                    fontSize: 0,
                    background: 'transparent',
                    width: '100%',
                    overflow: 'hidden'
                  }}
                >
                  {product.mainPicture ? (
                    <img 
                      alt={product.productName} 
                      src={product.mainPicture} 
                      className="product-image"
                      style={{ 
                        width: '102%', // 稍微超出一点，确保无缝连接
                        cursor: 'pointer', 
                        display: 'block',
                        marginLeft: '-1%', // 居中对齐
                        marginRight: '-1%',
                        marginBottom: '-2px' // 消除下方可能的空隙
                      }}
                    />
                  ) : (
                    <div className="no-image" style={{ 
                      cursor: 'pointer',
                      height: '220px',
                      marginBottom: '-2px'
                    }}>
                      暂无图片
                    </div>
                  )}
                </div>
              }
              actions={[
                <Button 
                  type="primary" 
                  icon={<ShoppingCartOutlined />} 
                  onClick={() => handleAddToCart(product.productId)}
                >
                  加入购物车
                </Button>
              ]}
            >
              <Meta
                title={
                  <div 
                    className="product-title" 
                    onClick={(e) => {
                      e.stopPropagation(); // 阻止事件冒泡
                      handleProductClick(product.productId);
                    }}
                    style={{ 
                      cursor: 'pointer',
                      color: '#333',
                      fontSize: '16px',
                      fontWeight: '500',
                      marginTop: '6px',
                      marginBottom: '8px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {product.productName}
                  </div>
                }
                description={
                  <div className="product-info" style={{ background: '#fff' }}>
                    <div className="product-price" style={{ color: '#f5222d', fontWeight: '600', fontSize: '18px', marginBottom: '4px' }}>
                      ¥{product.price && product.price.toFixed(2)}
                    </div>
                    {product.score && (
                      <div className="recommend-product-score">
                        推荐度: <span>{product.score.toFixed(2)}</span>
                      </div>
                    )}
                    {product.description && (
                      <div className="product-description" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {product.description}
                      </div>
                    )}
                  </div>
                }
                style={{ 
                  margin: 0, 
                  padding: '0 12px 12px',
                  background: '#fff',
                  borderTop: 'none'
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="recommendation-page">
      <div className="recommendation-header">
        {/* <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          返回
        </Button> */}
        <h1 className="page-title">个性化推荐</h1>
      </div>

      <Tabs defaultActiveKey="1" className="recommendation-tabs">
        <TabPane tab="协同过滤推荐" key="1">
          <div className="tab-content">
            <h2 className="section-subtitle">基于您的购买历史和相似用户的喜好</h2>
            {renderProductList(cfProducts, cfLoading)}
          </div>
        </TabPane>
        <TabPane tab="内容推荐" key="2">
          <div className="tab-content">
            <h2 className="section-subtitle">基于您浏览过的商品特征</h2>
            {renderProductList(contentProducts, contentLoading)}
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RecommendationPage;
