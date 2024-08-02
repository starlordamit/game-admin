import React, { useState, useEffect } from 'react';
import { Card, Row, Col, message, Statistic, Badge } from 'antd';
import { UserOutlined, DollarOutlined, GoldOutlined, FileProtectOutlined } from '@ant-design/icons';
import { collection, onSnapshot, query, where, Timestamp, getDocs } from 'firebase/firestore';
import { firestore } from '../utils/firebase';
import moment from 'moment';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardHome = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [depositData, setDepositData] = useState([]);

  useEffect(() => {
    const handleNetworkChange = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    const unsubscribeUsers = onSnapshot(collection(firestore, 'users'), (snapshot) => {
      setTotalUsers(snapshot.size);
      const totalBalance = snapshot.docs.reduce((acc, doc) => acc + (doc.data().goldpoints || 0), 0);
      setCurrentBalance(totalBalance);
    });

    const unsubscribeRequests = onSnapshot(collection(firestore, 'paymentRequests'), (snapshot) => {
      setPendingRequests(snapshot.size);
    });

    const unsubscribeDeposits = onSnapshot(collection(firestore, 'deposits'), (snapshot) => {
      const total = snapshot.docs.reduce((acc, doc) => acc + doc.data().amount, 0);
      setTotalDeposits(total);
    });

    fetchDepositData();

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      unsubscribeUsers();
      unsubscribeRequests();
      unsubscribeDeposits();
    };
  }, []);

  const fetchDepositData = async () => {
    try {
      const now = new Date();
      const startDate = moment(now).subtract(7, 'days').toDate();

      const depositsQuery = query(
        collection(firestore, 'deposits'),
        where('time', '>=', startDate.toISOString()),
        where('time', '<=', now.toISOString())
      );

      const depositsSnapshot = await getDocs(depositsQuery);

      const data = depositsSnapshot.docs.map((doc) => {
        const time = new Date(doc.data().time);
        const amount = doc.data().amount;
        return { date: moment(time).format('YYYY-MM-DD'), amount };
      });

      // Aggregate data by date
      const aggregatedData = data.reduce((acc, curr) => {
        const existing = acc.find(item => item.date === curr.date);
        if (existing) {
          existing.amount += curr.amount;
        } else {
          acc.push({ date: curr.date, amount: curr.amount });
        }
        return acc;
      }, []);

      setDepositData(aggregatedData);
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch deposit data');
    }
  };

  const iconStyles = {
    fontSize: '32px',
    color: '#1890ff',
  };

  const networkDot = networkStatus === 'online' ? (
    <Badge status="success" text="Live" />
  ) : (
    <Badge status="error" text="Offline" />
  );

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>{networkDot}</Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={totalUsers}
              prefix={<UserOutlined style={iconStyles} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Requests"
              value={pendingRequests}
              prefix={<FileProtectOutlined style={iconStyles} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Deposits"
              value={totalDeposits}
              prefix={<DollarOutlined style={iconStyles} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Current Users Balance"
              value={currentBalance}
              prefix={<GoldOutlined style={iconStyles} />}
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card title="Deposits in the Last 7 Days">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={depositData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardHome;
