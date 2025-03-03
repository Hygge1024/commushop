import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Row, Col, Carousel, Input, Button, Tag, Spin, Modal, Descriptions, Badge } from 'antd';
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { goodsService } from '../../services/goodsService';
import { categoryService } from '../../services/categoryService';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [categories, setCategories] = useState([]); // 新增categories状态
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const pageSize1 = 10; // 设置较大的size以获取所有数据

  const pageSize2 = 999; // 设置较大的size以获取所有数据
  const containerRef = useRef(null);

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
    setSelectedProduct(product);
    setModalVisible(true);
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
    setSelectedCategory(null); // 清除已选类别
    try {
      setLoading(true);
      const response = await goodsService.getGoodsList({
        current: 1,
        size: pageSize2,
        productName: value
      });
      
      if (response.code === 200) {
        setProducts(response.data.records || []);
        setHasMore(false); // 禁用无限滚动，因为我们已经获取了所有数据
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
    setSearchValue(''); // 清除搜索框的值
    try {
      setLoading(true);
      console.log("点击的CategotyID"+category.categoryId);
      const response = await goodsService.getGoodsList({
        current: 1,
        size: pageSize2,
        categoryId: category.categoryId
      });
      
      if (response.code === 200) {
        setProducts(response.data.records || []);
        setHasMore(false); // 禁用无限滚动，因为我们已经获取了所有数据
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
    fetchCategories(); // 获取分类数据
  }, []);

  // 添加滚动监听
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

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
        <Row gutter={[16, 16]}>
          {products.map(product => (
            <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
              <Card
                hoverable={!product.isDeleted}
                cover={
                  product.imageUrl ? (
                    <img 
                      alt={product.productName} 
                      src={product.imageUrl}
                      style={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div className="no-image">暂无图片</div>
                  )
                }
                className={`product-card ${product.isDeleted ? 'product-sold-out' : ''}`}
                onClick={() => !product.isDeleted && handleProductClick(product)}
              >
                <div className="product-tags">
                  {product.isHot && <Tag color="red">热销</Tag>}
                  {product.isFreeShipping && <Tag color="green">包邮</Tag>}
                </div>
                <div className="product-title">{product.productName.toUpperCase()}</div>
                {product.productDesc && 
                  <div className="product-description">{product.productDesc.toLowerCase()}</div>
                }
                <div className="product-price">
                  <div className="price-info">
                    <div className="current-price">
                      <span className="price-symbol">¥</span>
                      <span className="price-value">{product.groupPrice.toFixed(2)}</span>
                    </div>
                    <div className="original-price">
                      ¥{product.originalPrice.toFixed(2)}
                    </div>
                  </div>
                  <Button 
                    type="primary" 
                    className="cart-button"
                    size={window.innerWidth < 576 ? 'small' : window.innerWidth < 992 ? 'middle' : 'large'}
                    icon={<ShoppingCartOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      // 处理加入购物车逻辑
                    }}
                  >
                    加入购物车
                  </Button>
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

      {/* 商品详情弹窗 */}
      <Modal
        title="商品详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button 
            key="cart" 
            type="primary" 
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              // 处理加入购物车逻辑
              setModalVisible(false);
            }}
          >
            加入购物车
          </Button>,
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {selectedProduct && (
          <div className="product-detail">
            <div className="product-detail-image">
              {selectedProduct.imageUrl ? (
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.productName}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div className="no-image">暂无图片</div>
              )}
            </div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="商品名称" span={2}>
                {selectedProduct.productName}
              </Descriptions.Item>
              <Descriptions.Item label="商品描述" span={2}>
                {selectedProduct.productDesc}
              </Descriptions.Item>
              <Descriptions.Item label="原价">
                ¥{selectedProduct.originalPrice.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="团购价">
                <span className="group-price">
                  ¥{selectedProduct.groupPrice.toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="库存">
                {selectedProduct.stockQuantity}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge status="processing" text="在售" />
              </Descriptions.Item>
              <Descriptions.Item label="商品分类" span={2}>
                {selectedProduct.categories?.map(category => (
                  <Tag key={category.categoryId} color="blue">
                    {category.categoryName}
                  </Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HomePage;
