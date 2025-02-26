import React from 'react';
import { Input, Row, Col, Button } from 'antd';
import { SearchOutlined, HomeOutlined, AppstoreOutlined, UserOutlined } from '@ant-design/icons';
import './ConsumerHome.css';

const ConsumerHome = () => {
  const categories = [
    { icon: <AppstoreOutlined />, text: '全部', color: '#ff4d4f' },
    { icon: <AppstoreOutlined />, text: '限时折扣', color: '#ff4d4f' },
    { icon: <AppstoreOutlined />, text: '热品推荐', color: '#ff69b4' },
    { icon: <AppstoreOutlined />, text: '领券', color: '#40a9ff' },
    { icon: <UserOutlined />, text: '限时拼团', color: '#722ed1' },
    { icon: <AppstoreOutlined />, text: '3C数码', color: '#40a9ff' },
    { icon: <AppstoreOutlined />, text: '美妆', color: '#ff69b4' },
    { icon: <AppstoreOutlined />, text: '3C数码', color: '#40a9ff' },
    { icon: <AppstoreOutlined />, text: '美妆', color: '#ff69b4' },
    { icon: <AppstoreOutlined />, text: '箱包', color: '#ff4d4f' },
  ];

  return (
    <div className="consumer-home">
      {/* Search Bar */}
      <div className="search-bar">
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索商品"
          className="search-input"
        />
      </div>

      {/* Banner */}
      <div className="banner">
        <img src="/banner-image.jpg" alt="专业防晒" className="banner-img" />
      </div>

      {/* Category Grid */}
      <div className="category-grid">
        <Row gutter={[16, 16]}>
          {categories.map((category, index) => (
            <Col span={4.8} key={index}>
              <div className="category-item">
                <div className="category-icon" style={{ color: category.color }}>
                  {category.icon}
                </div>
                <div className="category-text">{category.text}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* New User Promotion */}
      <div className="new-user-promo">
        <div className="promo-content">
          <h3>新人首单0元购</h3>
          <Button type="primary" className="promo-button">GO</Button>
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="bottom-sections">
        <div className="section">
          <h4>天天更实惠</h4>
          <p>每天都的优惠商品</p>
          <img src="/daily-deals.jpg" alt="Daily Deals" />
        </div>
        <div className="section">
          <h4>积分当钱花</h4>
          <p>积分兑换等你来拿</p>
          <img src="/points-rewards.jpg" alt="Points Rewards" />
        </div>
        <div className="section">
          <h4>不出门安心享</h4>
          <p>生活购物在家办</p>
          <img src="/home-shopping.jpg" alt="Home Shopping" />
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="nav-bar">
        <div className="nav-item active">
          <HomeOutlined />
          <span>首页</span>
        </div>
        <div className="nav-item">
          <AppstoreOutlined />
          <span>分类</span>
        </div>
        <div className="nav-item">
          <UserOutlined />
          <span>我的</span>
        </div>
      </div>
    </div>
  );
};

export default ConsumerHome;