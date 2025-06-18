import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const getInitials = (firstName?: string, lastName?: string): string => {
        const first = firstName?.[0] || '';
        const last = lastName?.[0] || '';
        return `${first}${last}`.toUpperCase();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="navbar bg-base-100 shadow-sm sticky top-0 z-30">
            <div className="flex-1">
                <Link to="/learn" className="btn btn-ghost text-xl">LELMS</Link>
            </div>

            {isAuthenticated && user && (
                <div className="flex-none gap-2">
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className={`btn btn-ghost btn-circle avatar${!user.profile_picture ? '-placeholder' : ''}`}>
                            {user.profile_picture ? (
                                <div className="w-10 rounded-full">
                                    <img alt="User profile" src={user.profile_picture} />
                                </div>
                            ) : (
                                <div className="text-neutral-content w-10">
                                    <span className="text-sm">{getInitials(user.first_name, user.last_name)}</span>
                                </div>
                            )}
                        </div>
                        <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                            <li className="menu-title">
                                <span>{user.first_name} {user.last_name}</span>
                            </li>
                            <li>
                                <Link to="/profile">Profile</Link>
                            </li>
                            <li>
                                <button onClick={handleLogout}>Logout</button>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
