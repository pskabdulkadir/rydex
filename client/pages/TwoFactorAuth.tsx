import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Copy, Eye, EyeOff, KeyRound, Smartphone, Mail } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TwoFactorMethod = "totp" | "sms" | "email";

interface TwoFactorStatus {
  totp: { enabled: boolean; lastUsed?: number };
  sms: { enabled: boolean; lastUsed?: number };
  email: { enabled: boolean; lastUsed?: number };
  hasBackupCodes: boolean;
}

interface BackupCodesState {
  codes: string[];
  showAll: boolean;
  copied: boolean;
}

export default function TwoFactorAuth() {
  const userId = localStorage.getItem("userId") || "demo-user";
  const [activeTab, setActiveTab] = useState<TwoFactorMethod>("totp");
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<BackupCodesState>({
    codes: [],
    showAll: false,
    copied: false,
  });
  const [backupCodeInput, setBackupCodeInput] = useState("");

  // Component yüklendiğinde 2FA durumunu kontrol et
  useEffect(() => {
    checkStatus();
  }, []);

  // 2FA durumunu kontrol et
  const checkStatus = async () => {
    try {
      const response = await fetch(`/api/auth/2fa/status?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setTwoFactorStatus(data.twoFactorStatus);
      }
    } catch (error) {
      console.error("Durum kontrol hatası:", error);
    }
  };

  // 2FA'yı etkinleştir
  const handleEnable = async (method: TwoFactorMethod) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, method }),
      });

      const data = await response.json();

      if (data.success) {
        if (method === "totp") {
          setSecret(data.secret);
          setBackupCodes({
            codes: data.backupCodes,
            showAll: false,
            copied: false,
          });
        }
        setShowVerification(true);
        toast.success("2FA etkinleştirme başladı. Lütfen doğrulayın.");
      } else {
        toast.error(data.error || "Hata oluştu");
      }
    } catch (error) {
      toast.error("2FA etkinleştirme sırasında hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 2FA'yı doğrula
  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      toast.error("Doğrulama kodu gerekli");
      return;
    }

    setVerifying(true);
    try {
      const payload: any = {
        userId,
        method: activeTab,
        code: verificationCode,
      };

      if (activeTab === "sms") payload.phoneNumber = phoneNumber;
      if (activeTab === "email") payload.email = email;

      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("2FA başarıyla etkinleştirildi!");
        setShowVerification(false);
        setVerificationCode("");
        setPhoneNumber("");
        setEmail("");
        setSecret("");
        await checkStatus();
      } else {
        toast.error(data.error || "Doğrulama başarısız");
      }
    } catch (error) {
      toast.error("Doğrulama sırasında hata oluştu");
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  // 2FA'yı devre dışı bırak
  const handleDisable = async (method: TwoFactorMethod) => {
    if (!confirm(`${method.toUpperCase()} 2FA'yı devre dışı bırakmak istediğinize emin misiniz?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, method }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("2FA devre dışı bırakıldı");
        await checkStatus();
      } else {
        toast.error(data.error || "Hata oluştu");
      }
    } catch (error) {
      toast.error("2FA devre dışı bırakma sırasında hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // OTP kodu gönder
  const handleSendOTP = async () => {
    if (activeTab === "sms" && !phoneNumber.trim()) {
      toast.error("Telefon numarası gerekli");
      return;
    }
    if (activeTab === "email" && !email.trim()) {
      toast.error("Email adresi gerekli");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        userId,
        method: activeTab,
      };
      if (activeTab === "sms") payload.phoneNumber = phoneNumber;
      if (activeTab === "email") payload.email = email;

      const response = await fetch("/api/auth/2fa/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`OTP kodu gönderildi! (${data.otp})`);
        setShowVerification(true);
      } else {
        toast.error(data.error || "OTP gönderilemedi");
      }
    } catch (error) {
      toast.error("OTP gönderme sırasında hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Yedek kodları yenile
  const handleRegenerateBackupCodes = async () => {
    if (!confirm("Yedek kodlar yenilenecek. Eski kodlar geçersiz olacak. Devam etmek istediğinize emin misiniz?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/2fa/regenerate-backup-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        setBackupCodes({
          codes: data.backupCodes,
          showAll: false,
          copied: false,
        });
        toast.success("Yedek kodlar başarıyla yenilendi");
      } else {
        toast.error(data.error || "Hata oluştu");
      }
    } catch (error) {
      toast.error("Yedek kodları yenileme sırasında hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Kodları kopyala
  const copyBackupCodes = () => {
    const codesText = backupCodes.codes.join("\n");
    navigator.clipboard.writeText(codesText);
    setBackupCodes({ ...backupCodes, copied: true });
    toast.success("Yedek kodlar kopyalandı");
    setTimeout(() => {
      setBackupCodes({ ...backupCodes, copied: false });
    }, 2000);
  };

  const isEnabled = twoFactorStatus?.[activeTab]?.enabled || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">İki Faktörlü Kimlik Doğrulama</h1>
          <p className="text-slate-600">Hesabınızı ek güvenlik katmanı ile koruyun</p>
        </div>

        {/* Durum Özeti */}
        {twoFactorStatus && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-slate-900">Google Authenticator</span>
                  </div>
                  <Badge variant={twoFactorStatus.totp.enabled ? "default" : "secondary"}>
                    {twoFactorStatus.totp.enabled ? "Aktif" : "Kapalı"}
                  </Badge>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <KeyRound className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-slate-900">SMS OTP</span>
                  </div>
                  <Badge variant={twoFactorStatus.sms.enabled ? "default" : "secondary"}>
                    {twoFactorStatus.sms.enabled ? "Aktif" : "Kapalı"}
                  </Badge>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-slate-900">Email OTP</span>
                  </div>
                  <Badge variant={twoFactorStatus.email.enabled ? "default" : "secondary"}>
                    {twoFactorStatus.email.enabled ? "Aktif" : "Kapalı"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ana Kartlar */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TwoFactorMethod)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="totp">Google Authenticator</TabsTrigger>
            <TabsTrigger value="sms">SMS OTP</TabsTrigger>
            <TabsTrigger value="email">Email OTP</TabsTrigger>
          </TabsList>

          {/* TOTP Tab */}
          <TabsContent value="totp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Google Authenticator Kurulumu
                </CardTitle>
                <CardDescription>
                  Google Authenticator, Microsoft Authenticator veya Authy gibi uygulamalar kullanarak zaman bazlı kod oluşturun
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isEnabled && !showVerification ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-semibold mb-1">Google Authenticator'ı kurun</p>
                        <p>Telefonunuza Google Authenticator uygulamasını indirin ve kurun</p>
                      </div>
                    </div>
                    <Button onClick={() => handleEnable("totp")} disabled={loading} className="w-full">
                      {loading ? "Yükleniyor..." : "Google Authenticator'ı Bağla"}
                    </Button>
                  </>
                ) : showVerification ? (
                  <>
                    {/* QR Kod veya Secret */}
                    {secret && (
                      <div className="space-y-4">
                        <div className="bg-slate-100 p-6 rounded-lg text-center">
                          <div className="text-sm text-slate-600 mb-3">Secret Key:</div>
                          <code className="text-lg font-mono font-semibold text-slate-900 break-all">
                            {secret}
                          </code>
                          <p className="text-xs text-slate-600 mt-3">
                            Bu kodu Google Authenticator'a manüel olarak girebilirsiniz
                          </p>
                        </div>

                        {/* Yedek Kodlar */}
                        {backupCodes.codes.length > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-yellow-900">Yedek Kodlarınızı Kaydedin</p>
                                <p className="text-sm text-yellow-800 mt-1">
                                  Bu kodları güvenli bir yere kaydedin. Kimlik doğrulayıcıya erişemezseniz bunları kullanabilirsiniz.
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {backupCodes.showAll ? (
                                <div className="bg-white rounded p-3 border border-yellow-300">
                                  <div className="grid grid-cols-2 gap-2 font-mono text-sm text-slate-700">
                                    {backupCodes.codes.map((code, i) => (
                                      <div key={i}>{code}</div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    setBackupCodes({
                                      ...backupCodes,
                                      showAll: true,
                                    })
                                  }
                                  className="text-sm text-yellow-700 hover:text-yellow-900 font-semibold"
                                >
                                  Tüm kodları göster
                                </button>
                              )}
                            </div>

                            <Button
                              onClick={copyBackupCodes}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              {backupCodes.copied ? "Kopyalandı!" : "Kodları Kopyala"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Doğrulama Inputu */}
                    <div className="space-y-3">
                      <Label>6 Haneli Kodu Girin</Label>
                      <Input
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest font-mono"
                      />
                      <Button onClick={handleVerify} disabled={verifying || verificationCode.length !== 6} className="w-full">
                        {verifying ? "Doğrulanıyor..." : "Doğrula ve Etkinleştir"}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowVerification(false);
                          setVerificationCode("");
                          setSecret("");
                          setBackupCodes({ codes: [], showAll: false, copied: false });
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        İptal
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-900">
                        <p className="font-semibold">Google Authenticator Etkin</p>
                        <p>Hesabınız Google Authenticator ile korunuyor</p>
                      </div>
                    </div>
                    <Button onClick={() => handleDisable("totp")} variant="destructive" className="w-full" disabled={loading}>
                      {loading ? "İşleniyor..." : "Devre Dışı Bırak"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Tab */}
          <TabsContent value="sms">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  SMS ile OTP Kodu
                </CardTitle>
                <CardDescription>
                  Giriş yaparken SMS ile 6 haneli bir kod alacaksınız
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isEnabled && !showVerification ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="phone">Telefon Numarası</Label>
                        <Input
                          id="phone"
                          placeholder="+90 (5__) ___ __"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                        <p className="text-xs text-slate-600 mt-1">+90 ile başlayan 10 haneli numara</p>
                      </div>
                    </div>
                    <Button onClick={() => handleSendOTP()} disabled={loading || !phoneNumber.trim()} className="w-full">
                      {loading ? "Gönderiliyor..." : "SMS OTP Gönder"}
                    </Button>
                  </>
                ) : showVerification ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="otp">SMS ile Gelen 6 Haneli Kodu Girin</Label>
                        <Input
                          id="otp"
                          placeholder="000000"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          maxLength={6}
                          className="text-center text-2xl tracking-widest font-mono"
                        />
                      </div>
                    </div>
                    <Button onClick={handleVerify} disabled={verifying || verificationCode.length !== 6} className="w-full">
                      {verifying ? "Doğrulanıyor..." : "Doğrula ve Etkinleştir"}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowVerification(false);
                        setVerificationCode("");
                        setPhoneNumber("");
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      İptal
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-900">
                        <p className="font-semibold">SMS OTP Etkin</p>
                        <p>Hesabınız SMS OTP ile korunuyor</p>
                      </div>
                    </div>
                    <Button onClick={() => handleDisable("sms")} variant="destructive" className="w-full" disabled={loading}>
                      {loading ? "İşleniyor..." : "Devre Dışı Bırak"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email ile OTP Kodu
                </CardTitle>
                <CardDescription>
                  Giriş yaparken email ile 6 haneli bir kod alacaksınız
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isEnabled && !showVerification ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email Adresi</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="ornek@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button onClick={() => handleSendOTP()} disabled={loading || !email.trim()} className="w-full">
                      {loading ? "Gönderiliyor..." : "Email OTP Gönder"}
                    </Button>
                  </>
                ) : showVerification ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email-otp">Email ile Gelen 6 Haneli Kodu Girin</Label>
                        <Input
                          id="email-otp"
                          placeholder="000000"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          maxLength={6}
                          className="text-center text-2xl tracking-widest font-mono"
                        />
                      </div>
                    </div>
                    <Button onClick={handleVerify} disabled={verifying || verificationCode.length !== 6} className="w-full">
                      {verifying ? "Doğrulanıyor..." : "Doğrula ve Etkinleştir"}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowVerification(false);
                        setVerificationCode("");
                        setEmail("");
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      İptal
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-900">
                        <p className="font-semibold">Email OTP Etkin</p>
                        <p>Hesabınız Email OTP ile korunuyor</p>
                      </div>
                    </div>
                    <Button onClick={() => handleDisable("email")} variant="destructive" className="w-full" disabled={loading}>
                      {loading ? "İşleniyor..." : "Devre Dışı Bırak"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Yedek Kodlar Bölümü */}
        {twoFactorStatus && twoFactorStatus.hasBackupCodes && (
          <Card className="mt-6 bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <KeyRound className="w-5 h-5" />
                Yedek Kodlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-800 mb-4">
                Yedek kodlar, kimlik doğrulayıcıya erişemediğinizde hesabınıza giriş yapmanıza yardımcı olur.
              </p>
              <Button onClick={handleRegenerateBackupCodes} variant="destructive" disabled={loading} className="w-full">
                {loading ? "İşleniyor..." : "Yedek Kodları Yenile"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Bilgi Kartı */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">İki Faktörlü Kimlik Doğrulama Hakkında</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-3">
            <p>
              <strong>Google Authenticator:</strong> Telefonunuzda zaman bazlı kodlar üretir. İnternet bağlantısına ihtiyaç yoktur.
            </p>
            <p>
              <strong>SMS OTP:</strong> Giriş yaparken telefonunuza SMS ile 6 haneli bir kod gönderilir.
            </p>
            <p>
              <strong>Email OTP:</strong> Giriş yaparken email adresinize 6 haneli bir kod gönderilir.
            </p>
            <p className="font-semibold">
              En az bir 2FA yöntemi aktive etmeniz önerilir.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
