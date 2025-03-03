import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Button, 
  InputNumber, 
  Empty, 
  message, 
  Checkbox,
  Space,
  Modal,
  Typography
} from 'antd';
import { 
  DeleteOutlined, 
  ShoppingCartOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

const { Text, Title } = Typography;
const { confirm } = Modal;

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 模拟购物车数据
  const mockCartItems = [
    {
      id: 1,
      name: '精品咖啡豆',
      price: 68.00,
      quantity: 1,
      stock: 100,
      image: '1894937370343108608.jpg',
      selected: false
    },
    {
      id: 2,
      name: '手冲咖啡壶',
      price: 299.00,
      quantity: 1,
      stock: 50,
      image: '1894937370343108608.jpg',
      selected: false
    }
  ];

  useEffect(() => {
    // TODO: 从后端获取购物车数据
    setCartItems(mockCartItems);
  }, []);

  const handleQuantityChange = (id, value) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: value } : item
      )
    );
  };

  const handleDeleteItem = (id) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要将这个商品从购物车中删除吗？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
        message.success('商品已从购物车中删除');
      }
    });
  };

  const handleSelectItem = (id) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleSelectAll = (e) => {
    const newItems = cartItems.map(item => ({
      ...item,
      selected: e.target.checked
    }));
    setCartItems(newItems);
  };

  const getTotalPrice = () => {
    return cartItems
      .filter(item => item.selected)
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const getSelectedCount = () => {
    return cartItems.filter(item => item.selected).length;
  };

  const handleCheckout = () => {
    if (getSelectedCount() === 0) {
      message.warning('请先选择要购买的商品');
      return;
    }
    // TODO: 跳转到结算页面
    navigate('/consumer/checkout');
  };

  return (
    <div className="cart-container">
      <Card className="cart-card">
        <Title level={4}>
          <ShoppingCartOutlined /> 购物车
        </Title>
        
        {cartItems.length > 0 ? (
          <>
            <List
              className="cart-list"
              itemLayout="horizontal"
              dataSource={cartItems}
              renderItem={item => (
                <List.Item
                  className="cart-item"
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      删除
                    </Button>
                  ]}
                >
                  <div className="cart-item-content">
                    <Checkbox
                      checked={item.selected}
                      onChange={() => handleSelectItem(item.id)}
                    />
                    <div className="cart-item-image">
                      <img src={"http://8.137.53.253:9000/commoshop/product/1894937370343108608.jpg"} alt={item.name} />
                    </div>
                    <div className="cart-item-details">
                      <Text strong className="item-name">{item.name}</Text>
                      <Text type="danger" className="item-price">
                        ¥{item.price.toFixed(2)}
                      </Text>
                      <div className="quantity-control">
                        <InputNumber
                          min={1}
                          max={item.stock}
                          value={item.quantity}
                          onChange={(value) => handleQuantityChange(item.id, value)}
                        />
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
            
            <div className="cart-footer">
              <div className="cart-footer-left">
                <Checkbox
                  onChange={handleSelectAll}
                  checked={cartItems.every(item => item.selected)}
                >
                  全选
                </Checkbox>
              </div>
              <div className="cart-footer-right">
                <Space>
                  <Text>
                    已选择 <Text strong>{getSelectedCount()}</Text> 件商品
                  </Text>
                  <Text>
                    合计: <Text type="danger" strong>¥{getTotalPrice()}</Text>
                  </Text>
                  <Button type="primary" size="large" onClick={handleCheckout}>
                    结算
                  </Button>
                </Space>
              </div>
            </div>
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                购物车还是空的，快去添加商品吧~
              </span>
            }
          >
            <Button type="primary" onClick={() => navigate('/consumer/home')}>
              去购物
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
};

export default CartPage;
