import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, List, Tag, message, Modal, Steps } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { orderNewService } from '../../../services/orderNewService';
import {
    ShoppingOutlined,
    CarOutlined,
    CheckCircleOutlined,
    UserOutlined,
    PhoneOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';

import AMapLoader from '@amap/amap-jsapi-loader';

const { Step } = Steps;

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [orderInfo, setOrderInfo] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(false);
    // 添加地图相关状态
    const [map, setMap] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(null);

    // 获取订单基本信息
    const fetchOrderInfo = async () => {
        try {
            const response = await orderNewService.getOrderList({
                current: 1,
                size: 999,
                orderId: orderId
            });
            if (response.code === 200 && response.data.records.length > 0) {
                setOrderInfo(response.data.records[0]);
                // 获取到订单基本信息后，再获取订单详情
                fetchOrderItems(response.data.records[0].orderCode);
            }
        } catch (error) {
            message.error('获取订单信息失败');
        }
    };

    // 修改获取订单商品详情方法，接收 orderCode 参数
    const fetchOrderItems = async (orderCode) => {
        try {
            const response = await orderNewService.getOrderListDetail({
                current: 1,
                size: 999,
                orderCode: orderCode  // 使用传入的 orderCode
            });
            if (response.code === 200) {
                // 处理返回的数据，将商品详情存储到 orderItems 中
                setOrderItems(response.data.records || []);
            }
        } catch (error) {
            message.error('获取订单商品详情失败');
        }
    };

    // 修改 useEffect，只调用 fetchOrderInfo
    useEffect(() => {
        setLoading(true);
        fetchOrderInfo()
            .finally(() => setLoading(false));
    }, [orderId]);


    // 处理发货操作
    const handleDelivery = async () => {
        const isDelivery = orderInfo.orderStatus === 2;
        Modal.confirm({
            title: isDelivery ? '确认发货' : '确认送达',
            content: isDelivery ? '确定要将此订单标记为已发货吗？' : '确定要将此订单标记为已送达吗？',
            onOk: async () => {
                try {
                    const response = await orderNewService.updateOrderStatus({
                        orderId: orderId,
                        orderStatus: isDelivery ? 3 : 4 // 2->3(发货) 或 3->4(送达)
                    });
                    if (response.code === 200) {
                        message.success(isDelivery ? '发货成功' : '已确认送达');
                        fetchOrderInfo(); // 刷新订单信息
                    }
                } catch (error) {
                    message.error(isDelivery ? '发货失败' : '确认送达失败');
                }
            }
        });
    };

    // 获取当前状态的标题
    const getCurrentStatusTitle = (status) => {
        switch (status) {
            case 2: return "待发货";
            case 3: return "运输中";
            case 4: return "待收货";
            case 5: return "已收货";
            default: return "未知状态";
        }
    };

    // 获取当前步骤
    const getOrderStep = (status) => {
        switch (status) {
            case 2: return 0; // 待发货
            case 3: return 1; // 运输中
            case 4: return 2; // 待收货
            case 5: return 3; // 已收货
            default: return 0;
        }
    };

    // 修改地图初始化的 useEffect
    useEffect(() => {
        let mapInstance = null;

        const initMap = async () => {
            if (!orderInfo?.address) return;

            try {
                const AMap = await AMapLoader.load({
                    key: 'b0b74cebebf73cf303a411dde066842a',
                    version: '2.0',
                    plugins: ['AMap.Geolocation', 'AMap.Geocoder']
                });

                const container = document.getElementById('container');
                if (!container) return;

                // 创建地图实例
                mapInstance = new AMap.Map('container', {
                    zoom: 15,
                    viewMode: '3D',
                    center: [120.153576, 30.287459]
                });

                setMap(mapInstance);
                setMapLoaded(true);

                // 地址解析
                const addressParts = orderInfo.address.split('，');
                const fullAddress = addressParts.slice(2).join('');
                console.log("fullAddress: ", fullAddress);
                // 使用第三方接口获取经纬度
                try {
                    const response = await fetch(`https://cn.apihz.cn/api/other/jwbaidu.php?id=88888888&key=88888888&address=${encodeURIComponent(fullAddress)}`);
                    const data = await response.json();

                    if (data.code === 200) {
                        // 设置地图中心点和标记
                        mapInstance.setZoomAndCenter(16, [data.lng, data.lat]);

                        // 创建标记
                        const marker = new AMap.Marker({
                            position: [data.lng, data.lat],
                            map: mapInstance,
                            animation: 'AMAP_ANIMATION_BOUNCE'
                        });

                        // 创建信息窗体
                        const infoWindow = new AMap.InfoWindow({
                            content: `
                                <div style="padding: 8px; max-width: 200px;">
                                    <h4 style="margin: 0 0 5px; color: #333; font-size: 14px;">收货详情</h4>
                                    <p style="margin: 3px 0; font-size: 12px;"><b>地址：</b>${fullAddress}</p>
                                    <p style="margin: 3px 0; font-size: 12px;"><b>收货人：</b>${addressParts[0]}</p>
                                    <p style="margin: 3px 0; font-size: 12px;"><b>电话：</b>${addressParts[1]}</p>
                                    <p style="margin: 3px 0; color: #666; font-size: 11px;">
                                        经纬度：${data.lng}, ${data.lat}
                                    </p>
                                </div>
                            `,
                            offset: new AMap.Pixel(0, -30),
                            size: new AMap.Size(200, 140)  // 设置窗体大小
                        });

                        // 默认打开信息窗体
                        infoWindow.open(mapInstance, marker.getPosition());

                        // 点击标记时切换信息窗体
                        marker.on('click', () => {
                            if (infoWindow.getIsOpen()) {
                                infoWindow.close();
                            } else {
                                infoWindow.open(mapInstance, marker.getPosition());
                            }
                        });
                    } else {
                        message.error('地址解析失败');
                    }
                } catch (error) {
                    console.error('获取经纬度失败：', error);
                    message.error('获取地址坐标失败');
                }

            } catch (error) {
                console.error('地图初始化失败：', error);
                setMapError(error);
            }
        };

        initMap();

        return () => {
            if (mapInstance) {
                mapInstance.destroy();
                setMap(null);
                setMapLoaded(false);
            }
        };
    }, [orderInfo]);
    if (!orderInfo) {
        return <div>加载中...</div>;
    }

    return (
        <div className="order-details" style={{ padding: '24px' }}>
            <Card loading={loading}>
                <Steps current={getOrderStep(orderInfo.orderStatus)}>
                    <Step title={getCurrentStatusTitle(2)} icon={<ShoppingOutlined />} />
                    <Step title={getCurrentStatusTitle(3)} icon={<CarOutlined />} />
                    <Step title={getCurrentStatusTitle(4)} icon={<ShoppingOutlined />} />
                    <Step title={getCurrentStatusTitle(5)} icon={<CheckCircleOutlined />} />
                </Steps>

                <Descriptions title="订单信息" style={{ marginTop: '24px' }} bordered>
                    <Descriptions.Item label="订单编号">{orderInfo.orderCode}</Descriptions.Item>
                    <Descriptions.Item label="下单时间">
                        {new Date(orderInfo.createTime).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="订单金额">¥{orderInfo.totalMoney}</Descriptions.Item>
                </Descriptions>

                <Descriptions title="收货信息" style={{ marginTop: '24px' }} bordered>
                    <Descriptions.Item label={<><UserOutlined /> 收货人</>}>
                        {orderInfo.address?.split('，')[0]}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><PhoneOutlined /> 联系电话</>}>
                        {orderInfo.address?.split('，')[1]}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><EnvironmentOutlined /> 收货地址</>}>
                        {orderInfo.address?.split('，').slice(2).join('，')}
                    </Descriptions.Item>
                </Descriptions>
                {/* 添加地图容器 */}
                <div
                    id="container"
                    style={{
                        marginTop: '16px',
                        height: '300px',
                        border: '1px solid #eee',
                        borderRadius: '4px'
                    }}
                />

                <Card
                    title="商品信息"
                    style={{ marginTop: '24px' }}
                >
                    <List
                        dataSource={orderItems}
                        renderItem={item => (
                            <List.Item>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    marginRight: '16px',
                                    flexShrink: 0
                                }}>
                                    <img
                                        src={item.product.imageUrl}
                                        alt={item.product.productName}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </div>
                                <List.Item.Meta
                                    title={item.productName}
                                    description={`单价: ¥${item.product.groupPrice}`}
                                />
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    alignItems: 'flex-end',
                                    minWidth: '120px'
                                }}>
                                    <div>数量: {item.amount}</div>
                                    <div>
                                        小计: ¥{(item.product.groupPrice * item.amount).toFixed(2)}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    {(orderInfo.orderStatus === 2 || orderInfo.orderStatus === 3) && (
                        <Button type="primary" onClick={handleDelivery}>
                            {orderInfo.orderStatus === 2 ? '确认发货' : '确认送达'}
                        </Button>
                    )}
                    <Button style={{ marginLeft: '8px' }} onClick={() => navigate(-1)}>
                        返回
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default OrderDetails;
