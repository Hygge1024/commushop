import React from 'react';
import './LeaderService.css';
import ChatManagement from '../consumer/ProfilePage/BasicServices/ChatManagement';


const LeaderService = () => {
  return (
    <div className="leader-chat-management">
      <h2 className="page-title">消息管理</h2>
      <ChatManagement />
    </div>
  );
};

export default LeaderService;
