import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Carousel, 
  Input, 
  Button, 
  Tag, 
  Spin, 
  Modal, 
  Descriptions, 
  Badge, 
  message, 
  Typography, 
  Space
} from 'antd';
import { 
  SearchOutlined, 
  ShoppingCartOutlined
} from '@ant-design/icons';
import { goodsService } from '../../services/goodsService';
import { categoryService } from '../../services/categoryService';
import { cartService } from '../../services/cartService';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]); 
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const pageSize1 = 10; 
  const pageSize2 = 999; 
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // 类别图标映射
  const categoryIcons = {
    '餐饮美食': '🍽️',
    '生鲜食品': '🥬',
    '日用百货': '🏠',
    '服装鞋帽': '👔',
    '美容护肤': '💄',
    '休闲娱乐': '🎮',
    '旅游出行': '✈️',
    '教育培训': '📚',
    '电子产品': '📱',
    '儿童用品': '🧸',
    '健康保健': '💪',
    '节日礼品': '🎁',
    '即食食品': '🥡',
    '汽车服务': '🚗',
  };

  // 加载商品数据
  const loadProducts = useCallback(async (page = 1) => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const response = await goodsService.getGoodsList({
        current: page,
        size: pageSize1
      });

      const newProducts = response.data.records || [];

      if (page === 1) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }

      // 判断是否还有更多数据
      setHasMore(newProducts.length === pageSize1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  // 处理滚动加载
  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      loadProducts(currentPage + 1);
    }
  }, [loading, hasMore, currentPage, loadProducts]);

  // 处理商品点击
  const handleProductClick = (product) => {
    navigate(`/consumer/product/${product.productId}`);
  };

  // 获取分类数据
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getActiveCategories();
      if (response.code === 200) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('获取分类列表失败:', error);
    }
  };

  // 搜索商品
  const handleSearch = async (value) => {
    setSearchValue(value);
    setSelectedCategory(null); 
    try {
      setLoading(true);
      const response = await goodsService.getGoodsList({
        current: 1,
        size: pageSize2,
        productName: value
      });

      if (response.code === 200) {
        setProducts(response.data.records || []);
        setHasMore(false); 
      }
    } catch (error) {
      console.error('搜索商品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理类别点击
  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setSearchValue(''); 
    try {
      setLoading(true);
      console.log("点击的CategotyID" + category.categoryId);
      const response = await goodsService.getGoodsList({
        current: 1,
        size: pageSize2,
        categoryId: category.categoryId
      });

      if (response.code === 200) {
        setProducts(response.data.records || []);
        setHasMore(false); 
      }
    } catch (error) {
      console.error('按类别查询商品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 重置筛选
  const resetFilters = () => {
    setSearchValue('');
    setSelectedCategory(null);
    setCurrentPage(1);
    setHasMore(true);
    loadProducts(1);
  };

  // 初始化数据
  useEffect(() => {
    loadProducts(1);
    fetchCategories(); 
  }, []);

  // 添加滚动监听
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  //添加购物车
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

  return (
    <div className="home-container" ref={containerRef}>
      {/* 搜索栏 */}
      <div className="search-bar">
        <Input
          placeholder="搜索商品名称"
          prefix={<SearchOutlined />}
          className="search-input"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* 轮播图 */}
      <Carousel autoplay className="banner-carousel">
        <div>
          <img src="https://images.squarespace-cdn.com/content/v1/62e7a92f066fa3730dcd4604/fd214ba5-c71d-4a15-8096-9d1b343fdfe9/v2-882nu-e2v26.jpg" alt="Banner 1" />
        </div>
        <div>
          <img src="https://th.bing.com/th/id/R.c04d6d26fbceb76457a55b44d8190160?rik=HNnXjsjRWMIGdQ&riu=http%3a%2f%2fwww.baicaolu.com%2fuploads%2f201508%2f1440211512NFZzLpOu.jpg&ehk=iZiyvpX0cug1l5JQ4e%2fXgRtEfQCepUGL7my9hZRbcMY%3d&risl=&pid=ImgRaw&r=0" alt="Banner 2" />
        </div>
      </Carousel>

      {/* 分类导航 */}
      <div className="category-nav">
        <div className="category-scroll">
          {categories.map((category, index) => (
            <div key={category.categoryId || index} className="category-item" onClick={() => handleCategoryClick(category)}>
              <div className="category-icon">
                {categoryIcons[category.categoryName] || '📦'}
              </div>
              <span className="category-name">{category.categoryName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 商品列表 */}
      <div className="products-grid">
        <Row gutter={[8, 16]}>
          {products.map(product => (
            <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
              <Card
                hoverable={!product.isDeleted}
                bodyStyle={{ padding: '8px' }}
                cover={
                  product.imageUrl ? (
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
                      />
                      <div className="product-tags" style={{ 
                        position: 'absolute', 
                        top: '8px', 
                        left: '8px',
                        display: 'flex',
                        gap: '4px'
                      }}>
                        {product.isHot && <Tag color="red">热销</Tag>}
                        {product.isFreeShipping && <Tag color="green">包邮</Tag>}
                      </div>
                    </div>
                  ) : (
                    <div className="no-image" style={{ 
                      paddingTop: '100%',
                      position: 'relative',
                      background: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}>暂无图片</span>
                    </div>
                  )
                }
                className={`product-card ${product.isDeleted ? 'product-sold-out' : ''}`}
                onClick={() => !product.isDeleted && handleProductClick(product)}
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
                  {product.productDesc && (
                    <div style={{ 
                      fontSize: '12px',
                      color: '#666',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: '1',
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {product.productDesc}
                    </div>
                  )}
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
                    </div>
                    <Button
                      type="primary"
                      size="middle"
                      icon={<ShoppingCartOutlined style={{ fontSize: '18px' }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product.productId, e);
                      }}
                      style={{
                        borderRadius: '20px',
                        padding: '0 16px',
                        height: '40px',
                        width: '40px',
                        minWidth: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    />
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="loading-container">
          <Spin />
        </div>
      )}

      {/* 没有更多数据的提示 */}
      {!hasMore && products.length > 0 && (
        <div className="no-more">没有更多商品了</div>
      )}
    </div>
  );
};

export default HomePage;
