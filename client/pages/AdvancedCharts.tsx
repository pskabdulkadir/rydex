import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, TrendingUp, BarChart3, PieChart, LineChart } from "lucide-react";
import { toast } from "sonner";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
  }[];
}

export default function AdvancedCharts() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("monthly");

  // Örnek veri oluştur
  useEffect(() => {
    generateChartData();
  }, [timeRange]);

  const generateChartData = () => {
    const now = new Date();
    const months = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    const revenueData = [45000, 52000, 48000, 61000, 55000, 67000, 72000, 68000, 75000, 82000, 79000, 85000];
    const orderData = [450, 520, 480, 610, 550, 670, 720, 680, 750, 820, 790, 850];
    const userGrowth = [1200, 1450, 1680, 1920, 2150, 2480, 2750, 3020, 3350, 3680, 4050, 4420];

    setChartData({
      revenue: {
        labels: months,
        data: revenueData,
        title: "Aylık Gelir",
        total: revenueData.reduce((a, b) => a + b, 0),
        average: Math.round(revenueData.reduce((a, b) => a + b, 0) / revenueData.length),
        growth: 18.5,
      },
      orders: {
        labels: months,
        data: orderData,
        title: "Aylık Siparişler",
        total: orderData.reduce((a, b) => a + b, 0),
        average: Math.round(orderData.reduce((a, b) => a + b, 0) / orderData.length),
        growth: 22.3,
      },
      users: {
        labels: months,
        data: userGrowth,
        title: "Kullanıcı Büyümesi",
        total: userGrowth.length,
        average: Math.round(userGrowth.reduce((a, b) => a + b, 0) / userGrowth.length),
        growth: 268,
      },
      categories: {
        labels: ["Elektronik", "Giyim", "Kitap", "Ev & Bahçe", "Oyuncak", "Spor"],
        data: [25000, 20000, 15000, 18000, 12000, 10000],
        colors: ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"],
        title: "Kategori Başına Satış",
      },
      performance: {
        labels: ["Ürün A", "Ürün B", "Ürün C", "Ürün D", "Ürün E"],
        data: [85, 72, 90, 65, 78],
        title: "Ürün Performans Puanı",
      },
    });
  };

  const handleDownloadReport = (format: "pdf" | "excel" | "csv") => {
    toast.success(`${format.toUpperCase()} raporu indirildi!`);
  };

  const handleRefreshData = async () => {
    setLoading(true);
    setTimeout(() => {
      generateChartData();
      setLoading(false);
      toast.success("Veriler yenilendi!");
    }, 1000);
  };

  if (!chartData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Grafikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Başlık */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Gelişmiş Grafikler ve Raporlar</h1>
            <p className="text-slate-600">İşletme performansı ve istatistiklerini analiz edin</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefreshData} disabled={loading} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              {loading ? "Yenileniyor..." : "Yenile"}
            </Button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="weekly">Haftalık</option>
              <option value="monthly">Aylık</option>
              <option value="yearly">Yıllık</option>
            </select>
          </div>
        </div>

        {/* Ana Grafikler */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Gelir</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Siparişler</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              <span className="hidden sm:inline">Kullanıcılar</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">Kategoriler</span>
            </TabsTrigger>
            <TabsTrigger value="performance">Performans</TabsTrigger>
          </TabsList>

          {/* Gelir Grafiği */}
          <TabsContent value="revenue">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Grafik */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{chartData.revenue.title}</CardTitle>
                  <CardDescription>Son 12 ay değerleri</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 flex flex-col justify-between">
                    {/* Basit Sütun Grafiği */}
                    <div className="flex items-end justify-around gap-1 h-64">
                      {chartData.revenue.data.map((value: number, idx: number) => {
                        const maxValue = Math.max(...chartData.revenue.data);
                        const height = (value / maxValue) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <div
                              className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                              style={{ height: `${height}%`, minHeight: "2px" }}
                              title={`${chartData.revenue.labels[idx]}: ₺${value.toLocaleString()}`}
                            />
                            <span className="text-xs text-slate-600 text-center hidden lg:inline">
                              {chartData.revenue.labels[idx][0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-sm text-slate-600 text-center mt-4">
                      Aylık Gelir Trendleri
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* İstatistikler */}
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-600 mb-2">Toplam Gelir</p>
                      <p className="text-3xl font-bold text-blue-900">
                        ₺{chartData.revenue.total.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-600 mb-2">Ortalama</p>
                      <p className="text-3xl font-bold text-green-900">
                        ₺{chartData.revenue.average.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-600 mb-2">Büyüme</p>
                      <p className="text-3xl font-bold text-purple-900">
                        {chartData.revenue.growth}%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Raporu İndir
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Siparişler Grafiği */}
          <TabsContent value="orders">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{chartData.orders.title}</CardTitle>
                  <CardDescription>Aylık sipariş sayıları</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 flex flex-col justify-between">
                    <div className="flex items-end justify-around gap-1 h-64">
                      {chartData.orders.data.map((value: number, idx: number) => {
                        const maxValue = Math.max(...chartData.orders.data);
                        const height = (value / maxValue) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <div
                              className="w-full bg-amber-500 rounded-t transition-all hover:bg-amber-600"
                              style={{ height: `${height}%`, minHeight: "2px" }}
                              title={`${chartData.orders.labels[idx]}: ${value} sipariş`}
                            />
                            <span className="text-xs text-slate-600 text-center hidden lg:inline">
                              {chartData.orders.labels[idx][0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-sm text-slate-600 text-center mt-4">
                      Aylık Siparişler
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-600 mb-2">Toplam Sipariş</p>
                      <p className="text-3xl font-bold text-amber-900">
                        {chartData.orders.total.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-600 mb-2">Günlük Ortalama</p>
                      <p className="text-3xl font-bold text-orange-900">
                        {Math.round(chartData.orders.total / 30)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-600 mb-2">Büyüme</p>
                      <p className="text-3xl font-bold text-red-900">
                        {chartData.orders.growth}%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full gap-2" variant="outline">
                  <Download className="w-4 h-4" />
                  CSV İndir
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Kullanıcı Büyümesi */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>{chartData.users.title}</CardTitle>
                <CardDescription>Aktif kullanıcı sayısı eğilimi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6">
                  <div className="flex items-end justify-around gap-0.5 h-full">
                    {chartData.users.data.map((value: number, idx: number) => {
                      const maxValue = Math.max(...chartData.users.data);
                      const minValue = Math.min(...chartData.users.data);
                      const height = ((value - minValue) / (maxValue - minValue)) * 90 + 10;
                      return (
                        <div
                          key={idx}
                          className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t transition-all hover:from-emerald-600 hover:to-teal-500"
                          style={{ height: `${height}%` }}
                          title={`${chartData.users.labels[idx]}: ${value} kullanıcı`}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-sm text-slate-600">Başlangıç</p>
                        <p className="text-lg font-bold text-slate-900">
                          {chartData.users.data[0].toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-sm text-slate-600">Son Ay</p>
                        <p className="text-lg font-bold text-slate-900">
                          {chartData.users.data[chartData.users.data.length - 1].toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-sm text-slate-600">Artış</p>
                        <p className="text-lg font-bold text-green-600">
                          +{(chartData.users.data[chartData.users.data.length - 1] - chartData.users.data[0]).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kategoriler (Pasta Grafik) */}
          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{chartData.categories.title}</CardTitle>
                  <CardDescription>Kategori başına satış payı</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="relative w-64 h-64">
                      {/* Pasta Grafik (SVG) */}
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        {chartData.categories.data.map((value: number, idx: number) => {
                          const total = chartData.categories.data.reduce((a: number, b: number) => a + b, 0);
                          const percent = (value / total) * 100;
                          const prevPercents = chartData.categories.data
                            .slice(0, idx)
                            .reduce((a: number, b: number) => a + (b / total) * 100, 0);
                          const startAngle = (prevPercents / 100) * 360;
                          const endAngle = ((prevPercents + percent) / 100) * 360;

                          return (
                            <circle
                              key={idx}
                              cx="100"
                              cy="100"
                              r="80"
                              fill="none"
                              stroke={chartData.categories.colors[idx]}
                              strokeWidth="40"
                              strokeDasharray={`${(percent / 100) * 2 * Math.PI * 80} ${2 * Math.PI * 80}`}
                              strokeDashoffset={`${-(prevPercents / 100) * 2 * Math.PI * 80}`}
                              style={{ opacity: 0.8 }}
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900">100%</p>
                          <p className="text-xs text-slate-600">Toplam Satış</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Kategori Listesi */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kategoriler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {chartData.categories.labels.map((label: string, idx: number) => {
                    const total = chartData.categories.data.reduce((a: number, b: number) => a + b, 0);
                    const percent = ((chartData.categories.data[idx] / total) * 100).toFixed(1);
                    return (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: chartData.categories.colors[idx] }}
                          />
                          <span className="text-sm text-slate-700">{label}</span>
                        </div>
                        <Badge variant="outline">{percent}%</Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performans */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>{chartData.performance.title}</CardTitle>
                <CardDescription>0-100 ölçeğinde ürün puanları</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.performance.labels.map((label: string, idx: number) => {
                    const value = chartData.performance.data[idx];
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-900">{label}</span>
                          <span className="text-sm text-slate-600">{value}/100</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${value}%`,
                              backgroundColor: value >= 80 ? "#10B981" : value >= 60 ? "#F59E0B" : "#EF4444",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dışa Aktarma */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Raporları İndir</CardTitle>
            <CardDescription>Verileri farklı formatlar halinde dışa aktarın</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={() => handleDownloadReport("pdf")} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                PDF
              </Button>
              <Button onClick={() => handleDownloadReport("excel")} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Excel
              </Button>
              <Button onClick={() => handleDownloadReport("csv")} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                CSV
              </Button>
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Tümünü İndir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
