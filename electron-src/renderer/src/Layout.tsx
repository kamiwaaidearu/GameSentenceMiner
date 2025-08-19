import { Outlet, useLocation, useNavigate } from 'react-router';
import './Layout.css';

export const Layout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabButtons = [
        { path: '/home', label: 'Home' },
        { path: '/ocr', label: 'OCR' },
        { path: '/launcher', label: 'Game Launcher' },
        { path: '/settings', label: 'Settings' },
        { path: '/python', label: 'Python' },
        { path: '/console', label: 'Console' },
    ];

    return (
        <>
            <div
                id="main-tab-bar"
                className="tab-bar"
            >
                {tabButtons.map((button) => (
                    <button
                        key={button.path}
                        className={`tab-button ${location.pathname === button.path ? 'active' : ''}`}
                        onClick={() => navigate(button.path)}
                    >
                        {button.label}
                    </button>
                ))}
            </div>
            <div className="tab-content">
                <Outlet />
            </div>
        </>
    );
};
