import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { chatMessageService } from '../../services/chatMessageService';
import './MessageInput.css';

const MessageInput = ({
  chatId,
  senderId,
  receiverId,
  onMessageSent,
  disabled
}) => {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) {
      message.warning('请输入消息内容');
      return;
    }

    if (!senderId || !receiverId) {
      message.error('发送失败：缺少发送者或接收者信息');
      return;
    }

    try {
      setSending(true);
      
      // 确保senderId和receiverId是数字类型
      const senderIdNum = parseInt(senderId);
      const receiverIdNum = parseInt(receiverId);
      
      if (isNaN(senderIdNum) || isNaN(receiverIdNum)) {
        throw new Error('发送者或接收者ID格式不正确');
      }
      
      console.log('发送消息参数:', { senderId: senderIdNum, receiverId: receiverIdNum, content: content.trim() });
      
      const response = await chatMessageService.sendMessage(senderIdNum, receiverIdNum, content.trim());
      
      if (response.success) {
        setContent(''); // 清空输入框
        
        // 构建完整的消息对象传递给父组件
        if (onMessageSent && response.data) {
          // 如果响应中没有完整的消息对象，我们自己构建一个
          const newMessage = response.data.msgId ? response.data : {
            msgId: response.data.id || Date.now(), // 使用响应中的ID或生成一个临时ID
            senderId: senderIdNum,
            receiverId: receiverIdNum,
            msgContent: content.trim(),
            sendTime: new Date().toISOString(),
            ...response.data // 合并响应中的其他数据
          };
          
          console.log('构建的新消息对象:', newMessage);
          onMessageSent(newMessage);
        }
      } else {
        message.error('发送失败：' + response.message);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送失败，请稍后重试');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认的换行行为
      handleSend();
    }
  };

  return (
    <div className="message-input-container">
      <div className="message-input-wrapper">
        <Input.TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="请输入消息..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={disabled || sending}
          className="message-textarea"
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={sending}
          disabled={disabled || !content.trim()}
          className="send-button"
        >
          发送
        </Button>
      </div>
      <div className="input-tips">
        按 Enter 发送消息，Shift + Enter 换行
      </div>
    </div>
  );
};

export default MessageInput;
