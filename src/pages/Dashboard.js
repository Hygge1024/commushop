import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Spin } from 'antd';
import ReactECharts from 'echarts-for-react';
import { dashboardService } from '../services/dashboardService';

// 模拟数据
const mockData = {
    overview: {
        totalProducts: 373.5,
        totalCategories: 368,
        dailyComments: 8874,
        growthRate: 2.8
    },
    visitData: [
        { date: '2021-03-09', count: 10000 },
        { date: '2021-03-10', count: 15000 },
        { date: '2021-03-11', count: 39068 },
        { date: '2021-03-12', count: 35000 },
        { date: '2021-03-13', count: 30000 },
        { date: '2021-03-14', count: 33000 },
        { date: '2021-03-15', count: 38000 },
        { date: '2021-03-16', count: 35000 }
    ],
    hotProducts: [
        { rank: 1, title: 'iphone16', views: '346.3w+', growth: 35 },
        { rank: 2, title: '华为Mate70Pro', views: '340.3w+', growth: 35 },
        { rank: 3, title: '小米14Pro', views: '346.3w+', growth: 35 },
        { rank: 4, title: '抽纸巾', views: '346.3w+', growth: 35 },
        { rank: 5, title: '洗衣液', views: '346.3w+', growth: 35 }
    ],
    categoryStats: [
        { type: '油炸类', value: 16 },
        { type: '生鲜类', value: 48 },
        { type: '水果鲜花', value: 36 }
    ]
};

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(mockData.overview);
    const [visitData, setVisitData] = useState(mockData.visitData);
    const [hotProducts, setHotProducts] = useState(mockData.hotProducts);
    const [categoryStats, setCategoryStats] = useState(mockData.categoryStats);

    useEffect(() => {
        // 模拟加载效果
        setTimeout(() => {
            setLoading(false);
        }, 1000);

        // 注释掉实际的API调用
        // fetchDashboardData();
    }, []);

    // 实际的API调用函数，暂时注释掉
    /*
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [overviewRes, visitRes, hotProductsRes, categoryRes] = await Promise.all([
                dashboardService.getDashboardOverview(),
                dashboardService.getVisitStats(7),
                dashboardService.getHotProducts(),
                dashboardService.getCategoryStats()
            ]);

            setOverview(overviewRes.data);
            setVisitData(visitRes.data);
            setHotProducts(hotProductsRes.data);
            setCategoryStats(categoryRes.data);
        } catch (error) {
            console.error('获取仪表板数据失败:', error);
        } finally {
            setLoading(false);
        }
    };
    */

    // 访问统计图配置
    const visitOption = {
        title: {
            text: '访问统计（近7日）',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: visitData.map(item => item.date),
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '访问量'
        },
        series: [{
            data: visitData.map(item => item.count),
            type: 'line',
            smooth: true,
            areaStyle: {
                opacity: 0.3,
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0,
                        color: '#1890ff'
                    }, {
                        offset: 1,
                        color: 'rgba(24,144,255,0.1)'
                    }]
                }
            },
            itemStyle: {
                color: '#1890ff'
            },
            lineStyle: {
                width: 2
            }
        }]
    };

    // 分类统计饼图配置
    const pieOption = {
        title: {
            text: '内容类别占比',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c}% ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            top: 'middle'
        },
        series: [{
            name: '类别占比',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                show: true,
                position: 'outside',
                formatter: '{b}: {c}%'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '16',
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: true
            },
            data: categoryStats.map(item => ({
                name: item.type,
                value: item.value,
                itemStyle: {
                    color: item.type === '油炸类' ? '#1890ff' :
                           item.type === '生鲜类' ? '#52c41a' :
                           '#722ed1'
                }
            }))
        }]
    };

    // 热门商品表格列配置
    const columns = [
        {
            title: '排名',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            render: (text) => <span style={{ fontWeight: 'bold' }}>#{text}</span>
        },
        {
            title: '内容标题',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true
        },
        {
            title: '点击量',
            dataIndex: 'views',
            key: 'views',
            width: 120,
            align: 'right'
        },
        {
            title: '日涨幅',
            dataIndex: 'growth',
            key: 'growth',
            width: 120,
            align: 'right',
            render: (text) => (
                <span style={{ color: text >= 0 ? '#52c41a' : '#f5222d' }}>
                    {text >= 0 ? '+' : ''}{text}%
                </span>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[16, 16]}>
                <Col span={6}>
                    <Card hoverable>
                        <Statistic
                            title="线上商品总数量"
                            value={overview.totalProducts}
                            suffix="w+"
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card hoverable>
                        <Statistic
                            title="线上商品类数量"
                            value={overview.totalCategories}
                            suffix="个"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card hoverable>
                        <Statistic
                            title="日新增评论"
                            value={overview.dailyComments}
                            suffix="个"
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card hoverable>
                        <Statistic
                            title="较昨日新增评论"
                            value={overview.growthRate}
                            suffix="%"
                            valueStyle={{ color: overview.growthRate >= 0 ? '#3f8600' : '#cf1322' }}
                            prefix={overview.growthRate >= 0 ? '↑' : '↓'}
                        />
                    </Card>
                </Col>
            </Row>

            <Card hoverable style={{ marginTop: 16 }}>
                <ReactECharts option={visitOption} style={{ height: '400px' }} />
            </Card>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={16}>
                    <Card 
                        hoverable
                        title={<span style={{ fontWeight: 'bold' }}>线上热门商品</span>}
                        extra={<a href="#">查看更多</a>}
                    >
                        <Table 
                            columns={columns}
                            dataSource={hotProducts}
                            pagination={false}
                            size="small"
                            rowKey="rank"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card hoverable>
                        <ReactECharts option={pieOption} style={{ height: '300px' }} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
