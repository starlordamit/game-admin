import React, { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Typography } from 'antd';
import { HomeOutlined, UserOutlined, CreditCardOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '../utils/firebase';
import './Dashboard.css';
import Users from './Users';
import PaymentRequests from './PaymentRequests';
import Settings from './Settings';
import DashboardHome from './DashboardHome';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const Dashboard = ({ user, onLogout }) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState('1');
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'paymentRequests'), (snapshot) => {
      setPendingRequestsCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    onLogout();
  };

  const renderContent = () => {
    switch (selectedMenuItem) {
      case '1':
        return <DashboardHome />;
      case '2':
        return <Users />;
      case '3':
        return <PaymentRequests />;
      case '4':
        return <Settings />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div className="logo" style={{ height: '32px', margin: '16px' }} />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} onClick={(e) => setSelectedMenuItem(e.key)}>
          <Menu.Item key="1" icon={<HomeOutlined />}>
            Home
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>
            Users
          </Menu.Item>
          <Menu.Item key="3" icon={<CreditCardOutlined />}>
            <span>
              <strong style={{ color: 'red' }}>{pendingRequestsCount}</strong> Payment Pending
            </span>
          </Menu.Item>
          <Menu.Item key="4" icon={<SettingOutlined />}>
            Setting
          </Menu.Item>
          <Menu.Item key="5" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={3} style={{ margin: 0, color: 'black' }}>Admin Dashboard</Title>
          <h1 style={{ textAlign: 'center', color: '#fff', margin: 0 }}>Welcome, {user.email}</h1>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
