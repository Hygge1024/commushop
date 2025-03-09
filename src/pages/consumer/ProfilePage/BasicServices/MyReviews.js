import React, { useState, useEffect } from 'react';
import { Card, Rate, List, Avatar, Tag, Empty, Tabs, Button, message, Modal, Pagination } from 'antd';
import { StarOutlined, DeleteOutlined } from '@ant-design/icons';
import { evaluationService } from '../../../../services/evaluationService';
import './MyReviews.css';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchReviews = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      const userId = parseInt(localStorage.getItem('userId'), 10);
      const response = await evaluationService.getEvaluationList({
        current: page,
        size: size,
        userId: userId
      });

      if (response.code === 200 && response.data) {
        setReviews(response.data.records || []);
        setPagination({
          current: response.data.current,
          pageSize: response.data.size,
          total: response.data.total || 0
        });
      } else {
        message.error('获取评价列表失败');
      }
    } catch (error) {
      console.error('获取评价列表失败:', error);
      message.error('获取评价列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (evaluationId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条评价吗？删除后不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await evaluationService.deleteEvaluation(evaluationId);
          if (response.code === 200) {
            message.success('删除成功');
            fetchReviews(pagination.current, pagination.pageSize);
          } else {
            message.error('删除失败');
          }
        } catch (error) {
          console.error('删除评价失败:', error);
          message.error('删除失败');
        }
      }
    });
  };

  const handlePageChange = (page, pageSize) => {
    fetchReviews(page, pageSize);
  };

  const getScoreColor = (score) => {
    if (score >= 9) return '#52c41a'; // 优秀
    if (score >= 7) return '#1890ff'; // 良好
    if (score >= 5) return '#faad14'; // 一般
    return '#ff4d4f'; // 差
  };

  const IconText = ({ icon, text, color }) => (
    <span className="review-action" style={{ color }}>
      {React.createElement(icon)}
      <span className="action-text">{text}</span>
    </span>
  );

  return (
    <div className="my-reviews-container">
      <Card title="我的评价" className="reviews-card">
        {reviews.length > 0 ? (
          <>
            <List
              loading={loading}
              itemLayout="vertical"
              size="large"
              dataSource={reviews}
              renderItem={review => (
                <List.Item
                  key={review.evaluationId}
                  actions={[
                    <IconText 
                      icon={StarOutlined} 
                      text={`${review.evaluationScore}分`} 
                      color={getScoreColor(review.evaluationScore)}
                      key="rating" 
                    />,
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteReview(review.evaluationId)}
                    >
                      删除
                    </Button>
                  ]}
                  extra={
                    <div className="review-time">
                      {review.createTime ? new Date(review.createTime).toLocaleDateString() : '暂无时间'}
                    </div>
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        src={review.imageUrl} 
                        shape="square"
                        size={64}
                      />
                    }
                    title={
                      <div className="review-header">
                        <span className="product-name">{review.productName}</span>
                        <Rate 
                          disabled 
                          defaultValue={review.evaluationScore / 2} 
                          style={{ marginLeft: '8px' }}
                        />
                      </div>
                    }
                    description={
                      <div className="review-tags">
                        <Tag color="blue">{review.fullname}</Tag>
                        <Tag color="green">用户名: {review.username}</Tag>
                        <Tag color={getScoreColor(review.evaluationScore)}>
                          {review.evaluationScore >= 9 ? '优秀' : 
                           review.evaluationScore >= 7 ? '良好' : 
                           review.evaluationScore >= 5 ? '一般' : '差'}
                        </Tag>
                      </div>
                    }
                  />
                  <div className="review-content">
                    {review.evaluationContent}
                  </div>
                </List.Item>
              )}
            />
            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `共 ${total} 条评价`}
              />
            </div>
          </>
        ) : (
          <Empty
            description={loading ? "加载中..." : "暂无评价"}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  );
};

export default MyReviews;
