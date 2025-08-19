import React from 'react';
import './Background.css';

interface BackgroundProps {
  isAdmin?: boolean;
}

const Background: React.FC<BackgroundProps> = ({ isAdmin = false }) => {
  return (
    <div
      className="background"
      style={{
        backgroundImage: isAdmin
          ? 'url("/assets/img/login_desktop.png")'
          : 'url("/assets/img/bg_desktop.png")',
      }}
    ></div>
  );
};

export default Background;