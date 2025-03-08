import React, { useState, useEffect } from 'react';
import { Card, Button, message, Empty, Row, Col, Typography, Tag, Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { collectionService } from '../../../../services/collectionService';
import styles from './Favorites.module.css';

const { Text, Title } = Typography;

const Favorites = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const response = await collectionService.getCollectionList({
        userId: parseInt(userId),
        current: 1,
        size: 999
      });
      
      if (response?.data?.records) {
        // 不反转数组顺序，保持原始顺序
        setCollections(response.data.records);
      }
    } catch (error) {
      message.error('获取收藏列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleRemoveFromFavorites = async (collectionId) => {
    try {
      await collectionService.deleteCollection(collectionId);
      message.success('取消收藏成功');
      fetchCollections();
    } catch (error) {
      message.error('取消收藏失败');
      console.error(error);
    }
  };

  const handleViewDetail = (productId) => {
    navigate(`/consumer/product/${productId}`);
  };

  if (loading) {
    return (
      <div className={styles.favoritesContainer}>
        <Title level={4} className={styles.pageTitle}>我的收藏</Title>
        {[1, 2].map((item) => (
          <Card key={item} className={styles.productCard}>
            <Skeleton active avatar paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </div>
    );
  }

  if (!collections.length) {
    return (
      <div className={styles.favoritesContainer}>
        <Title level={4} className={styles.pageTitle}>我的收藏</Title>
        <Empty
          description="暂无收藏商品"
          className={styles.emptyState}
        />
      </div>
    );
  }

  return (
    <div className={styles.favoritesContainer}>
      <Title level={4} className={styles.pageTitle}>我的收藏</Title>
      <Row gutter={[16, 16]}>
        {collections.map((item) => (
          <Col xs={24} sm={12} key={item.id}>
            <Card
              className={styles.productCard}
              cover={
                <div className={styles.imageContainer}>
                  <img
                    alt={item.productName}
                    src={item.productImage}
                    className={styles.productImage}
                  />
                </div>
              }
              actions={[
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(item.productId)}
                  className={styles.actionButton}
                >
                  查看详情
                </Button>,
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveFromFavorites(item.id)}
                  className={styles.actionButton}
                >
                  取消收藏
                </Button>
              ]}
            >
              <Card.Meta
                title={item.productName}
                description={
                  <div className={styles.productInfo}>
                    <div className={styles.priceInfo}>
                      <Text type="danger" className={styles.currentPrice}>
                        ¥{item.groupPrice}
                      </Text>
                      {item.originalPrice > item.groupPrice && (
                        <Text delete className={styles.originalPrice}>
                          ¥{item.originalPrice}
                        </Text>
                      )}
                    </div>
                    {item.categories?.map((category) => (
                      <Tag color="blue" key={category.categoryId}>
                        {category.categoryName}
                      </Tag>
                    ))}
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Favorites;
