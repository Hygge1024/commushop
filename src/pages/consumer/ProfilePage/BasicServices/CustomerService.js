import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, List, Avatar, Typography, Space, message, Spin } from 'antd';
import { SendOutlined, RobotOutlined } from '@ant-design/icons';
import { chatService } from '../../../../services/chatService';

const { Text } = Typography;



const CustomerService = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const username = parseInt(localStorage.getItem('username'), 10);
  // 获取聊天记录
  const fetchChatHistory = async () => {
    try {
      const response = await chatService.getChatList(username);
      if (response.code === 200) {
        // 转换数据格式
        const formattedMessages = response.data.map(msg => ({
          type: msg.role === 'user' ? 'user' : 'bot',
          content: msg.content,
          time: new Date().toLocaleTimeString()
        }));
        setMessages(formattedMessages);
        // 设置一个短暂延时，确保消息列表已经渲染
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    } catch (error) {
      message.error('获取聊天记录失败');
    }
  };

  // 添加一个引用来控制滚动
  const messagesEndRef = useRef(null);

  // 添加自动滚动函数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 初始欢迎消息
  useEffect(() => {
    scrollToBottom();
    if (username) {
      fetchChatHistory();
    }
  }, [username]);
  // 处理发送消息
  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const currentMessage = inputMessage;
    setInputMessage(''); // 立即清空输入框

    const userMessage = {
      type: 'user',
      content: currentMessage,
      time: new Date().toLocaleTimeString()
    };

    const loadingMessage = {
      type: 'bot',
      content: <Spin size="small" />,
      time: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const response = await chatService.sendChat({
        message: currentMessage,
        username: username
      });

      if (response.code === 200) {
        setMessages(prev => {
          const newMessages = prev.slice(0, -1); // 移除加载消息
          return [...newMessages, {
            type: 'bot',
            content: response.message,
            time: new Date().toLocaleTimeString()
          }];
        });
      } else {
        message.error('发送失败');
        setMessages(prev => prev.slice(0, -1)); // 移除加载消息
      }
    } catch (error) {
      message.error('发送消息失败');
      console.error('发送消息错误：', error);
      setMessages(prev => prev.slice(0, -1)); // 移除加载消息
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <Card
      title={
        <div style={{
          padding: '10px 0',
          fontWeight: 'bold',
          fontSize: '16px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #f0f0f0',
          position: 'fixed',
          top: 50,
          left: 0,
          right: 0,
          zIndex: 1001,
          textAlign: 'center'
        }}>
          智能客服
        </div>
      }
      style={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        margin: '0px',
        marginTop: '37px',  // 为固定标题留出空间
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
      bodyStyle={{
        padding: 0,
        height: 'calc(80vh - 57px)', // 减去标题高度
        overflow: 'hidden'
      }}
    >
      <div style={{
        height: '100%',
        overflow: 'auto',
        paddingBottom: '80px',
        backgroundColor: '#fff'
      }}>
        <List
          style={{
            padding: '0 24px'
          }}
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item style={{
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              padding: '12px 0',
              border: 'none',
              backgroundColor: '#fff'
            }}>
              <Space align="start" size={12}>
                {msg.type === 'bot' && (
                  <Avatar
                    icon={<RobotOutlined style={{ fontSize: '14px' }} />}
                    style={{
                      backgroundColor: '#1890ff',
                      flexShrink: 0,
                      width: '32px',
                      height: '32px'
                    }}
                  />
                )}
                <div
                  style={{
                    maxWidth: '85%',
                    minWidth: '100px',
                    padding: '12px 18px',
                    borderRadius: msg.type === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                    backgroundColor: msg.type === 'user' ? '#95EC69' : '#fff',
                    color: '#000',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    position: 'relative'
                  }}
                >
                  <Text style={{
                    color: '#000',
                    wordBreak: 'break-word',
                    fontSize: '15px',
                    lineHeight: '1.6'
                  }}>
                    {msg.content}
                  </Text>
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginTop: '6px',
                    textAlign: msg.type === 'user' ? 'right' : 'left'
                  }}>
                    {msg.time}
                  </div>
                </div>
                {msg.type === 'user' && (
                  <Avatar
                    style={{
                      backgroundColor: '#87d068',
                      flexShrink: 0,
                      width: '32px',
                      height: '32px',
                      fontSize: '14px'
                    }}
                  >
                    {username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                )}
              </Space>
            </List.Item>
          )}
        />
        {/* 用于自动滚动的空div */}
        <div ref={messagesEndRef} />
      </div>
      {/* 底部发送栏 */}
      <div className="chat-footer" style={{
        position: 'fixed',
        bottom: '80px',
        left: '20px',
        right: '20px',
        padding: '16px 24px',
        backgroundColor: '#fff',
        borderTop: '1px solid #e8e8e8',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '0 0 12px 12px'
      }}>
        <div style={{ flex: 1, marginRight: '16px' }}>
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onPressEnter={handleSend}
            placeholder="请输入您的问题..."
            style={{
              borderRadius: '24px',
              padding: '10px 20px',
              border: '1px solid #d9d9d9',
              width: '100%',
              fontSize: '15px'
            }}
          />
        </div>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={isLoading}
          style={{
            borderRadius: '24px',
            height: '42px',
            minWidth: '120px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontSize: '15px'
          }}
        >
          {isLoading ? '发送中...' : '发送'}
        </Button>
      </div>
    </Card>
  );
};
export default CustomerService;