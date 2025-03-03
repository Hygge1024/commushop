import React from 'react';
import { Table, Card, Button } from 'antd';

const PendingReceive = () => {
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
      title: '物流状态',
      dataIndex: 'deliveryStatus',
      key: 'deliveryStatus',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" size="small">
          确认收货
        </Button>
      ),
    },
  ];

  return (
    <Card title="待收货订单">
      <Table
        columns={columns}
        dataSource={[]}
        rowKey="orderId"
      />
    </Card>
  );
};

export default PendingReceive;
