import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

export default function Home() {
  const [message, setMessage] = useState('로딩 중...');

  useEffect(() => {
    axios.get('/test')
      .then((res) => setMessage(res.data))
      .catch(() => setMessage('API 호출 실패'));
  }, []);

  return <h1>{message}</h1>;
}