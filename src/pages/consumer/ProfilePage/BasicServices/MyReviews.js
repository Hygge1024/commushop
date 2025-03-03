import React, { useState, useEffect } from 'react';
import { Card, Rate, List, Avatar, Tag, Empty, Tabs } from 'antd';
import { LikeOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import './MyReviews.css';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  // 模拟评价数据
  const mockReviews = [
    {
      id: 1,
      productId: '001',
      productName: '优质咖啡豆',
      productImage: 'https://th.bing.com/th/id/OIP.0-BgPeK_ybgR31WCDHoaMgHaFj?rs=1&pid=ImgDetMain',
      rating: 5,
      content: '非常好喝的咖啡豆，香味浓郁，口感顺滑。',
      createTime: '2025-03-01',
      likes: 12,
      replies: 3,
      images: ['image1.jpg', 'image2.jpg'],
      status: 'published'
    },
    {
      id: 2,
      productId: '002',
      productName: '手冲咖啡壶',
      productImage: 'https://th.bing.com/th/id/OIP.aOSfvQ5RimjDgG-3E38sMgHaHa?rs=1&pid=ImgDetMain',
      rating: 4,
      content: '做工精细，使用方便，就是价格稍贵。',
      createTime: '2025-02-28',
      likes: 8,
      replies: 1,
      status: 'published'
    }
  ];

  useEffect(() => {
    // TODO: 从后端获取评价数据
    setReviews(mockReviews);
  }, []);

  const tabItems = [
    {
      key: 'all',
      label: '全部评价',
    },
    {
      key: 'published',
      label: '已发布',
    },
    {
      key: 'pending',
      label: '待评价',
    }
  ];

  const IconText = ({ icon, text }) => (
    <span className="review-action">
      {React.createElement(icon)}
      <span className="action-text">{text}</span>
    </span>
  );

  const filterReviews = (tab) => {
    switch (tab) {
      case 'published':
        return reviews.filter(review => review.status === 'published');
      case 'pending':
        return reviews.filter(review => review.status === 'pending');
      default:
        return reviews;
    }
  };

  return (
    <div className="my-reviews-container">
      <Card title="我的评价" className="reviews-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
        
        {filterReviews(activeTab).length > 0 ? (
          <List
            itemLayout="vertical"
            size="large"
            dataSource={filterReviews(activeTab)}
            renderItem={review => (
              <List.Item
                key={review.id}
                actions={[
                  <IconText icon={StarOutlined} text={review.rating} key="rating" />,
                  <IconText icon={LikeOutlined} text={review.likes} key="likes" />,
                  <IconText icon={MessageOutlined} text={review.replies} key="replies" />
                ]}
                extra={
                  <div className="review-time">{review.createTime}</div>
                }
              >
                <List.Item.Meta
                  avatar={<Avatar src={review.productImage} />}
                  title={
                    <div className="review-header">
                      <span className="product-name">{review.productName}</span>
                      <Rate disabled defaultValue={review.rating} />
                    </div>
                  }
                  description={
                    <div className="review-tags">
                      <Tag color="blue">已购买</Tag>
                      {review.images?.length > 0 && <Tag color="green">有图片</Tag>}
                    </div>
                  }
                />
                <div className="review-content">{review.content}</div>
                {review.images && review.images.length > 0 && (
                  <div className="review-images">
                    {review.images.map((image, index) => (
                      <img key={index} src={image} alt={`评价图片 ${index + 1}`} />
                    ))}
                  </div>
                )}
              </List.Item>
            )}
          />
        ) : (
          <Empty
            description="暂无评价"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  );
};

export default MyReviews;
