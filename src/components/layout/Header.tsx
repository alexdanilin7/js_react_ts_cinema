import React from 'react';
import './Header.css';
import { useAuth } from '../../pages/Admin/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const {isAuthenticated, logout} = useAuth();
  const navigate = useNavigate();
  return (
    <header className="header">
      <div className="header__logo">ИДЁМ<span className="header__logo__latter">В</span>КИНО</div>
      {isAuthenticated ? (
        <button className="header__login-btn" onClick={logout}>
          ВЫЙТИ
        </button>
      ) : (
        <button className="header__login-btn" onClick={() => navigate('/admin/login')}>
          ВОЙТИ
        </button>
      )}
    </header>
  );
};

export default Header;