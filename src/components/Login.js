import React, { useState } from 'react';
import { Button, Card, Form, Input, notification, Typography } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { auth, signInWithGoogle, getDoc, doc, signOut, firestore } from '../utils/firebase';
import './Login.css';

const { Title } = Typography;

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      const user = auth.currentUser;
      const adminDoc = await getDoc(doc(firestore, 'admin', user.uid));
      if (adminDoc.exists()) {
        onLogin(user);
      } else {
        notification.error({
          message: 'Login Failed',
          description: 'You are not authorized. Please contact the admin.',
        });
        await signOut(auth);
      }
    } catch (error) {
      notification.error({
        message: 'Login Failed',
        description: error.message,
      });
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Title level={2} className="login-title">Admin Login</Title>
        <Form layout="vertical">
          <Form.Item>
            <Button
              type="primary"
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
              loading={loading}
              block
            >
              Login with Google
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
