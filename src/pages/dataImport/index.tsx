import React from 'react';
import { Tabs } from 'antd';
import Employee from './employee';
import Prize from './prize';
import PageConfig from './pageConfig';


const App: React.FC = () => {
  const TabItem = [{
    label: '员工名单',
    key: '1',
    children: <Employee />
  },
  {
    label: '奖品列表',
    key: '2',
    children: <Prize />
  },
  {
    label: '页面设置',
    key: '3',
    children: <PageConfig />
  },

  ]
  return (
    <>
      <h1 style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }} onClick={() => {
        window.open('/')
      }}>抽奖配置</h1>
      <Tabs
        defaultActiveKey="1"
        centered
        items={TabItem}
      />
    </>

  );
};

export default App;