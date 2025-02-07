export interface ConsentPreferences {
  analytics: boolean;
  marketing: boolean;
  necessary: boolean;
}

export interface DataRetentionPolicy {
  type: string;
  duration: number; // in days
  purpose: string;
}

export interface DataSubjectRequest {
  type: 'access' | 'erasure' | 'rectification' | 'portability';
  userId: string;
  requestDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  details?: string;
}