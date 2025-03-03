import React from 'react';
import { Table, Card, Tag } from 'antd';

const Refund = () => {
  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '退款金额',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
    },
    {
      title: '退款状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '已完成' ? 'green' : 'processing'}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <Card title="退款订单">
      <Table
        columns={columns}
        dataSource={[]}
        rowKey="orderId"
      />
    </Card>
  );
};

export default Refund;
