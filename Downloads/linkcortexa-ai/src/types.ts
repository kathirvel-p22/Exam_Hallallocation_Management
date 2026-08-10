export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  scansCount: number;
  threatsBlocked: number;
  createdAt: string;
}

export interface Threat {
  id: string;
  url: string;
  domain: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  threatTypes: string[];
  timestamp: string;
  source: 'manual' | 'extension';
  status: 'active' | 'blocked';
  details: any;
}

export interface VaultItem {
  id: string;
  ownerId: string;
  title: string;
  dataType: string;
  encryptedContent: string;
  shares: string[]; // In a real app, these would be distributed
  hash: string;
  createdAt: string;
}
