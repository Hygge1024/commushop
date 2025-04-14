import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Spin } from 'antd';
import ReactECharts from 'echarts-for-react';
import { showService } from '../services/showService';



const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState({
        totalProducts: 0,
        totalCategories: 0,
        dailyComments: 0,
        growthRate: 0
    });
    const [visitData, setVisitData] = useState([]);
    const [hotProducts, setHotProducts] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await showService.getHomePage();
            const { data } = response;
            
            setOverview({
                totalProducts: data.onlineProductTotal,
                totalCategories: data.onlineProductCategoryCount,
                dailyComments: data.dailyNewComments,
                growthRate: data.commentGrowthRate
            });
            
            setVisitData(data.transactionStatisticsVOList.map(item => ({
                date: item.date,
                count: item.transactionVolume
            })));
            
            setHotProducts(data.popularProductVOList.map(item => ({
                rank: item.rank,
                title: item.contentTitle,
                views: `${item.sellCount}次`,
                growth: item.dailyGrowthRate
            })));
            
            setCategoryStats(data.categoryRatioVOList.map(item => ({
                type: item.categoryName,
                value: item.categoryRatio
            })));
        } catch (error) {
            console.error('获取仪表板数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 访问统计图配置
    const visitOption = {
        title: {
            text: '交易量统计（近7日）',
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
            name: '交易量'
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
            text: '商品类别占比',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}%'
        },
        legend: {
            orient: 'vertical',
            left: '5%',
            top: 'middle',
            itemWidth: 10,
            itemHeight: 10,
            textStyle: {
                fontSize: 12,
                padding: [3, 0, 3, 0]
            }
        },
        series: [{
            name: '类别占比',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['65%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: {
                borderRadius: 4,
                color: function(params) {
                    const colors = [
                        '#FF6B6B', // 红色
                        '#4ECDC4', // 青色
                        '#45B7D1', // 蓝色
                        '#96CEB4', // 绿色
                        '#FFEEAD', // 黄色
                        '#D4A5A5', // 粉色
                        '#9370DB', // 紫色
                        '#20B2AA', // 青绿
                        '#FF8C00', // 橙色
                        '#BA55D3', // 紫红
                        '#40E0D0', // 绿松石
                        '#FF69B4', // 粉红
                        '#32CD32', // 酸橙绿
                        '#4169E1'  // 宝蓝
                    ];
                    return colors[params.dataIndex % colors.length];
                },
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                show: true,
                position: 'outside',
                formatter: '{b}: {c}%',
                fontSize: 12
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: 'bold'
                },
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
            labelLine: {
                show: true,
                length: 10,
                length2: 10,
                smooth: true
            },
            data: categoryStats.map(item => ({
                name: item.type,
                value: item.value
            })),
            animationType: 'scale',
            animationEasing: 'elasticOut'
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
            title: '销售量',
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
                            suffix="个"
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
                <Col span={12}>
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
                <Col span={12}>
                    <Card hoverable>
                        <ReactECharts option={pieOption} style={{ height: '300px' }} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
