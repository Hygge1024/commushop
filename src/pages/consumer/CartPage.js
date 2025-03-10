import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Input,
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
  ExclamationCircleOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
import { cartService } from '../../services/cartService';
import { productOrderService } from '../../services/productOrderService';

const { Text, Title } = Typography;
const { confirm } = Modal;

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  //获取购物车数据
  const fetchChartItems = async () => {
    try {
      setLoading(true);
      const userId = parseInt(localStorage.getItem('userId'), 10);
      if (!userId) {
        message.error('请先登录');
        navigate('/login');
        return;
      }
      const response = await cartService.getCartList({
        userID: userId,
        page: current,
        pageSize: pageSize
      });
      if (response.code === 200) {
        // 转换数据格式
        const formattedItems = response.data.records.map(item => ({
          id: item.cart.cartId,
          productId: item.product.productId,
          name: item.product.productName,
          description: item.product.productDesc,
          originalPrice: item.product.originalPrice,
          price: item.product.groupPrice,
          quantity: item.cart.amount,
          stock: item.product.stockQuantity,
          image: item.product.imageUrl,
          selected: false,
          isDeleted: item.product.isDeleted === 1
        }));
        // 反转数组顺序，使最新添加的在前面
        const sortedCartItems = [...formattedItems].reverse();
        setCartItems(sortedCartItems);
        // 更新选中状态数组
        setSelectedItems(new Array(sortedCartItems.length).fill(false));
        setTotal(response.data.total);
      } else {
        message.error(response.message || '获取购物车数据失败');
      }
    } catch (error) {
      message.error('获取购物车数据失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchChartItems();
  }, [current, pageSize]);//当current或pageSize改变时，重新获取购物车数据

  const handleQuantityChange = async (id, value) => {
    try {
      const response = await cartService.updateCart({
        cartId: id,
        amount: value
      });
      if (response.code === 200) {
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === id ? { ...item, quantity: value } : item
          )
        );
        message.success('购物车更新成功');
      } else {
        message.error(response.message || '更新购物车失败');
      }
    } catch (error) {
      message.error('更新购物车失败，请稍后重试');
    }
  };

  const handleDeleteItem = (id) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要将这个商品从购物车中删除吗？',
      okText: '确认',
      cancelText: '取消',
      async onOk() {
        try {
          const response = await cartService.deleteCart(id);
          if (response.code === 200) {
            await fetchChartItems(); // 重新获取购物车数据
            message.success('商品已从购物车中删除');
          } else {
            message.error(response.message || '删除失败');
          }
        } catch (error) {
          message.error('删除失败，请稍后重试');
        }
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
      .reduce((total, item) => total + item.originalPrice * item.quantity, 0)
      .toFixed(2);
  };

  const getSelectedCount = () => {
    return cartItems.filter(item => item.selected).length;
  };

  const handleCheckout = async () => {
    if (getSelectedCount() === 0) {
      message.warning('请先选择要购买的商品');
      return;
    }

    try {
      const userId = parseInt(localStorage.getItem('userId'), 10);
      const leaderId = 1; // 默认团长ID
      const address = "待传入"; // 默认地址，后续需要从用户输入获取

      // 遍历所有选中的商品，创建订单
      const selectedItems = cartItems.filter(item => item.selected);
      const createdOrders = [];
      
      for (const item of selectedItems) {
        const orderData = {
          userId: userId,
          productId: item.productId,
          orderStatus: 1,
          amount: item.quantity,
          address: address,
          leaderId: leaderId,
          isDeleted: 0
        };

        const response = await productOrderService.addOrder(orderData);
        if (response.code !== 200) {
          throw new Error(response.message || '创建订单失败');
        }
        
        // 保存创建的订单信息
        createdOrders.push({
          orderId: response.data,  // 使用API返回的订单ID
          item: item
        });

        // 删除购物车中的商品
        const deleteResponse = await cartService.deleteCart(item.id);
        if (deleteResponse.code !== 200) {
          throw new Error(deleteResponse.message || '删除购物车失败');
        }
      }

      // 刷新购物车列表
      await fetchChartItems();
      message.success('订单创建成功');
      // 跳转到结算页面，并传递选中的商品信息
      navigate('/consumer/checkout', {
        state: {
          selectedItems: createdOrders.map(order => ({
            id: order.orderId,  // 使用新创建的订单ID
            productId: order.item.productId,
            name: order.item.name,
            price: order.item.originalPrice,
            quantity: order.item.quantity,
            image: order.item.image,
            totalMoney: order.item.originalPrice * order.item.quantity
          }))
        }
      });
    } catch (error) {
      message.error(error.message || '创建订单失败，请稍后重试');
    }
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
                >
                  <div className="cart-item-content">
                    <Checkbox
                      checked={item.selected}
                      onChange={() => handleSelectItem(item.id)}
                      disabled={item.isDeleted}
                    />
                    <div className="cart-item-image">
                      <img src={item.image || "http://8.137.53.253:9000/commoshop/product/1894937370343108608.jpg"} alt={item.name} />
                    </div>
                    <div className="cart-item-details">
                      <div className="item-top">
                        <Text strong className="item-name">{item.name}</Text>
                        <Text type="secondary" className="item-desc">{item.description}</Text>
                      </div>
                      <div className="item-bottom">
                        <div className="price-quantity">
                          <div className="price-info">
                            <Text type="danger" className="item-price">
                              ¥{(item.originalPrice || 0).toFixed(2)}
                            </Text>
                          </div>
                          <div className="quantity-control">
                            <Button
                              type="text"
                              size="small"
                              className="quantity-btn minus"
                              onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                              disabled={item.isDeleted || (item.quantity || 0) <= 1}
                            >
                              -
                            </Button>
                            <Input
                              className="quantity-input"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                if (!isNaN(value)) {
                                  handleQuantityChange(item.id, value);
                                }
                              }}
                              disabled={item.isDeleted}
                            />
                            <Button
                              type="text"
                              size="small"
                              className="quantity-btn plus"
                              onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                              disabled={item.isDeleted || (item.quantity || 0) >= item.stock}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        {item.isDeleted && <Text type="danger" className="item-status">商品已下架</Text>}
                      </div>
                    </div>
                    <Button
                      type="text"
                      className="delete-btn"
                      icon={<CloseOutlined />}
                      onClick={() => handleDeleteItem(item.id)}
                    />
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
