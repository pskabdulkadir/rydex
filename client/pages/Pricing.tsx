import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Loader2, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SubscriptionPlanDetail } from '@shared/api';
import { toast } from 'sonner';

export default function Pricing() {
  const [plans, setPlans] = useState<SubscriptionPlanDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Plans fetch error:', error);
      toast.error('Planlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      toast.error('Satın almak için giriş yapmalısınız');
      navigate('/login');
      return;
    }

    setSelectedPlan(planId);
    navigate('/checkout', { state: { plan: planId } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pricing Planları
          </h1>
          <p className="text-xl text-gray-600">
            Sizin için uygun olan planı seçin ve keşfetmeye başlayın
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col p-6 transition-all ${
                plan.id === 'annual'
                  ? 'ring-2 ring-yellow-400 transform scale-105'
                  : 'hover:shadow-lg'
              }`}
            >
              {plan.id === 'annual' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                    Popüler
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-600 ml-2">
                  {plan.currency}
                </span>
                {plan.durationDays > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {plan.durationDays} gün için
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-6 flex-grow">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    {plan.features.scansPerDay} tarama/gün
                  </span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Max {Math.floor(plan.features.maxScanDuration / 60)} dakika/tarama
                  </span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    {plan.features.customAnalysis ? 'Özel Analiz' : 'Standart Analiz'}
                  </span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    {plan.features.adminAccess ? 'Admin Paneli' : 'Temel Erişim'}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={selectedPlan === plan.id && loading}
                className={`w-full py-2 font-semibold ${
                  plan.id === 'annual'
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {selectedPlan === plan.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {plan.price === 0 ? 'Şimdi Başla' : 'Satın Al'}
              </Button>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Özellik Karşılaştırması</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Özellik</th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      className="text-center py-3 px-4 font-semibold text-gray-900"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Günlük Tarama Limiti</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.features.scansPerDay}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Max Tarama Süresi</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {Math.floor(plan.features.maxScanDuration / 60)} dakika
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Özel Analiz</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.features.customAnalysis ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Admin Paneli</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.features.adminAccess ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
