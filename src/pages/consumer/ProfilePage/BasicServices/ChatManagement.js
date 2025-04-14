import React, { useState, useEffect, useCallback } from 'react';
import { Layout, message, Button, Drawer, Space } from 'antd';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { userService } from '../../../../services/userService';
import ChatContactList from '../../../../components/Chat/ChatContactList';
import ChatWindow from '../../../../components/Chat/ChatWindow';
import MessageInput from '../../../../components/Chat/MessageInput';
import './ChatManagement.css';

const { Sider, Content } = Layout;

const ChatManagement = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [chatWindowRef, setChatWindowRef] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUserId(parseInt(userId));
    } else {
      message.error('未找到用户信息');
    }

    // 检测屏幕大小，设置移动端标志
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    try {
      // 这里需要实现获取聊天对象信息的逻辑
      const response = await userService.getUserById(chat.partnerId);
      if (response.success) {
        setPartnerInfo(response.data);
      }
    } catch (error) {
      console.error('获取聊天对象信息失败:', error);
      message.error('获取聊天对象信息失败');
    }
  };

  const handleMessageSent = (newMessage) => {
    console.log('消息发送成功:', newMessage);
    // 如果有新消息并且有效的chatWindowRef，直接添加到聊天窗口
    if (newMessage && chatWindowRef && chatWindowRef.addNewMessage) {
      chatWindowRef.addNewMessage(newMessage);
    }
  };

  // 切换抽屉可见性
  const toggleDrawer = useCallback(() => {
    setDrawerVisible(prev => !prev);
  }, []);

  // 在移动端选择聊天后关闭抽屉
  const handleMobileChatSelect = useCallback((chat) => {
    handleChatSelect(chat);
    if (isMobile) {
      setDrawerVisible(false);
    }
  }, [isMobile, handleChatSelect]);

  // 渲染聊天列表
  const renderChatContactList = useCallback(() => (
    <ChatContactList
      onSelectChat={isMobile ? handleMobileChatSelect : handleChatSelect}
      selectedChatId={selectedChat?.chatId}
      getPartnerInfo={async (partnerId) => {
        try {
          const response = await userService.getUserById(partnerId);
          return response.success ? response.data : null;
        } catch (error) {
          console.error('获取用户信息失败:', error);
          return null;
        }
      }}
    />
  ), [isMobile, selectedChat, handleMobileChatSelect, handleChatSelect]);

  // 渲染聊天内容
  const renderChatContent = useCallback(() => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {selectedChat ? (
        <>
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px 20px 32px',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '12px'
          }}>
            <ChatWindow
              chatId={selectedChat.chatId}
              currentUserId={currentUserId}
              partnerInfo={partnerInfo}
              onRef={setChatWindowRef}
            />
          </div>
          <div style={{
            position: 'sticky',
            bottom: 0,
            padding: '16px 20px',
            backgroundColor: '#fff',
            borderTop: '1px solid #f0f0f0',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.06)'
          }}>
            <MessageInput
              chatId={selectedChat.chatId}
              senderId={currentUserId}
              receiverId={selectedChat.partnerId}
              onMessageSent={handleMessageSent}
            />
          </div>
        </>
      ) : (
        <div className="no-chat-selected">
          <p>请选择一个聊天</p>
        </div>
      )}
    </div>
  ), [selectedChat, currentUserId, partnerInfo, handleMessageSent]);

  return (
    <Layout 
      className="chat-management"
      style={{
        position: 'fixed',
        top: 64, // UserAvatar组件的高度
        left: 0,
        right: 0,
        bottom: 0,
        background: '#fff',
        zIndex: 99
      }}
    >
      {isMobile ? (
        // 移动端布局
        <>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            height: 56, // 固定高度
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <Button 
              type="link" 
              icon={<MenuOutlined />} 
              onClick={toggleDrawer}
              style={{ 
                marginRight: 16,
                fontSize: '16px',
                padding: '4px 15px',
                height: '32px'
              }}
            >
              联系人
            </Button>
            <div style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: 500,
              color: '#000',
              margin: 0
            }}>
              {selectedChat && partnerInfo ? 
                (partnerInfo.fullname || partnerInfo.username || '未知用户') : 
                '聊天系统'}
            </div>
          </div>
          
          <Content style={{
            marginTop: 56, // 留出固定头部的空间
            height: 'calc(100% - 56px)', // 减去固定头部的高度
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {selectedChat ? (
              <>
                <ChatWindow
                  chatId={selectedChat.chatId}
                  currentUserId={currentUserId}
                  partnerInfo={partnerInfo}
                  style={{ flex: 1 }}
                  onRef={setChatWindowRef}
                />
                <div style={{
                  padding: '16px 20px',
                  backgroundColor: '#fff',
                  borderTop: '1px solid #f0f0f0',
                  boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
                  marginTop: '12px'
                }}>
                  <MessageInput
                    chatId={selectedChat.chatId}
                    senderId={currentUserId}
                    receiverId={selectedChat.partnerId}
                    onMessageSent={handleMessageSent}
                  />
                </div>
              </>
            ) : (
              <div className="no-chat-selected">
                <p>请选择一个聊天</p>
              </div>
            )}
          </Content>
          
          <Drawer 
            title="联系人列表" 
            placement="left"
            closable={true}
            onClose={toggleDrawer}
            open={drawerVisible}
            width={280}
            closeIcon={<CloseOutlined />}
            bodyStyle={{ padding: 0, height: '100%' }}
          >
            <ChatContactList
              onSelectChat={handleMobileChatSelect}
              selectedChatId={selectedChat?.chatId}
              getPartnerInfo={async (partnerId) => {
                try {
                  const response = await userService.getUserById(partnerId);
                  return response.success ? response.data : null;
                } catch (error) {
                  console.error('获取用户信息失败:', error);
                  return null;
                }
              }}
            />
          </Drawer>
        </>
      ) : (
        // 桌面端布局
        <>
          <Sider width={300} theme="light" className="chat-sider">
            {renderChatContactList()}
          </Sider>
          <Content className="chat-content">
            {renderChatContent()}
          </Content>
        </>
      )}
    </Layout>
  );
};

export default ChatManagement;
