import React, { useState } from 'react';
import { apiClient } from '../../services/apiClient';
import './AdminLogin.css';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('login', email);
    formData.append('password', password);
    try {
      const response = await apiClient.post<{ success: boolean; error?: string }>(
        '/login',
        formData
      );

      if (response.success) {
        login();
       navigate('/admin/halls');
      } else {
        setError(response.error || 'Неверный логин или пароль');
      }
    } catch (error) {
      console.error('не удалось подключиться к серверу:', error);
      setError('Не удалось подключиться к серверу');
    }
  };

  return (
    <div className="admin-login">
      <div className='admin-login__header'>
        <span className='admin-login__header-text'>АВТОРИЗАЦИЯ</span>
      </div>
        <form onSubmit={handleLogin}>
          
          <label>
            <span className='form-label__text'>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.ru"
            />
          </label>
          <label>
             <span className='form-label__text'>Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit">Авторизоваться</button>
          {error && <p className="error">{error}</p>}
        </form>
    </div>

  );
};

export default AdminLogin;