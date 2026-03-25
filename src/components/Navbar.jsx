import React from 'react';
import { useLocation } from 'react-router-dom';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

const pageTitles = {
  '/': 'Dashboard',
  '/orders': 'Orders',
  '/companies': 'Companies',
  '/categories': 'Categories',
  '/users': 'Users',
};

const Navbar = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="cyber-navbar" aria-label="Top navigation">
      <div className="cyber-navbar-left">
        <button className="cyber-icon-button" type="button" aria-label="Open menu">
          ☰
        </button>
        <div>
          <p className="cyber-navbar-kicker">Control Center</p>
          <h1 className="cyber-navbar-title">{title}</h1>
        </div>
      </div>

      <div className="cyber-navbar-right">
        <button className="cyber-icon-button" type="button" aria-label="Settings">
          ⚙
        </button>
        <div className="cyber-user-avatar" aria-hidden="true">
          A
        </div>
      </div>
    </header>
  );
};

export default Navbar;
