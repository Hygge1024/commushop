import React from 'react';
import { Card, Row, Col, Statistic, DatePicker, Space } from 'antd';
import { Line, Pie } from '@ant-design/charts';
import { UserOutlined, TeamOutlined, ShoppingOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const UserStatistics = () => {
    // 用户增长趋势图配置
    const userGrowthConfig = {
        data: [
            { date: '2024-01-01', count: 100 },
            { date: '2024-01-02', count: 120 },
            { date: '2024-01-03', count: 150 },
            { date: '2024-01-04', count: 180 },
            { date: '2024-01-05', count: 220 },
        ],
        xField: 'date',
        yField: 'count',
        point: {
            size: 5,
            shape: 'diamond',
        },
    };

    // 用户性别分布配置
    const genderDistributionConfig = {
        data: [
            { type: '男', value: 60 },
            { type: '女', value: 40 },
        ],
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            position: 'outside',
            content: ({ type, value, percentage }) =>
                `${type}: ${(percentage * 100).toFixed(1)}%`,
        },
        interactions: [
            {
                type: 'element-active',
            },
        ],
    };

    return (
        <div>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* 时间范围选择器 */}
                <Card>
                    <Space>
                        <span>选择时间范围：</span>
                        <RangePicker />
                    </Space>
                </Card>

                {/* 统计数据卡片 */}
                <Row gutter={16}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="总用户数"
                                value={1234}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="今日新增"
                                value={45}
                                prefix={<TeamOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="活跃用户"
                                value={890}
                                prefix={<ShoppingOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="地址完善率"
                                value={85.6}
                                suffix="%"
                                prefix={<EnvironmentOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* 用户增长趋势图 */}
                <Card title="用户增长趋势">
                    <Line {...userGrowthConfig} />
                </Card>

                {/* 用户性别分布 */}
                <Card title="用户性别分布">
                    <Pie {...genderDistributionConfig} />
                </Card>
            </Space>
        </div>
    );
};

export default UserStatistics; 