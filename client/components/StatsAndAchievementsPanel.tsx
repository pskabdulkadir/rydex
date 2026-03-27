import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Star,
  Trophy,
  Trash2,
  Download,
  TrendingUp,
  Clock,
  Zap,
} from 'lucide-react';
import {
  getFavorites,
  getScanStats,
  getScanHistory,
  clearScanHistory,
  addScanRecord,
  removeFavorite,
  getAchievements,
} from '@/lib/storage-manager';
import { STRUCTURES } from '@/lib/structures';
import { ACHIEVEMENTS, getAchievementDisplay, formatAchievementDate } from '@/lib/achievements';

type TabType = 'stats' | 'favorites' | 'achievements';

export default function StatsAndAchievementsPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [stats, setStats] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      setStats(getScanStats());
      const favIds = getFavorites();
      setFavorites(favIds.map((id) => STRUCTURES[id]));
      const achs = getAchievements();
      setAchievements(achs.length > 0 ? achs : Object.values(ACHIEVEMENTS));
      setHistory(getScanHistory());
    };
    loadData();
  }, []);

  const handleExportStats = () => {
    const data = {
      exportDate: new Date().toISOString(),
      stats,
      favorites: favorites.map((f) => f.name),
      achievements: achievements
        .filter((a) => a.unlockedAt)
        .map((a) => ({
          name: a.name,
          unlockedAt: formatAchievementDate(a.unlockedAt),
        })),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-stats-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    if (window.confirm('Tarama geçmişini temizlemek istediğinize emin misiniz?')) {
      clearScanHistory();
      setHistory([]);
      setStats(getScanStats());
    }
  };

  return (
    <div className="w-full">
      {/* Sekmeler */}
      <div className="flex gap-2 mb-4 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'stats'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          İstatistikler
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'favorites'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Star className="w-4 h-4" />
          Favoriler ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'achievements'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Başarılar
        </button>
      </div>

      <div className="space-y-4">
        {/* İstatistikler Sekmesi */}
        {activeTab === 'stats' && (
          <>
            {/* Genel İstatistikler */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <p className="text-xs text-slate-400 uppercase font-bold">Toplam Tarama</p>
                </div>
                <p className="text-3xl font-bold text-white">{stats?.totalScans || 0}</p>
              </Card>

              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-slate-400 uppercase font-bold">Yapı Türleri</p>
                </div>
                <p className="text-3xl font-bold text-white">{stats?.structureTypesScanned || 0}/38</p>
              </Card>

              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <p className="text-xs text-slate-400 uppercase font-bold">Ort. Derinlik</p>
                </div>
                <p className="text-3xl font-bold text-white">{(stats?.averageDepth || 0).toFixed(1)}m</p>
              </Card>

              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <p className="text-xs text-slate-400 uppercase font-bold">Max Manyetik</p>
                </div>
                <p className="text-3xl font-bold text-white">{stats?.highestMagneticStrength || 0}nT</p>
              </Card>
            </div>

            {/* Son Taramalar */}
            {history.length > 0 && (
              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Son Taramalar
                  </h3>
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Temizle
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {history.slice(0, 10).map((record, idx) => (
                    <div key={record.id} className="flex items-center justify-between bg-slate-900/50 p-2 rounded text-sm">
                      <div>
                        <p className="text-white font-medium">{STRUCTURES[record.structureType]?.name}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(record.timestamp).toLocaleTimeString('tr-TR')}
                        </p>
                      </div>
                      <Badge className="text-xs bg-blue-600/30 text-blue-200">
                        {record.magneticStrength}nT
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* İhracat Butonu */}
            <Button
              onClick={handleExportStats}
              className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              İstatistikleri İndir (JSON)
            </Button>
          </>
        )}

        {/* Favoriler Sekmesi */}
        {activeTab === 'favorites' && (
          <>
            {favorites.length > 0 ? (
              <div className="space-y-2">
                {favorites.map((fav) => (
                  <Card key={fav.id} className="bg-slate-800 border-slate-700 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{fav.icon}</span>
                      <div>
                        <p className="font-semibold text-white">{fav.name}</p>
                        <p className="text-xs text-slate-400">{fav.categoryName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        removeFavorite(fav.id);
                        setFavorites(favorites.filter((f) => f.id !== fav.id));
                      }}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700 p-6 text-center">
                <Star className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400">Henüz favori yapı türü eklemediniz</p>
                <p className="text-xs text-slate-500 mt-1">Yapı listesindeki yıldız ikonuna tıklayarak ekleyin</p>
              </Card>
            )}
          </>
        )}

        {/* Başarılar Sekmesi */}
        {activeTab === 'achievements' && (
          <>
            {achievements.length > 0 && (
              <>
                {/* Başarı İstatistikleri */}
                <div className="flex items-center justify-between mb-3 bg-amber-900/20 border border-amber-700/50 rounded p-3">
                  <div>
                    <p className="text-sm text-amber-200 font-bold">
                      {achievements.filter((a) => a.unlockedAt).length} / {achievements.length} Başarı
                    </p>
                    <p className="text-xs text-amber-300">
                      {Math.round(
                        (achievements.filter((a) => a.unlockedAt).length / achievements.length) * 100
                      )}% Tamamlandı
                    </p>
                  </div>
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>

                {/* Başarı Listesi */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {achievements.map((achievement) => {
                    const display = getAchievementDisplay(achievement);
                    return (
                      <Card
                        key={achievement.id}
                        className={`border-slate-700 p-3 ${
                          display.isUnlocked ? 'bg-slate-800' : 'bg-slate-900/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`text-2xl ${display.isUnlocked ? '' : 'opacity-50'}`}>
                            {display.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${display.isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                              {display.name}
                            </p>
                            <p className="text-xs text-slate-400">{display.description}</p>
                            {display.progress !== undefined && display.progress > 0 && display.progress < 100 && (
                              <div className="mt-2">
                                <div className="w-full bg-slate-700 rounded-full h-1.5">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-1.5 rounded-full transition-all"
                                    style={{ width: `${display.progress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">{display.progress}%</p>
                              </div>
                            )}
                            {display.unlockedAt && (
                              <p className="text-xs text-green-400 mt-1">
                                ✓ {formatAchievementDate(display.unlockedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
