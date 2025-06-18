import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Shield, Box, User as UserIcon } from 'lucide-react';

const Footer: React.FC = () => {
    const navItems = [
        { path: '/learn', icon: Home, label: 'Learn' },
        { path: '/leaderboard', icon: Shield, label: 'Leaderboard' },
        { path: '/quest', icon: Box, label: 'Quest' },
        { path: '/profile', icon: UserIcon, label: 'Profile' },
    ];

    return (
        <footer className="dock dock-lg">
            {navItems.map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => (isActive ? 'dock-active' : '')}
                >
                    <item.icon className="size-6" />
                    <span className="dock-label">{item.label}</span>
                </NavLink>
            ))}
        </footer>
    );
};

export default Footer;
