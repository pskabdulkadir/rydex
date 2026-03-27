import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  badge?: number;
}

interface ResponsiveSidebarProps {
  title?: string;
  items: NavItem[];
  isOpen?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

export default function ResponsiveSidebar({ 
  title = 'Menu', 
  items, 
  isOpen, 
  onClose,
  children 
}: ResponsiveSidebarProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Eğer isOpen prop verilmişse onu kullan, yoksa internal state kullan
  const open = isOpen !== undefined ? isOpen : internalIsOpen;
  const toggleOpen = () => {
    if (isOpen !== undefined) {
      onClose?.();
    } else {
      setInternalIsOpen(!open);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={toggleOpen}
          className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-full shadow-lg transition-all"
          aria-label="Menüyü aç"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for Mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleOpen}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/30 overflow-y-auto transition-transform duration-300 ease-out z-40 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:static md:translate-x-0`}
      >
        {/* Header */}
        <div className="sticky top-0 p-4 border-b border-slate-700/30 bg-slate-900/50 backdrop-blur">
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                if (isOpen === undefined) {
                  setInternalIsOpen(false);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                item.isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="flex items-center justify-center min-w-6 h-6 bg-red-500 rounded-full text-xs text-white font-bold">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Custom Content */}
        {children && (
          <div className="p-4 border-t border-slate-700/30">
            {children}
          </div>
        )}
      </div>

      {/* Desktop Sidebar Spacer (hidden on mobile) */}
      <div className="hidden md:block w-64 flex-shrink-0" />
    </>
  );
}
