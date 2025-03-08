import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Image, 
  Typography, 
  Button, 
  message, 
  Spin,
  Tag,
  Divider
} from 'antd';
import { 
  LeftOutlined, 
  HeartOutlined, 
  HeartFilled,
  ShoppingCartOutlined 
} from '@ant-design/icons';
import { goodsService } from '../../services/goodsService';
import { cartService } from '../../services/cartService';
import { collectionService } from '../../services/collectionService';
import './ProductDetailPage.css';

const { Title, Text } = Typography;

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [isCollected, setIsCollected] = useState(false);

  // 检查是否已收藏
  const checkCollectionStatus = async () => {
    try {
      const userId = localStorage.getItem('userId');
      console.log("当前的UserID为"+userId);
      if (!userId) return;
      
      // 确保转换为数字类型
      const numUserId = parseInt(userId);
      const numProductId = parseInt(productId);
      
      if (isNaN(numUserId) || isNaN(numProductId)) {
        console.error('无效的用户ID或商品ID');
        return;
      }

      const response = await collectionService.checkCollection({
        userId: numUserId,
        productId: numProductId
      });
      
      if (response.code === 200) {
        setIsCollected(response.data);
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  };

  useEffect(() => {
    fetchProductDetail();
    checkCollectionStatus();
  }, [productId]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await goodsService.getGoodsDetail(productId);
      if (response.code === 200 && response.data) {
        setProduct(response.data);
      } else {
        message.error('获取商品详情失败');
      }
    } catch (error) {
      message.error('获取商品详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleToggleCollection = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        message.warning('请先登录');
        return;
      }

      if (isCollected) {
        // 查找收藏记录的ID
        const response = await collectionService.getCollectionList({
          userId: parseInt(userId),
          current: 1,
          size: 100
        });
        
        if (response?.data?.records) {
          const collection = response.data.records.find(
            item => item.productId === parseInt(productId)
          );
          
          if (collection) {
            await collectionService.deleteCollection(collection.id);
            setIsCollected(false);
            message.success('取消收藏成功');
          }
        }
      } else {
        await collectionService.addCollection({
          userId: parseInt(userId),
          productId: parseInt(productId)
        });
        setIsCollected(true);
        message.success('收藏成功');
      }
    } catch (error) {
      message.error(isCollected ? '取消收藏失败' : '收藏失败');
      console.error(error);
    }
  };

  const handleAddToCart = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        message.warning('请先登录');
        return;
      }

      const response = await cartService.addCart({
        userId: parseInt(userId),
        productId: parseInt(productId),
        amount: 1
      });

      if (response.code === 200) {
        message.success('已添加到购物车');
      } else {
        message.error(response.message || '添加到购物车失败');
      }
    } catch (error) {
      message.error('添加到购物车失败');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <Title level={4}>商品不存在或已下架</Title>
        <Button type="primary" onClick={handleBack}>返回上一页</Button>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail-header">
        <Button 
          type="text" 
          icon={<LeftOutlined />} 
          onClick={handleBack}
          className="back-button"
        >
          返回
        </Button>
      </div>

      <Card bordered={false} className="product-detail-card">
        <Image
          src={product.imageUrl}
          alt={product.productName}
          className="product-image"
          fallback="data:image/png;base64,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"
        />

        <div className="product-info">
          <Title level={4}>{product.productName}</Title>
          
          <div className="product-tags">
            {product.categories?.map((category) => (
              <Tag color="blue" key={category.categoryId}>
                {category.categoryName}
              </Tag>
            ))}
          </div>

          <Text type="secondary" className="product-desc">
            {product.productDesc || '暂无商品描述'}
          </Text>

          <Divider />

          <div className="price-section">
            <div className="price-item">
              <Text type="secondary">原价</Text>
              <Text delete className="original-price">¥{product.originalPrice}</Text>
            </div>
            <div className="price-item">
              <Text type="secondary">团购价</Text>
              <Text type="danger" className="group-price">¥{product.groupPrice}</Text>
            </div>
          </div>

          <div className="stock-info">
            <Text type="secondary">库存: {product.stockQuantity} 件</Text>
          </div>
        </div>
      </Card>

      <div className="action-buttons">
        <Button
          icon={isCollected ? <HeartFilled /> : <HeartOutlined />}
          onClick={handleToggleCollection}
          className={`collect-button ${isCollected ? 'collected' : ''}`}
        >
          {isCollected ? '已收藏' : '收藏'}
        </Button>
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={handleAddToCart}
          className="cart-button"
        >
          加入购物车
        </Button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
