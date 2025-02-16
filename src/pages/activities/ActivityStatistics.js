import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, message } from 'antd';
import { ShoppingOutlined, UserOutlined, RiseOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { activityService } from '../../services/activityService';

const ActivityStatistics = () => {
    const [statistics, setStatistics] = useState({
        totalActivities: 0,
        totalParticipants: 0,
        conversionRate: '0%',
        dailyStatistics: []
    });

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const response = await activityService.getActivityStatistics();
            if (response.code === 200) {
                setStatistics(response.data);
            } else {
                message.error(response.message || '获取统计数据失败');
            }
        } catch (error) {
            console.error('获取统计数据失败:', error);
            message.error('获取统计数据失败');
        }
    };

    // 将数字数组转换为星期几的标签
    const getDayLabel = (day) => {
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return days[day % 7];
    };

    // 活动数据统计图表配置
    const option = {
        title: {
            text: '活动效果统计'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                let result = params[0].axisValue + '<br/>';
                params.forEach(param => {
                    const value = param.seriesName === '销售额' 
                        ? '¥' + param.value.toFixed(2)
                        : param.value;
                    result += param.marker + param.seriesName + ': ' + value + '<br/>';
                });
                return result;
            }
        },
        legend: {
            data: ['参与人数', '销售额']
        },
        xAxis: {
            type: 'category',
            data: statistics.dailyStatistics.map(item => getDayLabel(item.dayOfWeek))
        },
        yAxis: [
            {
                type: 'value',
                name: '人数',
                position: 'left'
            },
            {
                type: 'value',
                name: '金额(¥)',
                position: 'right'
            }
        ],
        series: [
            {
                name: '参与人数',
                type: 'bar',
                data: statistics.dailyStatistics.map(item => item.participants)
            },
            {
                name: '销售额',
                type: 'line',
                yAxisIndex: 1,
                data: statistics.dailyStatistics.map(item => item.salesAmount)
            }
        ]
    };

    return (
        <div>
            <Row gutter={16}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="总活动数"
                            value={statistics.totalActivities}
                            prefix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="参与人数"
                            value={statistics.totalParticipants}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="转化率"
                            value={parseFloat(statistics.conversionRate)}
                            prefix={<RiseOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
            </Row>
            <Card style={{ marginTop: 16 }}>
                <ReactECharts option={option} style={{ height: 400 }} />
            </Card>
        </div>
    );
};

export default ActivityStatistics;