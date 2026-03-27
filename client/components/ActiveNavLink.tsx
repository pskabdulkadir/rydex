import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface ActiveNavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
  exact?: boolean;
  icon?: React.ReactNode;
}

export default function ActiveNavLink({
  to,
  children,
  className = '',
  activeClassName = 'text-white border-blue-500',
  onClick,
  exact = false,
  icon
}: ActiveNavLinkProps) {
  const location = useLocation();
  
  const isActive = exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 transition-all duration-200 ${
        isActive ? activeClassName : className
      }`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </Link>
  );
}

/**
 * Tab navigation bileşeni - tab tipi navigasyon için
 */
interface TabNavProps {
  to: string;
  isActive: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: number;
}

export function TabNav({ to, isActive, onClick, children, icon, badge }: TabNavProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap flex items-center gap-2 ${
        isActive
          ? 'border-blue-500 text-white'
          : 'border-transparent text-slate-400 hover:text-slate-300'
      }`}
    >
      {icon}
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 bg-red-500 rounded-full text-xs font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
