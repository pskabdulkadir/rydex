import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const breadcrumbConfig: Record<string, BreadcrumbItem[]> = {
  '/admin': [
    { label: 'Yönetim', path: '/admin' }
  ],
  '/checkout': [
    { label: 'Alışveriş', path: '/checkout' }
  ],
  '/rydex': [
    { label: 'Ana Sayfa', path: '/rydex' }
  ]
};

export default function Breadcrumb() {
  const location = useLocation();
  const pathname = location.pathname;

  // Mevcut sayfanın breadcrumb öğelerini al
  const items = breadcrumbConfig[pathname] || [];

  // Eğer sadece bir öğe varsa breadcrumb gösterme
  if (items.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      <Link 
        to="/" 
        className="flex items-center gap-1 text-slate-400 hover:text-slate-300 transition-colors"
        title="Anasayfa"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-slate-500" />
          {item.path ? (
            <Link 
              to={item.path}
              className="text-slate-400 hover:text-slate-300 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-300 font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
