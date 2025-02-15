import React from 'react';
import { Card, Row, Col, Statistic, DatePicker } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const { RangePicker } = DatePicker;

const OrderStatistics = () => {
    // 订单趋势图配置
    const orderTrendOption = {
        title: {
            text: '订单趋势'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['订单数量', '订单金额']
        },
        xAxis: {
            type: 'category',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: [
            {
                type: 'value',
                name: '订单数量',
                position: 'left'
            },
            {
                type: 'value',
                name: '订单金额',
                position: 'right'
            }
        ],
        series: [
            {
                name: '订单数量',
                type: 'bar',
                data: [120, 132, 101, 134, 90, 230, 210]
            },
            {
                name: '订单金额',
                type: 'line',
                yAxisIndex: 1,
                data: [220, 182, 191, 234, 290, 330, 310]
            }
        ]
    };

    // 订单状态分布图配置
    const orderStatusOption = {
        title: {
            text: '订单状态分布'
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: [
                    { value: 235, name: '待付款' },
                    { value: 274, name: '已付款' },
                    { value: 310, name: '已发货' },
                    { value: 335, name: '已完成' },
                    { value: 100, name: '已取消' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    return (
        <div>
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={24} style={{ marginBottom: 24 }}>
                    <Col span={24} style={{ marginBottom: 16 }}>
                        <RangePicker style={{ width: 300 }} />
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="总订单数"
                                value={1254}
                                prefix={<ShoppingCartOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="总金额"
                                value={9846.28}
                                prefix={<DollarOutlined />}
                                precision={2}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="下单用户数"
                                value={846}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
            </Card>

            <Row gutter={24}>
                <Col span={24}>
                    <Card title="订单趋势">
                        <ReactECharts option={orderTrendOption} style={{ height: 400 }} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={24} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="订单状态分布">
                        <ReactECharts option={orderStatusOption} style={{ height: 400 }} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default OrderStatistics; 