import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BrainCircuit,
  MessageSquareText,
  BookOpen,
  FolderSearch,
  Dumbbell,
  CalendarClock,
  Settings,
  X,
} from 'lucide-react';
import { UserProfile } from '../data/courses';

interface SidebarProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/exam-intelligence', icon: BrainCircuit, label: 'Exam Intelligence', special: true },
  { to: '/copilot', icon: MessageSquareText, label: 'Course Copilot' },
  { to: '/practice', icon: Dumbbell, label: 'Smart Practice' },
  { to: '/resources', icon: FolderSearch, label: 'Resource Hub' },
  { to: '/deadlines', icon: CalendarClock, label: 'Deadlines' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="flex items-center justify-between">
          <h1>AROHON</h1>
          <button
            className="btn-ghost mobile-menu-btn"
            onClick={onClose}
            style={{ color: 'white', display: isOpen ? 'flex' : undefined }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="tagline">Rise through smarter learning.</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''} ${item.special ? 'exam-intel' : ''}`
            }
            onClick={onClose}
          >
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-dept">{user.department} · {user.series}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
