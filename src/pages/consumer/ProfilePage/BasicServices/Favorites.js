import React from 'react';
import { List, Card, Button, Image } from 'antd';

const Favorites = () => {
  return (
    <Card title="我的收藏">
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={[]}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              cover={<Image alt={item?.name} src={item?.image} />}
              actions={[
                <Button type="link">查看详情</Button>,
                <Button type="link" danger>取消收藏</Button>
              ]}
            >
              <Card.Meta
                title={item?.name}
                description={`¥${item?.price}`}
              />
            </Card>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default Favorites;
