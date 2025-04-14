import React, { useState, useEffect, useRef } from 'react';
import { List, Avatar, Spin, Empty, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { chatMessageService } from '../../services/chatMessageService';
import dayjs from 'dayjs';
import './ChatWindow.css';

const ChatWindow = ({
  chatId,
  currentUserId,
  partnerInfo,
  onLoadMore,
  style,
  onRef // 添加ref回调属性
}) => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    size: 20
  });
  const messagesEndRef = useRef(null);

  const loadMessages = async (page = 1) => {
    if (!chatId) return;
    
    try {
      setLoading(true);
      const response = await chatMessageService.getChatHistory(chatId, page, pagination.size);
      
      if (response.success && response.data) {
        const { records, total, current, size } = response.data;
        
        // 对消息按时间排序，确保最新的消息在最后
        const sortedRecords = records.sort((a, b) => 
          new Date(a.sendTime) - new Date(b.sendTime)
        );
        
        if (page > 1) {
          setMessages(prev => [...sortedRecords, ...prev]);
        } else {
          setMessages(sortedRecords);
        }
        
        setPagination({
          current,
          total,
          size
        });
      }
    } catch (error) {
      console.error('加载聊天记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 添加新消息的方法
  const addNewMessage = (newMessage) => {
    if (!newMessage) return;
    
    console.log('添加新消息:', newMessage);
    setMessages(prev => [...prev, newMessage]);
    
    // 如果是接收到的消息，自动标记为已读
    if (newMessage.senderId !== currentUserId && chatId) {
      markMessagesAsRead();
    }
  };

  // 将方法暴露给父组件
  useEffect(() => {
    if (onRef) {
      onRef({ addNewMessage, loadMessages });
    }
    return () => {
      if (onRef) {
        onRef(null);
      }
    };
  }, []);

  // 标记消息为已读
  const markMessagesAsRead = async () => {
    if (!chatId || !currentUserId) return;
    
    try {
      console.log('标记消息为已读:', { chatId, userId: currentUserId });
      const response = await chatMessageService.markAsRead(chatId, currentUserId);
      
      if (response.success) {
        console.log('消息标记已读成功');
      } else {
        console.error('消息标记已读失败:', response.message);
      }
    } catch (error) {
      console.error('消息标记已读错误:', error);
    }
  };

  // 首次加载和chatId变化时加载消息并标记为已读
  useEffect(() => {
    if (chatId) {
      loadMessages();
      markMessagesAsRead();
    }
  }, [chatId, currentUserId]);

  // 滚动到底部
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  // 新消息加载后滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLoadMore = () => {
    if (loading) return;
    const nextPage = pagination.current + 1;
    if (nextPage <= Math.ceil(pagination.total / pagination.size)) {
      loadMessages(nextPage);
    }
  };

  const renderMessage = (message) => {
    const isSender = message.senderId === currentUserId;
    const avatarSrc = isSender ? undefined : partnerInfo?.avatar;
    
    return (
      <div
        key={message.msgId}
        className={`message-item ${isSender ? 'message-right' : 'message-left'}`}
      >
        <div className="message-content">
          <div className="message-avatar">
            <Avatar
              icon={<UserOutlined />}
              src={avatarSrc}
              size="large"
              style={{ backgroundColor: isSender ? '#1890ff' : '#faad14' }}
            />
          </div>
          <div className="message-bubble">
            <div className="message-text">{message.msgContent}</div>
            <div className="message-time">
              {dayjs(message.sendTime).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!chatId) {
    return <Empty description="请选择一个聊天" />;
  }

  return (
    <div className="chat-window" style={{ height: '100%', ...style }}>
      <div className="chat-messages" style={{ 
        height: '100%', 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px'
      }}>
        {loading && (
          <div className="loading" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            padding: '20px' 
          }}>
            <Spin />
          </div>
        )}
        {pagination.current * pagination.size < pagination.total && (
          <div className="load-more">
            <Button
              type="link"
              loading={loading}
              onClick={handleLoadMore}
            >
              加载更多
            </Button>
          </div>
        )}
        <Spin spinning={loading}>
          <List
            dataSource={messages}
            renderItem={renderMessage}
            locale={{ emptyText: '暂无消息' }}
          />
        </Spin>
        <div ref={messagesEndRef} style={{ height: 0, marginTop: 'auto' }} />
      </div>
    </div>
  );
};

export default ChatWindow;
