import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import ReactECharts from 'echarts-for-react';
import { orderService } from '../../services/orderService';

const OrderStatistics = () => {
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
        fetchOrderStatistics();
    }, []);

    const fetchOrderStatistics = async () => {
        try {
            setLoading(true);
            const response = await orderService.getOrderStatistics();
            if (response.code === 200) {
                setStatistics(response.data);
            } else {
                message.error(response.message || '获取统计数据失败');
            }
        } catch (error) {
            console.error('获取订单统计数据失败:', error);
            message.error('获取统计数据失败');
        } finally {
            setLoading(false);
        }
    };

    // 订单状态配置
    const ORDER_STATUS = {
        1: '未支付',
        2: '支付中',
        3: '待发货',
        4: '已发货',
        5: '已完成'
    };

    // 合并的每日订单数量和金额图表配置
    const getDailyOrdersAndAmountsOption = () => ({
        title: {
            text: '每日订单统计',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: (params) => {
                let result = `${params[0].name}<br/>`;
                params.forEach(param => {
                    const value = param.seriesName === '订单金额' 
                        ? `¥${param.value.toFixed(2)}`
                        : param.value;
                    result += `${param.marker}${param.seriesName}: ${value}<br/>`;
                });
                return result;
            }
        },
        legend: {
            data: ['订单数量', '订单金额'],
            top: 30
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: Object.keys(statistics?.dailyOrderCounts || {}),
            axisLabel: {
                interval: 0
            }
        },
        yAxis: [
            {
                type: 'value',
                name: '订单数量',
                position: 'left',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#1890ff'
                    }
                },
                axisLabel: {
                    formatter: '{value}'
                }
            },
            {
                type: 'value',
                name: '订单金额(¥)',
                position: 'right',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#52c41a'
                    }
                },
                axisLabel: {
                    formatter: '{value}'
                }
            }
        ],
        series: [
            {
                name: '订单数量',
                type: 'bar',
                data: Object.values(statistics?.dailyOrderCounts || {}),
                barWidth: '40%',
                itemStyle: {
                    color: '#1890ff'
                }
            },
            {
                name: '订单金额',
                type: 'line',
                yAxisIndex: 1,
                data: Object.values(statistics?.dailyOrderAmounts || {}),
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: {
                    color: '#52c41a'
                },
                lineStyle: {
                    width: 2
                }
            }
        ]
    });

    // 订单状态分布图表配置
    const getOrderStatusOption = () => ({
        title: {
            text: '订单状态分布',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            top: 'middle'
        },
        series: [{
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                show: true,
                position: 'outside',
                formatter: '{b}: {c}'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '16',
                    fontWeight: 'bold'
                }
            },
            data: Object.entries(statistics?.orderStatusCounts || {}).map(([status, count]) => ({
                name: ORDER_STATUS[status],
                value: count,
                itemStyle: {
                    color: status === '1' ? '#ff4d4f' :
                           status === '2' ? '#faad14' :
                           status === '3' ? '#1890ff' :
                           status === '4' ? '#52c41a' :
                           '#13c2c2'
                }
            }))
        }]
    });

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[24, 24]}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="总订单数"
                            value={statistics?.totalOrders || 0}
                            suffix="单"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="总金额"
                            value={statistics?.totalAmount || 0}
                            precision={2}
                            prefix="¥"
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="下单用户数"
                            value={statistics?.uniqueUsers || 0}
                            suffix="人"
                            valueStyle={{ color: '#13c2c2' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
                <Col span={24}>
                    <Card>
                        <ReactECharts option={getDailyOrdersAndAmountsOption()} style={{ height: '400px' }} />
                    </Card>
                </Col>
            </Row>

            <Row style={{ marginTop: '24px' }}>
                <Col span={24}>
                    <Card>
                        <ReactECharts option={getOrderStatusOption()} style={{ height: '400px' }} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default OrderStatistics;