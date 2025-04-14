import React from 'react';
import ChatManagement from '../consumer/ProfilePage/BasicServices/ChatManagement';

// 团长版聊天管理组件，复用消费者版的聊天管理组件
const LeaderChatManagement = () => {
  return (
    <div className="leader-chat-management">
      <h2 className="page-title">消息管理</h2>
      <ChatManagement />
    </div>
  );
};

export default LeaderChatManagement;
