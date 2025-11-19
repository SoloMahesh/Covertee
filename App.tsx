import React, { useState, useCallback, useMemo, useRef } from 'react';
import { CurrencyInput } from './components/CurrencyInput';
import { PlatformCard } from './components/PlatformCard';
import { AdminDashboard } from './components/AdminDashboard';
import { ProcessingAnimation } from './components/ProcessingAnimation';
import { fetchComparisonData } from './services/geminiService';
import { trackClick } from './services/storageService';
import { POPULAR_CURRENCIES, SAMPLE_PROMPTS, SUPPORTED_PLATFORMS } from './constants';
import { ComparisonResult, LoadingState, SortOption } from './types';

const App: React.FC = () => {
  // State
  const [view, setView] = useState<'app' | 'admin'>('app');
  const [sourceAmount, setSourceAmount] = useState<number>(1000);
  const [sourceCurrency, setSourceCurrency] = useState<string>('MVR');
  const [targetCurrency, setTargetCurrency] = useState<string>('INR');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  // Sorting State
  const [sortOption, setSortOption] = useState<SortOption>('value');

  // Helpers
  const swapCurrencies = () => {
    setSourceCurrency(targetCurrency);
    setTargetCurrency(sourceCurrency);
    setResult(null);
  };

  const handleCompare = useCallback(async () => {
    if (!sourceAmount || sourceAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    
    setLoadingState('searching');
    setError(null);
    setResult(null); // Clear previous results to show animation
    
    // Scroll to processing area immediately
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      const data = await fetchComparisonData(sourceAmount, sourceCurrency, targetCurrency);
      
      // Filter and Enrich Platforms based on SUPPORTED_PLATFORMS whitelist
      const allowedPlatforms = data.platforms
        .filter(p => {
          // Check if the platform returned by AI matches one of our allowed keywords
          return SUPPORTED_PLATFORMS.some(sp => 
            sp.keywords.some(k => p.name.toLowerCase().includes(k))
          );
        })
        .map(p => {
          // Find the configuration for this platform to get the referral link
          const config = SUPPORTED_PLATFORMS.find(sp => 
            sp.keywords.some(k => p.name.toLowerCase().includes(k))
          );
          
          return {
              ...p,
              name: config?.name || p.name, // Normalize name (e.g., "Wise (TransferWise)" -> "Wise")
              link: config?.url || p.link // Force use of our referral link
          };
        });

      if (allowedPlatforms.length === 0) {
        setError(`No supported platforms found for ${sourceCurrency} to ${targetCurrency} at this moment. Try a popular corridor like USD to INR.`);
        setLoadingState('error');
        return;
      }

      setResult({
        ...data,
        platforms: allowedPlatforms
      });
      setLoadingState('complete');
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to fetch comparison data. Please check your connection and try again.");
      setLoadingState('error');
    }
  }, [sourceAmount, sourceCurrency, targetCurrency]);

  const applySample = (sample: { from: string, to: string, amount: number }) => {
    setSourceCurrency(sample.from);
    setTargetCurrency(sample.to);
    setSourceAmount(sample.amount);
  };

  const handleTrackClick = (platformName: string) => {
    trackClick(platformName);
  };

  // Derived State: Sorted Platforms
  const sortedPlatforms = useMemo(() => {
    if (!result) return [];
    const items = [...result.platforms];
    
    switch (sortOption) {
        case 'value':
            return items.sort((a, b) => b.totalReceiveAmount - a.totalReceiveAmount);
        case 'fee':
            return items.sort((a, b) => a.transferFee - b.transferFee);
        case 'speed':
            // Heuristic: put isFastest first, then preserve original order (which is usually decent)
            return items.sort((a, b) => (b.isFastest ? 1 : 0) - (a.isFastest ? 1 : 0));
        default:
            return items;
    }
  }, [result, sortOption]);

  if (view === 'admin') {
    return <AdminDashboard onExit={() => setView('app')} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
                <div className="bg-brand-500 text-white p-1.5 rounded-lg">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                   </svg>
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">Remit<span className="text-brand-600">Wise</span></span>
            </div>
            <div className="flex gap-4 items-center">
                <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
                    <a href="#" className="hover:text-brand-600 transition-colors">Personal</a>
                    <a href="#" className="hover:text-brand-600 transition-colors">Business</a>
                </div>
                {/* Admin button hidden as requested */}
                {/* <button 
                    onClick={() => setView('admin')}
                    className="text-xs font-bold bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-700 transition-colors"
                >
                    Admin
                </button> */}
            </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center pt-10 pb-20 px-4 sm:px-6">
        
        {/* Hero / Input Section */}
        <div className="w-full max-w-xl space-y-6">
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                    Compare & Send Money Abroad
                </h1>
                <p className="text-slate-500">
                    Real-time exchange rates from {sourceCurrency} to {targetCurrency}. <br className="hidden sm:block"/>
                    Find the lowest fees and best referrals.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100 relative">
                <div className="space-y-4 relative">
                    <CurrencyInput 
                        label="You Send"
                        amount={sourceAmount}
                        currency={sourceCurrency}
                        onAmountChange={setSourceAmount}
                        onCurrencyChange={setSourceCurrency}
                        currencies={POPULAR_CURRENCIES}
                    />
                    
                    {/* Swap Button */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <button 
                            onClick={swapCurrencies}
                            className="bg-white p-2 rounded-full shadow border border-slate-200 text-brand-600 hover:text-brand-700 hover:bg-slate-50 transition-all active:scale-95"
                            aria-label="Swap currencies"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                           </svg>
                        </button>
                    </div>

                    <CurrencyInput 
                        label="Receiver Gets (Estimated)"
                        amount={result?.platforms.find(p => p.isBestValue)?.totalReceiveAmount || 0}
                        currency={targetCurrency}
                        onCurrencyChange={setTargetCurrency}
                        currencies={POPULAR_CURRENCIES}
                        readOnlyAmount
                    />
                </div>

                <button
                    onClick={handleCompare}
                    disabled={loadingState === 'searching'}
                    className="mt-6 w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-brand-600/30 transition-all active:scale-[0.98] text-lg flex justify-center items-center gap-2"
                >
                    {loadingState === 'searching' ? 'Comparison in progress...' : 'Compare Prices'}
                </button>

                {/* Quick Links */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {SAMPLE_PROMPTS.map((p, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => applySample(p)}
                            className="text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-full transition-colors"
                        >
                            {p.from} → {p.to}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Results Area (Animation or Data) */}
        <div ref={resultsRef} className="w-full flex flex-col items-center scroll-mt-24">
            
            {/* Error Message */}
            {error && (
                 <div className="mt-8 w-full max-w-xl bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-xl text-center animate-fade-in">
                    <p className="font-semibold">Oops!</p>
                    <p className="text-sm">{error}</p>
                 </div>
            )}

            {/* Loading Animation */}
            {loadingState === 'searching' && (
                <div className="w-full max-w-xl mt-12">
                    <ProcessingAnimation />
                </div>
            )}

            {/* Results Section */}
            {result && loadingState === 'complete' && (
                <div className="w-full max-w-3xl mt-12 space-y-8 animate-fade-in-up">
                    
                    {/* AI Analysis & Grounding */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded text-white backdrop-blur-sm">Market Analysis</span>
                                <span className="text-slate-400 text-xs">Updated: {result.timestamp}</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">
                                1 {sourceCurrency} ≈ {result.marketRate.toFixed(4)} {targetCurrency}
                            </h2>
                            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                                {result.analysis}
                            </p>
                            
                            {result.groundingUrls && result.groundingUrls.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-xs text-slate-400 mb-2">Sources:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.groundingUrls.slice(0, 3).map((url, i) => (
                                            <a 
                                              key={i} 
                                              href={url} 
                                              target="_blank" 
                                              rel="noreferrer" 
                                              className="text-xs text-blue-300 hover:text-blue-200 underline truncate max-w-[200px]"
                                            >
                                                {new URL(url).hostname}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Decor */}
                        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    </div>

                    {/* Sorting & List Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 pb-2 border-b border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800">Available Platforms</h3>
                        
                        <div className="bg-white p-1 rounded-lg border border-slate-200 flex text-sm font-medium">
                            <button 
                                onClick={() => setSortOption('value')}
                                className={`px-3 py-1.5 rounded-md transition-all ${sortOption === 'value' ? 'bg-brand-100 text-brand-700 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Best Value
                            </button>
                            <button 
                                 onClick={() => setSortOption('speed')}
                                 className={`px-3 py-1.5 rounded-md transition-all ${sortOption === 'speed' ? 'bg-brand-100 text-brand-700 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Fastest
                            </button>
                            <button 
                                 onClick={() => setSortOption('fee')}
                                 className={`px-3 py-1.5 rounded-md transition-all ${sortOption === 'fee' ? 'bg-brand-100 text-brand-700 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Lowest Fee
                            </button>
                        </div>
                    </div>

                    {/* Platform List */}
                    <div className="space-y-4">
                        {sortedPlatforms.map((platform, index) => (
                            <PlatformCard 
                                key={`${platform.name}-${index}`} 
                                platform={platform} 
                                sourceAmount={sourceAmount}
                                sourceCurrency={sourceCurrency}
                                onTrackClick={handleTrackClick}
                            />
                        ))}
                    </div>
                    
                    <div className="text-center text-xs text-slate-400 mt-8">
                        <p>Disclaimer: Exchange rates are volatile. We may earn a commission from links.</p>
                    </div>
                </div>
            )}
        </div>

      </main>
    </div>
  );
};

export default App;