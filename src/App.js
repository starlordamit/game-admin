import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { auth, onAuthStateChanged } from './utils/firebase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import HomePage from './pages/HomePage';
import Users from './components/Users';
import PaymentRequests from './components/PaymentRequests';
import Settings from './components/Settings';
import ErrorPage from './pages/ErrorPage';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <Login onLogin={setUser} />}
          />
          <Route
            path="/dashboard/*"
            element={user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/" />}
          >
            <Route path="home" element={<HomePage />} />
            <Route path="users" element={<Users />} />
            <Route path="payment-requests" element={<PaymentRequests />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
