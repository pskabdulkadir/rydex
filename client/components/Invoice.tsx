import React from 'react';
import { Download, Printer } from 'lucide-react';

interface InvoiceProps {
  invoiceNumber: string;
  date: Date;
  customerName: string;
  customerEmail: string;
  packageName: string;
  packagePrice: number;
  duration: string;
  tax: number;
  total: number;
}

export function Invoice({
  invoiceNumber,
  date,
  customerName,
  customerEmail,
  packageName,
  packagePrice,
  duration,
  tax,
  total
}: InvoiceProps) {
  const generatePDF = () => {
    const content = `
RYDEX - FATURA/MAKBUZ
=====================================

Fatura No: ${invoiceNumber}
Tarih: ${date.toLocaleDateString('tr-TR')}
Saat: ${date.toLocaleTimeString('tr-TR')}

MÜŞTERİ BİLGİLERİ:
Ad/Şirket: ${customerName}
E-posta: ${customerEmail}

ÜRÜN/HİZMET:
${packageName}
Paket Süresi: ${duration}
Fiyat: ${packagePrice.toLocaleString('tr-TR')} ₺

ÖZET:
Ara Toplam: ${packagePrice.toLocaleString('tr-TR')} ₺
KDV (%${tax}): ${((packagePrice * tax) / 100).toLocaleString('tr-TR')} ₺
TOPLAM: ${total.toLocaleString('tr-TR')} ₺

Ödeme Durumu: Onaylandı ✓
Teslimat: Anında

Bu fatura elektronik bir belge olup yasal geçerliliğe sahiptir.

Teşekkür ederiz!
RYDEX Ekibi
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `fatura-${invoiceNumber}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Invoice Card */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 print:border-black print:bg-white print:text-black">
        <div className="flex items-start justify-between mb-6 print:mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white print:text-black">RYDEX</h2>
            <p className="text-sm text-slate-400 print:text-gray-600">Arkeolojik Analiz Sistemi</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400 print:text-gray-600">Fatura No:</p>
            <p className="text-lg font-bold text-white print:text-black">{invoiceNumber}</p>
          </div>
        </div>

        {/* Date */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm print:mb-8">
          <div>
            <p className="text-slate-500 print:text-gray-600">Tarih:</p>
            <p className="text-white print:text-black font-semibold">{date.toLocaleDateString('tr-TR')}</p>
          </div>
          <div>
            <p className="text-slate-500 print:text-gray-600">Saat:</p>
            <p className="text-white print:text-black font-semibold">{date.toLocaleTimeString('tr-TR')}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="border-t border-slate-700/50 print:border-gray-300 pt-4 mb-6 print:mb-8">
          <h3 className="text-sm font-semibold text-slate-300 print:text-gray-700 mb-2">MÜŞTERİ BİLGİLERİ</h3>
          <p className="text-white print:text-black font-semibold">{customerName}</p>
          <p className="text-slate-400 print:text-gray-600 text-sm">{customerEmail}</p>
        </div>

        {/* Items */}
        <div className="border-t border-slate-700/50 print:border-gray-300 pt-4 mb-6 print:mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 print:border-gray-300">
                <th className="text-left text-slate-400 print:text-gray-600 font-semibold py-2">Ürün/Hizmet</th>
                <th className="text-right text-slate-400 print:text-gray-600 font-semibold py-2">Fiyat</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3">
                  <p className="text-white print:text-black font-semibold">{packageName}</p>
                  <p className="text-slate-400 print:text-gray-600 text-xs">{duration}</p>
                </td>
                <td className="text-right text-white print:text-black font-semibold">
                  {packagePrice.toLocaleString('tr-TR')} ₺
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="border-t border-slate-700/50 print:border-gray-300 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 print:text-gray-600">Ara Toplam:</span>
            <span className="text-white print:text-black font-semibold">{packagePrice.toLocaleString('tr-TR')} ₺</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 print:text-gray-600">KDV ({tax}%):</span>
            <span className="text-white print:text-black font-semibold">
              {((packagePrice * tax) / 100).toLocaleString('tr-TR')} ₺
            </span>
          </div>
          <div className="flex justify-between text-lg border-t border-slate-700/50 print:border-gray-300 pt-2 mt-2">
            <span className="text-white print:text-black font-bold">TOPLAM:</span>
            <span className="text-yellow-400 print:text-black font-bold text-xl">
              {total.toLocaleString('tr-TR')} ₺
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="mt-6 pt-4 border-t border-slate-700/50 print:border-gray-300">
          <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-xs font-semibold text-green-400 print:text-green-700">✓ ÖDEME ONAYLANDI</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700/50 print:border-gray-300 text-center">
          <p className="text-xs text-slate-500 print:text-gray-600">
            Bu fatura elektronik bir belge olup yasal geçerliliğe sahiptir.
          </p>
          <p className="text-xs text-slate-600 print:text-gray-700 mt-2">
            © 2024 RYDEX. Tüm hakları saklıdır.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 print:hidden">
        <button
          onClick={generatePDF}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          PDF İndir
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Yazdır
        </button>
      </div>
    </div>
  );
}
