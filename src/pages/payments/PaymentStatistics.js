import React from 'react';
import { Card, Row, Col, Statistic, DatePicker, Space } from 'antd';
import { Line, Pie } from '@ant-design/charts';

const { RangePicker } = DatePicker;

const PaymentStatistics = () => {
    // 折线图配置
    const lineConfig = {
        data: [
            { date: '2024-01-01', amount: 3500 },
            { date: '2024-01-02', amount: 4200 },
            { date: '2024-01-03', amount: 3800 },
            { date: '2024-01-04', amount: 5000 },
            { date: '2024-01-05', amount: 4800 },
        ],
        xField: 'date',
        yField: 'amount',
        point: {
            size: 5,
            shape: 'diamond',
        },
        label: {
            style: {
                fill: '#aaa',
            },
        },
    };

    // 饼图配置
    const pieConfig = {
        data: [
            { type: '支付宝', value: 45 },
            { type: '微信支付', value: 40 },
            { type: '银行卡', value: 15 },
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
                                title="今日支付总额"
                                value={11280}
                                precision={2}
                                prefix="¥"
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="今日支付笔数"
                                value={93}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="平均支付金额"
                                value={121.29}
                                precision={2}
                                prefix="¥"
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="支付转化率"
                                value={88.5}
                                suffix="%"
                            />
                        </Card>
                    </Col>
                </Row>

                {/* 支付趋势图 */}
                <Card title="支付金额趋势">
                    <Line {...lineConfig} />
                </Card>

                {/* 支付方式分布 */}
                <Card title="支付方式分布">
                    <Pie {...pieConfig} />
                </Card>
            </Space>
        </div>
    );
};

export default PaymentStatistics; 