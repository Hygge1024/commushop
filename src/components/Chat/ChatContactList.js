import React, { useState, useEffect } from 'react';
import { List, Avatar, Badge, Spin, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { chatMessageService } from '../../services/chatMessageService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const ChatContactList = ({ 
  onSelectChat,
  selectedChatId,
  getPartnerInfo, // 回调函数，用于获取聊天对象的信息
  style
}) => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatList, setChatList] = useState([]);
  const [error, setError] = useState(null);

  // 加载聊天列表
  const loadChatList = async () => {
    try {
      setLoading(true);
      console.log('userId:', userId);
      const response = await chatMessageService.getChatList(userId);
      if (response.success) {
        const chats = response.data;
        // 获取每个聊天对象的详细信息
        const chatsWithInfo = await Promise.all(
          chats.map(async (chat) => {
            const partnerInfo = await getPartnerInfo(chat.partnerId);
            return {
              ...chat,
              partnerInfo
            };
          })
        );
        setChatList(chatsWithInfo);
      } else {
        setError('获取聊天列表失败');
      }
    } catch (err) {
      setError('加载聊天列表时出错');
      console.error('加载聊天列表错误:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadChatList();
    }
  }, [userId]);

  const renderItem = (item) => {
    const { chatId, partnerInfo, lastMsgTime, unreadCount } = item;
    const isSelected = selectedChatId === chatId;

    return (
      <List.Item
        key={chatId}
        onClick={() => onSelectChat(item)}
        style={{
          background: isSelected ? '#e6f7ff' : 'white',
          cursor: 'pointer',
          padding: '12px 24px',
          transition: 'background 0.3s'
        }}
        className="chat-contact-item"
      >
        <List.Item.Meta
          avatar={
            <Badge count={unreadCount || 0}>
              <Avatar 
                icon={<UserOutlined />}
                src={partnerInfo?.avatar}
                size="large"
              />
            </Badge>
          }
          title={
            <span style={{ color: isSelected ? '#1890ff' : 'rgba(0, 0, 0, 0.85)' }}>
              {partnerInfo?.fullname || partnerInfo?.username || '未知用户'}
            </span>
          }
          description={
            <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
              {dayjs(lastMsgTime).fromNow()}
            </span>
          }
        />
      </List.Item>
    );
  };

  if (error) {
    return <Empty description={error} />;
  }

  return (
    <div 
      style={{ ...style, borderRight: '1px solid #f0f0f0', height: '100%', overflow: 'hidden' }}
      className="chat-contact-list"
    >
      <Spin spinning={loading}>
        <List
          dataSource={chatList}
          renderItem={renderItem}
          style={{
            height: '100%',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch' // 提升移动端滚动体验
          }}
          locale={{ emptyText: '暂无聊天' }}
        />
      </Spin>
    </div>
  );
};

export default ChatContactList;
