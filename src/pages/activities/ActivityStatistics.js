import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ShoppingOutlined, UserOutlined, RiseOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const ActivityStatistics = () => {
    // 活动数据统计图表配置
    const option = {
        title: {
            text: '活动效果统计'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['参与人数', '销售额']
        },
        xAxis: {
            type: 'category',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: [
            {
                type: 'value',
                name: '人数',
                position: 'left'
            },
            {
                type: 'value',
                name: '金额',
                position: 'right'
            }
        ],
        series: [
            {
                name: '参与人数',
                type: 'bar',
                data: [120, 132, 101, 134, 90, 230, 210]
            },
            {
                name: '销售额',
                type: 'line',
                yAxisIndex: 1,
                data: [220, 182, 191, 234, 290, 330, 310]
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
                            value={93}
                            prefix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="参与人数"
                            value={8846}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="转化率"
                            value={93.5}
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