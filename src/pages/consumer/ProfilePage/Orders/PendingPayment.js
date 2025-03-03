import React from 'react';
import { Table, Card } from 'antd';

const PendingPayment = () => {
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
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
    },
  ];

  return (
    <Card title="待付款订单">
      <Table
        columns={columns}
        dataSource={[]}
        rowKey="orderId"
      />
    </Card>
  );
};

export default PendingPayment;
