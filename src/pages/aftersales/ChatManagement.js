import React, { useState, useEffect, useRef } from 'react';
import { Layout, List, Avatar, Badge, Input, Button, Typography, message, Drawer } from 'antd';
import { UserOutlined, MenuOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import { chatMessageService } from '../../services/chatMessageService';
import { userService } from '../../services/userService';

const { Content, Sider } = Layout;
const { TextArea } = Input;
const { Title } = Typography;

const ChatManagement = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  // 从localStorage获取当前用户ID
  const currentUserId = localStorage.getItem('userId');

  // 获取聊天列表
  // 获取用户详细信息
  const fetchUserDetails = async (userId) => {
    try {
      const response = await userService.getUserById(userId);
      if (response?.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('获取用户信息错误:', error);
      return null;
    }
  };

  const fetchChatList = async () => {
    try {
      setLoading(true);
      const response = await chatMessageService.getChatList(currentUserId);
      if (response?.data) {
        // 获取所有联系人的详细信息
        const contactsWithDetails = await Promise.all(
          response.data.map(async (chat) => {
            const userDetails = await fetchUserDetails(chat.partnerId);
            return {
              id: chat.chatId,
              userId: chat.partnerId,
              name: userDetails ? userDetails.fullname : `用户 ${chat.partnerId}`,
              lastMsgTime: chat.lastMsgTime,
              unread: 0,
              phoneNumber: userDetails?.phoneNumber,
              email: userDetails?.email
            };
          })
        );
        setContacts(contactsWithDetails);
      }
    } catch (error) {
      message.error('获取聊天列表失败');
      console.error('获取聊天列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取聊天列表
  useEffect(() => {
    if (currentUserId) {
      fetchChatList();
    } else {
      message.error('请先登录');
    }
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesContainerRef = useRef(null);

  // 获取聊天历史记录
  const fetchChatHistory = async (chatId, page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
        setMessages([]);
      } else {
        setLoadingMore(true);
      }

      const response = await chatMessageService.getChatHistory(chatId, page, 20);
      
      if (response?.data?.records) {
        const formattedMessages = response.data.records
          .map(msg => ({
            id: msg.msgId,
            content: msg.msgContent,
            timestamp: msg.sendTime,
            chatId: msg.chatId,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            status: msg.msgStatus,
            isSentByMe: msg.senderId === parseInt(currentUserId)
          }))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // 按时间升序排序，较早的在前面

        if (page === 1) {
          setMessages(formattedMessages);
        } else {
          setMessages(prev => [...formattedMessages, ...prev]); // 历史消息添加到前面
        }

        // 检查是否还有更多消息
        setHasMore(formattedMessages.length === 20);
        setCurrentPage(page);
      }
    } catch (error) {
      message.error('获取聊天记录失败');
      console.error('获取聊天记录错误:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 加载更多历史消息
  const handleLoadMore = () => {
    if (selectedContact && hasMore && !loadingMore) {
      fetchChatHistory(selectedContact.id, currentPage + 1);
    }
  };

  // 监听滚动事件加载更多消息
  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && hasMore && !loadingMore) {
      handleLoadMore();
    }
  };

  // 当选择联系人时更新消息列表
  useEffect(() => {
    if (selectedContact) {
      setCurrentPage(1);
      setHasMore(true);
      fetchChatHistory(selectedContact.id, 1);
    } else {
      setMessages([]);
      setCurrentPage(1);
      setHasMore(true);
    }
  }, [selectedContact]);

  const [sending, setSending] = useState(false);

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || !currentUserId) {
      message.warning('请输入消息内容');
      return;
    }

    try {
      setSending(true);
      const messageContent = newMessage.trim();
      
      // 确保ID是数字类型
      const senderIdNum = parseInt(currentUserId);
      const receiverIdNum = parseInt(selectedContact.userId);
      
      if (isNaN(senderIdNum) || isNaN(receiverIdNum)) {
        throw new Error('发送者或接收者ID格式不正确');
      }

      const response = await chatMessageService.sendMessage(senderIdNum, receiverIdNum, messageContent);
      
      if (response.success) {
        // 构建新消息对象
        const newMsg = {
          id: response?.data?.msgId || Date.now(),
          content: messageContent,
          timestamp: new Date().toISOString(),
          chatId: selectedContact.id,
          senderId: senderIdNum,
          receiverId: receiverIdNum,
          status: 0,
          isSentByMe: true
        };

        setMessages(prev => [...prev, newMsg]); // 新消息添加到列表末尾
        setNewMessage('');
        
        // 刷新聊天列表以更新最后一条消息
        fetchChatList();
      } else {
        message.error('发送失败：' + response.message);
      }
    } catch (error) {
      message.error('发送消息失败');
      console.error('发送消息错误:', error);
    } finally {
      setSending(false);
    }
  };

  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div style={{ height: '100%', marginLeft: isMobile ? 0 : 80 }}>
    <Layout style={{ height: '100%', backgroundColor: '#fff' }}>
      {!isMobile && (
        <Sider width={300} theme="light" style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 200,
          top: 0,
          bottom: 0,
          borderRight: '1px solid #f0f0f0'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f0f0f0' }}>
            <Title level={4} style={{ margin: 0 }}>聊天列表</Title>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '0 4px' }}>
            <List
              itemLayout="horizontal"
              loading={loading}
              dataSource={contacts}
              renderItem={(contact) => (
                <List.Item
                  onClick={() => setSelectedContact(contact)}
                  style={{
                    padding: '12px 20px',
                    cursor: 'pointer',
                    backgroundColor: selectedContact?.id === contact.id ? '#e6f7ff' : 'transparent',
                  }}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={contact.name}
                    description={
                      <div>
                        <div>{contact.phoneNumber}</div>
                        <div style={{ color: '#999', fontSize: '12px' }}>
                          {new Date(contact.lastMsgTime).toLocaleString()}
                        </div>
                      </div>
                    }
                  />
                  {contact.unread > 0 && (
                    <Badge count={contact.unread} style={{ backgroundColor: '#1890ff' }} />
                  )}
                </List.Item>
              )}
            />
          </div>
        </Sider>
      )}
      <Content style={{ 
        marginLeft: isMobile ? 0 : 380, // 考虑了主导航栏的宽度和聊天列表的宽度
        padding: '24px', 
        overflow: 'auto', 
        height: '100vh',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {isMobile && (
          <div className="mobile-header" style={{
            padding: '12px 16px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <Button 
              icon={<MenuOutlined />} 
              onClick={toggleDrawer}
              style={{ marginRight: '12px' }}
            />
            <span style={{ fontSize: '16px', fontWeight: 500 }}>
              {selectedContact ? selectedContact.name : '聊天系统'}
            </span>
          </div>
        )}
        {selectedContact ? (
          <>
            {!isMobile && (
              <div style={{ 
                padding: '12px 20px', 
                borderBottom: '1px solid #f0f0f0'
              }}>
                <Title level={4} style={{ margin: 0 }}>{selectedContact.name}</Title>
              </div>
            )}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                margin: '20px 0'
              }}
            >
              {loadingMore && (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  加载更多消息...
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.isSentByMe ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: msg.isSentByMe ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: msg.isSentByMe ? '#1890ff' : '#ffa940',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '20px'
                        }}
                      >
                        <UserOutlined />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: msg.isSentByMe ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            padding: '10px 16px',
                            borderRadius: msg.isSentByMe ? '15px 15px 0 15px' : '15px 15px 15px 0',
                            backgroundColor: msg.isSentByMe ? '#1890ff' : '#f0f0f0',
                            color: msg.isSentByMe ? 'white' : 'black',
                            wordBreak: 'break-word',
                          }}
                        >
                          {msg.content}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#999',
                            marginTop: '4px',
                          }}
                        >
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '20px 0 0 0', borderTop: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <TextArea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="请输入消息"
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  style={{ flex: 1 }}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  loading={sending}
                  disabled={!newMessage.trim()}
                  style={{ height: 'auto' }}
                >
                  发送
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Title level={3}>请选择一个联系人开始聊天</Title>
          </div>
        )}
      </Content>
    </Layout>
    </div>
  );
};

export default ChatManagement;
