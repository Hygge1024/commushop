import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';

const PageBreadcrumb = () => {
    const location = useLocation();
    const pathSnippets = location.pathname.split('/').filter(i => i);

    const breadcrumbNameMap = {
        'dashboard': { name: '仪表盘', path: '/dashboard' },
        'goods': { name: '商品管理', path: '/goods/list' },
        'list': { name: '查询列表', path: '' },  // 将由父级路径决定完整路径
        'activities': { name: '活动管理', path: '/activities/list' },
        'create': { name: '创建活动', path: '/activities/create' },
        'statistics': { name: '统计分析', path: '' },  // 将由父级路径决定完整路径
        'orders': { name: '订单管理', path: '/orders/list' },
        'payments': { name: '支付管理', path: '/payments/list' },
        'settings': { name: '系统设置', path: '/settings/users' },
        'users': { name: '用户查询', path: '/settings/users' },
        'user-statistics': { name: '用户分析', path: '/settings/user-statistics' },
    };

    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        const currentPath = pathSnippets[index];
        const item = breadcrumbNameMap[currentPath];

        // 确定跳转路径
        let linkPath;
        if (item?.path) {
            // 如果有预定义路径，使用预定义路径
            linkPath = item.path;
        } else {
            // 否则使用当前完整路径
            linkPath = url;
        }

        return (
            <Breadcrumb.Item key={url}>
                <Link to={linkPath}>
                    {item?.name || currentPath}
                </Link>
            </Breadcrumb.Item>
        );
    });

    const breadcrumbItems = [
        <Breadcrumb.Item key="home">
            <Link to="/dashboard">首页</Link>
        </Breadcrumb.Item>
    ].concat(extraBreadcrumbItems);

    return (
        <Breadcrumb style={{ marginBottom: 16 }}>
            {breadcrumbItems}
        </Breadcrumb>
    );
};

export default PageBreadcrumb; 