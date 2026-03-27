import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Hatası: Kullanıcı var olmayan bir rotaya erişmeye çalıştı:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Üzgünüm! Sayfa bulunamadı</p>
        <p className="text-sm text-gray-500 mb-6">{location.pathname}</p>
        <a href="/" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
          Tarama Sayfasına Dön
        </a>
      </div>
    </div>
  );
};

export default NotFound;
