import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface MainLayoutProps {
    navbar?: ReactNode;
    children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ navbar, children }) => {
    return (
        <div className="app">
            {navbar}
            <div className="main-content">
                <Sidebar />
                <main className="page-content">{children}</main>
            </div>
            <Footer />
        </div>
    );
};

export default MainLayout;