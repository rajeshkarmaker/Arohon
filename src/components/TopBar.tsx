import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search, Menu } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/exam-intelligence': 'Exam Intelligence',
  '/copilot': 'Course Copilot',
  '/practice': 'Smart Practice',
  '/resources': 'Resource Hub',
  '/deadlines': 'Deadlines',
  '/settings': 'Settings',
};

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'Arohon';
  const [query, setQuery] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/resources?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="topbar">
      <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
        <Menu size={18} />
      </button>
      <h2 className="topbar-title">{title}</h2>
      <div className="topbar-search">
        <div className="search-wrapper">
          <Search />
          <input
            type="search"
            className="search-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search courses, questions, notes, concepts…"
            aria-label="Search"
          />
        </div>
      </div>
    </header>
  );
}
