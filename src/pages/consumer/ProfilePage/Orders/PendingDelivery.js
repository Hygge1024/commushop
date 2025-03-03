import React from 'react';
import { Table, Card } from 'antd';

const PendingDelivery = () => {
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
      title: '收货地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
    },
  ];

  return (
    <Card title="待发货订单">
      <Table
        columns={columns}
        dataSource={[]}
        rowKey="orderId"
      />
    </Card>
  );
};

export default PendingDelivery;
