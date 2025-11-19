
export interface Currency {
  code: string;
  name: string;
  flag: string;
}

export interface ExchangePlatform {
  name: string;
  rate: number;
  transferFee: number;
  totalReceiveAmount: number;
  currency: string;
  estimatedDelivery: string;
  pros: string[];
  referralBonus?: string; // e.g., "Get $20 on first transfer"
  isBestValue?: boolean;
  isFastest?: boolean;
  link?: string;
}

export interface ComparisonResult {
  marketRate: number; // Mid-market rate
  timestamp: string;
  platforms: ExchangePlatform[];
  analysis: string; // AI summary of the market
  groundingUrls: string[]; // Sources found by search
}

export type LoadingState = 'idle' | 'searching' | 'analyzing' | 'complete' | 'error';

export type SortOption = 'value' | 'fee' | 'speed';

export interface AffiliateLink {
  id: string;
  platformName: string; // e.g. "Wise"
  url: string;
  active: boolean;
}

export interface ClickStat {
  platformName: string;
  timestamp: number;
}
