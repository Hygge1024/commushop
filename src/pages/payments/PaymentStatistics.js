import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Button, Space, message, Spin } from 'antd';
import { MoneyCollectOutlined, TransactionOutlined, PercentageOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { paymentService } from '../../services/paymentService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;// 导入日期选择组件

const PaymentStatistics = () => {
    const [loading, setLoading] = useState(true);// 加载状态
    const [statistics, setStatistics] = useState(null);// 统计数据
    const [dateRange, setDateRange] = useState([
        dayjs('2024-01-01 00:00:00'),
        dayjs('2025-05-05 23:59:59')
    ]);// 日期范围

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {// 获取统计数据
        try {
            setLoading(true);
            const response = await paymentService.getPaymentStatistics({
                startTime: dateRange[0].format('YYYY-MM-DD HH:mm:ss'),
                endTime: dateRange[1].format('YYYY-MM-DD HH:mm:ss')
            });
            
            if (response.code === 200) {
                setStatistics(response.data);
            } else {
                message.error(response.message || '获取统计数据失败');
            }
        } catch (error) {
            console.error('获取统计数据失败:', error);
            message.error('获取统计数据失败');
        } finally {
            setLoading(false);
        }
    };

    // 支付趋势图表配置
    const getPaymentTrendOption = () => ({
        title: {
            text: '支付金额趋势',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                const data = params[0];
                return `${data.name}<br/>${data.seriesName}: ¥${data.value.toFixed(2)}`;
            }
        },
        xAxis: {
            type: 'category',
            data: statistics?.paymentTrend.map(item => item.date) || [],
            axisLabel: {
                interval: 0,
                rotate: 30
            }
        },
        yAxis: {
            type: 'value',
            name: '支付金额(¥)'
        },
        series: [{
            name: '支付金额',
            type: 'line',
            data: statistics?.paymentTrend.map(item => item.amount) || [],
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
                color: '#1890ff'
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0,
                        color: 'rgba(24,144,255,0.3)'
                    }, {
                        offset: 1,
                        color: 'rgba(24,144,255,0.1)'
                    }]
                }
            }
        }]
    });

    // 支付方式分布图表配置
    const getPaymentMethodOption = () => ({
        title: {
            text: '支付方式分布',
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
                formatter: '{b}: {c}笔'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '16',
                    fontWeight: 'bold'
                }
            },
            data: Object.entries(statistics?.paymentMethodDistribution || {}).map(([method, count]) => ({
                name: method,
                value: count,
                itemStyle: {
                    color: method === '微信支付' ? '#52c41a' : '#1890ff'
                }
            }))
        }]
    });

    const handleDateRangeChange = (dates) => {
        if (dates) {
            setDateRange(dates);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Space style={{ marginBottom: '24px' }}>
                    <RangePicker
                        showTime
                        value={dateRange}
                        onChange={handleDateRangeChange}
                    />
                    <Button type="primary" onClick={fetchStatistics}>
                        查询
                    </Button>
                </Space>

                <Row gutter={[24, 24]}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="总支付金额"
                                value={statistics?.totalAmount || 0}
                                precision={2}
                                prefix={<MoneyCollectOutlined />}
                                suffix="元"
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="支付笔数"
                                value={statistics?.paymentCount || 0}
                                prefix={<TransactionOutlined />}
                                suffix="笔"
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="平均支付金额"
                                value={statistics?.averageAmount || 0}
                                precision={2}
                                prefix={<MoneyCollectOutlined />}
                                suffix="元"
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="支付转化率"
                                value={statistics?.conversionRate || 0}
                                precision={1}
                                prefix={<PercentageOutlined />}
                                suffix="%"
                                valueStyle={{ color: '#13c2c2' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
                    <Col span={16}>
                        <Card>
                            <ReactECharts option={getPaymentTrendOption()} style={{ height: '400px' }} />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <ReactECharts option={getPaymentMethodOption()} style={{ height: '400px' }} />
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default PaymentStatistics;