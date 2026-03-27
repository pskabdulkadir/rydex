/**
 * Firestore Access Control Modeli
 * Her kullanıcı için bir access_control dokümanı
 */

export interface AccessControl {
  // Firestore doc ID = userId
  userId: string;
  
  // Paket bilgisi
  packageId: string; // 'starter' | 'pro' | 'deep' | 'ultimate' | 'monthly' | 'master'
  
  // Erişim kontrolü
  accessLevel: number; // 1 (Starter) -> 6 (Master)
  isActive: boolean;
  
  // Zaman kontrolü (milisaniye hassasiyeti)
  expiryTimestamp: number; // currentTime > expiryTimestamp => EXPIRED
  purchaseTimestamp: number;
  
  // Özellikleri
  features: AccessFeatures;
  
  // API kullanım takibi (Optional)
  apiCallsUsed?: number;
  apiCallsLimit?: number;
  
  // Session yönetimi
  sessionToken?: string;
  sessionCreatedAt?: number;
  
  // Createdby sistem
  createdAt: number;
  updatedAt: number;
}

export interface AccessFeatures {
  // Temel özellikler
  can3DAnalysis: boolean;
  canMetalDetection: boolean;
  canLayerAnalysis: boolean;
  canGPRAnalysis: boolean;
  
  // Sensör erişimi
  canUseMagnetometer: boolean;
  canUseCamera: boolean;
  canUseRadar: boolean;
  
  // API ve veri
  canExportData: boolean;
  canAccessAPI: boolean;
  maxStorageGB: number;
  
  // Kurumsal
  canManageTeam: boolean;
  teamMembersLimit: number;
  
  // Master License
  canAccessSourceCode: boolean;
  canUseTrademark: boolean;
  canWhiteLabel: boolean;
}

/**
 * Access Level Tanımlamaları
 */
export const ACCESS_LEVELS = {
  NONE: 0,
  STARTER: 1,      // Starter Scan
  PRO: 2,           // Pro Explorer
  DEEP: 3,          // Deep Analyser
  ULTIMATE: 4,      // Ultimate Access
  MONTHLY: 5,       // Monthly Corp
  MASTER: 6         // Master License
} as const;

/**
 * Paket ID -> Access Level Mapping
 */
export const PACKAGE_TO_LEVEL: Record<string, number> = {
  'starter': ACCESS_LEVELS.STARTER,
  'pro': ACCESS_LEVELS.PRO,
  'deep': ACCESS_LEVELS.DEEP,
  'ultimate': ACCESS_LEVELS.ULTIMATE,
  'monthly': ACCESS_LEVELS.MONTHLY,
  'master': ACCESS_LEVELS.MASTER
};

/**
 * Access Level -> Özellikleri Mapping
 */
export const LEVEL_FEATURES: Record<number, AccessFeatures> = {
  [ACCESS_LEVELS.NONE]: {
    can3DAnalysis: false,
    canMetalDetection: false,
    canLayerAnalysis: false,
    canGPRAnalysis: false,
    canUseMagnetometer: false,
    canUseCamera: false,
    canUseRadar: false,
    canExportData: false,
    canAccessAPI: false,
    maxStorageGB: 0,
    canManageTeam: false,
    teamMembersLimit: 0,
    canAccessSourceCode: false,
    canUseTrademark: false,
    canWhiteLabel: false
  },
  
  [ACCESS_LEVELS.STARTER]: {
    can3DAnalysis: true,
    canMetalDetection: false,
    canLayerAnalysis: false,
    canGPRAnalysis: false,
    canUseMagnetometer: true,
    canUseCamera: true,
    canUseRadar: false,
    canExportData: false,
    canAccessAPI: false,
    maxStorageGB: 1,
    canManageTeam: false,
    teamMembersLimit: 0,
    canAccessSourceCode: false,
    canUseTrademark: false,
    canWhiteLabel: false
  },
  
  [ACCESS_LEVELS.PRO]: {
    can3DAnalysis: true,
    canMetalDetection: true,
    canLayerAnalysis: true,
    canGPRAnalysis: false,
    canUseMagnetometer: true,
    canUseCamera: true,
    canUseRadar: false,
    canExportData: true,
    canAccessAPI: false,
    maxStorageGB: 10,
    canManageTeam: false,
    teamMembersLimit: 0,
    canAccessSourceCode: false,
    canUseTrademark: false,
    canWhiteLabel: false
  },
  
  [ACCESS_LEVELS.DEEP]: {
    can3DAnalysis: true,
    canMetalDetection: true,
    canLayerAnalysis: true,
    canGPRAnalysis: true,
    canUseMagnetometer: true,
    canUseCamera: true,
    canUseRadar: true,
    canExportData: true,
    canAccessAPI: true,
    maxStorageGB: 50,
    canManageTeam: false,
    teamMembersLimit: 0,
    canAccessSourceCode: false,
    canUseTrademark: false,
    canWhiteLabel: false
  },
  
  [ACCESS_LEVELS.ULTIMATE]: {
    can3DAnalysis: true,
    canMetalDetection: true,
    canLayerAnalysis: true,
    canGPRAnalysis: true,
    canUseMagnetometer: true,
    canUseCamera: true,
    canUseRadar: true,
    canExportData: true,
    canAccessAPI: true,
    maxStorageGB: 100,
    canManageTeam: false,
    teamMembersLimit: 0,
    canAccessSourceCode: false,
    canUseTrademark: false,
    canWhiteLabel: false
  },
  
  [ACCESS_LEVELS.MONTHLY]: {
    can3DAnalysis: true,
    canMetalDetection: true,
    canLayerAnalysis: true,
    canGPRAnalysis: true,
    canUseMagnetometer: true,
    canUseCamera: true,
    canUseRadar: true,
    canExportData: true,
    canAccessAPI: true,
    maxStorageGB: 100,
    canManageTeam: true,
    teamMembersLimit: 5,
    canAccessSourceCode: false,
    canUseTrademark: false,
    canWhiteLabel: false
  },
  
  [ACCESS_LEVELS.MASTER]: {
    can3DAnalysis: true,
    canMetalDetection: true,
    canLayerAnalysis: true,
    canGPRAnalysis: true,
    canUseMagnetometer: true,
    canUseCamera: true,
    canUseRadar: true,
    canExportData: true,
    canAccessAPI: true,
    maxStorageGB: 1000,
    canManageTeam: true,
    teamMembersLimit: 999,
    canAccessSourceCode: true,
    canUseTrademark: true,
    canWhiteLabel: true
  }
};

/**
 * Access Control'ü sıfırla (ödeme sonrası veya süresi bitince)
 */
export function createAccessControl(
  userId: string,
  packageId: string,
  accessLevel: number,
  expiryTimestamp: number
): AccessControl {
  return {
    userId,
    packageId,
    accessLevel,
    isActive: true,
    expiryTimestamp,
    purchaseTimestamp: Date.now(),
    features: LEVEL_FEATURES[accessLevel] || LEVEL_FEATURES[ACCESS_LEVELS.NONE],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

/**
 * Süresi bitmiş kontrol
 */
export function isAccessExpired(accessControl: AccessControl): boolean {
  return Date.now() > accessControl.expiryTimestamp;
}

/**
 * Erişim geçerli mi kontrol
 */
export function isAccessValid(accessControl: AccessControl): boolean {
  return accessControl.isActive && !isAccessExpired(accessControl);
}
