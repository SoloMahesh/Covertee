import { Currency } from './types';

export const POPULAR_CURRENCIES: Currency[] = [
  { code: 'MVR', name: 'Maldivian Rufiyaa', flag: '🇲🇻' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'LKR', name: 'Sri Lankan Rupee', flag: '🇱🇰' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭' },
];

export const SAMPLE_PROMPTS = [
  { from: 'MVR', to: 'INR', amount: 5000 },
  { from: 'USD', to: 'INR', amount: 1000 },
  { from: 'AED', to: 'PHP', amount: 2000 },
];

// Whitelist of platforms to display.
// logic: If AI result matches 'keywords', use this 'name' and 'url'.
export const SUPPORTED_PLATFORMS = [
  { 
    id: 'wise', 
    name: 'Wise', 
    keywords: ['wise', 'transferwise'], 
    url: 'https://wise.com' // Replace with your actual affiliate link
  },
  { 
    id: 'remitly', 
    name: 'Remitly', 
    keywords: ['remitly'], 
    url: 'https://remitly.com' // Replace with your actual affiliate link
  },
  { 
    id: 'western_union', 
    name: 'Western Union', 
    keywords: ['western union', 'wu'], 
    url: 'https://westernunion.com' // Replace with your actual affiliate link
  },
  { 
    id: 'revolut', 
    name: 'Revolut', 
    keywords: ['revolut'], 
    url: 'https://revolut.com' // Replace with your actual affiliate link
  },
  { 
    id: 'moneygram', 
    name: 'MoneyGram', 
    keywords: ['moneygram'], 
    url: 'https://moneygram.com' // Replace with your actual affiliate link
  },
  { 
    id: 'xe', 
    name: 'XE', 
    keywords: ['xe', 'xe money transfer'], 
    url: 'https://xe.com' // Replace with your actual affiliate link
  },
  {
    id: 'instarem',
    name: 'Instarem',
    keywords: ['instarem'],
    url: 'https://instarem.com'
  },
   {
    id: 'worldremit',
    name: 'WorldRemit',
    keywords: ['worldremit'],
    url: 'https://worldremit.com'
  }
];