import React from 'react';
import './Header.css';
import { useAuth } from '../../pages/Admin/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const {isAuthenticated, logout} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');


  return (
    <header className="header">
      <div>
        <div className="header__logo">ИДЁМ<span className="header__logo__latter">В</span>КИНО</div>
         {isAdminPage && (<div className='header_logo_down'> Администраторррская</div>)}
      </div>
      
      {isAuthenticated ? (
        <button className="header__login-btn" onClick={logout}>
         <span className="header__login-btn__text">ВЫЙТИ</span> 
        </button>
      ) : (
        <button className="header__login-btn" onClick={() => navigate('/admin/login')}>
          <span className="header__login-btn__text">ВОЙТИ</span> 
        </button>
      )}
    </header>
  );
};

export default Header;