import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const BreadcrumbNav = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const title = pathSnippets[index].charAt(0).toUpperCase() + pathSnippets[index].slice(1);
    
    return (
      <Breadcrumb.Item key={url}>
        <Link to={url}>{title}</Link>
      </Breadcrumb.Item>
    );
  });

  const breadcrumbItems = [
    <Breadcrumb.Item key="home">
      <Link to="/">首页</Link>
    </Breadcrumb.Item>,
  ].concat(extraBreadcrumbItems);

  return (
    <div style={{ margin: '16px 0' }}>
      <Breadcrumb>{breadcrumbItems}</Breadcrumb>
    </div>
  );
};

export default BreadcrumbNav;
