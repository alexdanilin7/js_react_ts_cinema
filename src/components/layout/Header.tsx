import React from 'react';
import './Header.css';
import { useAuth } from '../../pages/Admin/AuthContext';

const Header: React.FC = () => {
  const {isAuthenticated, logout} = useAuth();

  return (
    <header className="header">
      <div className="header__logo">ИДЁМ<span className="header__logo__latter">В</span>КИНО</div>
      {isAuthenticated ? (
        <button className="header__login-btn" onClick={logout}>
          ВЫЙТИ
        </button>
      ) : (
        <button className="header__login-btn" onClick={() => window.location.href = '/admin/login'}>
          ВОЙТИ
        </button>
      )}
    </header>
  );
};

export default Header;