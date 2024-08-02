import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../utils/firebase';
import moment from 'moment';

const PaymentRequests = () => {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentRequest, setCurrentRequest] = useState(null);

  useEffect(() => {
    const fetchPaymentRequests = async () => {
      const paymentRequestsCollection = collection(firestore, 'paymentRequests');
      const paymentRequestsSnapshot = await getDocs(paymentRequestsCollection);
      const paymentRequestsList = paymentRequestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPaymentRequests(paymentRequestsList);
    };

    fetchPaymentRequests();
  }, []);

  const handleApprove = async (request) => {
    const userDoc = doc(firestore, 'users', request.uid);
    const userSnapshot = await getDoc(userDoc);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const updatedPayments = [
        ...userData.paymentHistory,
        { ...request, status: 'approved' },
      ];
      const newGoldPoints = userData.goldpoints + request.amount;

      await updateDoc(userDoc, {
        paymentHistory: updatedPayments,
        goldpoints: newGoldPoints,
      });

      await addDoc(collection(firestore, 'deposits'), {
        uid: request.uid,
        amount: request.amount,
        utr: request.utr,
        time: request.time,
      });

      await deleteDoc(doc(firestore, 'paymentRequests', request.id));
      setPaymentRequests(paymentRequests.filter((pr) => pr.id !== request.id));
      message.success('Payment approved successfully');
    }
  };

  const handleReject = (request) => {
    setCurrentRequest(request);
    setIsModalVisible(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason) {
      message.error('Please provide a reason for rejection');
      return;
    }

    const userDoc = doc(firestore, 'users', currentRequest.uid);
    const userSnapshot = await getDoc(userDoc);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const updatedPayments = [
        ...userData.paymentHistory,
        { ...currentRequest, status: 'rejected', reason: rejectReason },
      ];
      await updateDoc(userDoc, { paymentHistory: updatedPayments });
      await deleteDoc(doc(firestore, 'paymentRequests', currentRequest.id));
      setPaymentRequests(paymentRequests.filter((pr) => pr.id !== currentRequest.id));
      setIsModalVisible(false);
      setRejectReason('');
      message.success('Payment rejected successfully');
    }
  };

  const formatTime = (time) => {
    if (time instanceof Date) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss');
    } else if (time && time.toDate) {
      return moment(time.toDate()).format('YYYY-MM-DD HH:mm:ss');
    }
    return moment(time).format('YYYY-MM-DD HH:mm:ss');
  };

  const columns = [
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'UTR', dataIndex: 'utr', key: 'utr' },
    { title: 'Time', dataIndex: 'time', key: 'time', render: formatTime },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            style={{ marginRight: 8 }}
            onClick={() => handleApprove(record)}
          >
            Approve
          </Button>
          <Button
            type="danger"
            icon={<CloseOutlined />}
            size="small"
            onClick={() => handleReject(record)}
          >
            Reject
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={paymentRequests}
        rowKey="id"
        scroll={{ x: 800 }}
        pagination={{ pageSize: 5 }}
      />
      <Modal
        title="Reject Payment"
        visible={isModalVisible}
        onOk={handleRejectConfirm}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input.TextArea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection"
          rows={4}
        />
      </Modal>
    </div>
  );
};

export default PaymentRequests;
