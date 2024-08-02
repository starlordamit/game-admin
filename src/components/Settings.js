import React, { useEffect, useState } from 'react';
import { Button, Input, message } from 'antd';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import { firestore } from '../utils/firebase';

const Settings = () => {
  const [upiHandle, setUpiHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpiHandle = async () => {
      try {
        const settingsDoc = await getDoc(doc(firestore, 'settings', 'upi_id'));
        if (settingsDoc.exists()) {
          setUpiHandle(settingsDoc.data().upi_handle);
        }
      } catch (err) {
        console.error('Error fetching UPI handle:', err);
      }
    };

    fetchUpiHandle();
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await setDoc(doc(firestore, 'settings', 'upi_id'), { upi_handle: upiHandle });
      setSuccess(true);
      setLoading(false);
      message.success('UPI handle updated successfully');
    } catch (err) {
      setError('Failed to update UPI handle');
      setLoading(false);
      message.error('Failed to update UPI handle');
    }
  };

  return (
    <div>
      <h2>Settings</h2>
      <Input
        value={upiHandle}
        onChange={(e) => setUpiHandle(e.target.value)}
        placeholder="Enter UPI handle"
        style={{ marginBottom: '16px' }}
      />
      <Button type="primary" onClick={saveSettings} loading={loading}>
        Save
      </Button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Settings updated successfully</p>}
    </div>
  );
};

export default Settings;
