import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import { UserOutlined, UsergroupAddOutlined, TeamOutlined, EnvironmentOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { userService } from '../../services/userService';
import dayjs from 'dayjs';

const UserStatistics = () => {
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await userService.getUserStatistics();
            
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

    // 用户增长趋势图表配置
    const getGrowthTrendOption = () => ({
        title: {
            text: '用户增长趋势',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                const data = params[0];
                return `${dayjs(data.name).format('YYYY-MM-DD')}<br/>${data.seriesName}: ${data.value}人`;
            }
        },
        xAxis: {
            type: 'category',
            data: statistics?.userGrowthTrend.map(item => dayjs(item.date).format('MM-DD')) || [],
            axisLabel: {
                interval: 0,
                rotate: 30
            }
        },
        yAxis: {
            type: 'value',
            name: '新增用户数'
        },
        series: [{
            name: '新增用户',
            type: 'line',
            data: statistics?.userGrowthTrend.map(item => item.count) || [],
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

    // 性别比例图表配置
    const getGenderRatioOption = () => ({
        title: {
            text: '用户性别比例',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}人 ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: ['男性用户', '女性用户']
        },
        series: [{
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                show: true,
                formatter: '{b}: {d}%'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '16',
                    fontWeight: 'bold'
                }
            },
            data: [
                {
                    name: '男性用户',
                    value: statistics?.genderRatio.maleCount || 0,
                    itemStyle: { color: '#1890ff' }
                },
                {
                    name: '女性用户',
                    value: statistics?.genderRatio.femaleCount || 0,
                    itemStyle: { color: '#eb2f96' }
                }
            ]
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
            <Card>
                <Row gutter={[24, 24]}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="总用户数"
                                value={statistics?.totalUsers || 0}
                                prefix={<TeamOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                                suffix="人"
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="今日新增"
                                value={statistics?.todayNewUsers || 0}
                                prefix={<UsergroupAddOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                                suffix="人"
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="活跃用户"
                                value={statistics?.activeUsers || 0}
                                prefix={<UserOutlined />}
                                valueStyle={{ color: '#faad14' }}
                                suffix="人"
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="地址完善率"
                                value={statistics?.addressCompletionRate || 0}
                                prefix={<EnvironmentOutlined />}
                                valueStyle={{ color: '#13c2c2' }}
                                suffix="%"
                                precision={1}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
                    <Col span={16}>
                        <Card>
                            <ReactECharts option={getGrowthTrendOption()} style={{ height: '400px' }} />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <ReactECharts option={getGenderRatioOption()} style={{ height: '400px' }} />
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default UserStatistics;