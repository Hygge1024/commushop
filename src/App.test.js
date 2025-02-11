import { render, screen } from '@testing-library/react'; //React测试库中的
import App from './App'; //引用的主组件

// 定义一个测试用例
test('renders learn react link', () => {
  render(<App />);// 渲染 App 组件
  const linkElement = screen.getByText(/learn react/i);// 查找包含 "learn react" 的文本元素
  expect(linkElement).toBeInTheDocument();// 断言该元素存在于文档中
});
