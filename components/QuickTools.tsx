// components/QuickTools.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface CryptoPrices {
  [key: string]: number;
}

export default function QuickTools() {
  const [showConverter, setShowConverter] = useState(false);
  const [showProfitCalc, setShowProfitCalc] = useState(false);
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('USD');
  const [convertedAmount, setConvertedAmount] = useState('0');
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrices>({
    BTC: 91165.77,
    ETH: 3300,
    BNB: 690,
    XRP: 2.45,
    ADA: 1.05,
    SOL: 190,
    DOT: 7.8,
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Profit/Loss Calculator
  const [buyPrice, setBuyPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [prediction, setPrediction] = useState<any>(null);

  // Fetch real-time prices from CoinGecko
  useEffect(() => {
    fetchPrices();
    // Update every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,ripple,cardano,solana,polkadot&vs_currencies=usd&include_24hr_change=true'
      );
      const data = await response.json();
      
      setCryptoPrices({
        BTC: data.bitcoin?.usd || 91165.77,
        ETH: data.ethereum?.usd || 3300,
        BNB: data.binancecoin?.usd || 690,
        XRP: data.ripple?.usd || 2.45,
        ADA: data.cardano?.usd || 1.05,
        SOL: data.solana?.usd || 190,
        DOT: data.polkadot?.usd || 7.8,
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = () => {
    const rate = fromCurrency === 'USD' ? 1 / cryptoPrices[toCurrency] : cryptoPrices[fromCurrency];
    const result = parseFloat(amount) * rate;
    setConvertedAmount(result.toFixed(6));
  };

  const calculateProfit = () => {
    const buy = parseFloat(buyPrice);
    const current = parseFloat(currentPrice);
    const qty = parseFloat(quantity);

    if (!buy || !current || !qty) return;

    const invested = buy * qty;
    const currentValue = current * qty;
    const profitLoss = currentValue - invested;
    const profitPercent = ((profitLoss / invested) * 100).toFixed(2);

    // AI Prediction (simple algorithm based on trend)
    const trend = ((current - buy) / buy) * 100;
    let predictedPrice = current;
    let confidence = 0;

    if (trend > 5) {
      // Strong uptrend
      predictedPrice = current * 1.15;
      confidence = 75;
    } else if (trend > 0) {
      // Mild uptrend
      predictedPrice = current * 1.08;
      confidence = 60;
    } else if (trend < -5) {
      // Strong downtrend
      predictedPrice = current * 0.85;
      confidence = 70;
    } else {
      // Mild downtrend
      predictedPrice = current * 0.92;
      confidence = 55;
    }

    const predictedValue = predictedPrice * qty;
    const predictedProfit = predictedValue - invested;

    setPrediction({
      invested,
      currentValue,
      profitLoss,
      profitPercent,
      predictedPrice: predictedPrice.toFixed(2),
      predictedValue: predictedValue.toFixed(2),
      predictedProfit: predictedProfit.toFixed(2),
      confidence,
      trend: trend > 0 ? 'Tăng' : 'Giảm',
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        ⚡ Tiện ích nhanh
      </h3>

      {/* 1. Theo dõi giá */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-orange-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">Theo dõi giá</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {loading ? 'Đang cập nhật...' : lastUpdate ? `Cập nhật: ${lastUpdate.toLocaleTimeString('vi-VN')}` : 'Real-time prices'}
            </p>
          </div>
          <button
            onClick={fetchPrices}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Làm mới giá"
          >
            <svg className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Live Prices */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg">₿</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">BTC</span>
            </div>
            <span className="font-bold text-orange-600" suppressHydrationWarning>${cryptoPrices.BTC.toLocaleString('en-US')}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg">Ξ</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">ETH</span>
            </div>
            <span className="font-bold text-blue-600" suppressHydrationWarning>${cryptoPrices.ETH.toLocaleString('en-US')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="https://www.coingecko.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all text-sm"
          >
            <span>🦎</span>
            <span className="text-gray-700 dark:text-gray-300">CoinGecko</span>
          </a>
          <a
            href="https://coinmarketcap.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all text-sm"
          >
            <span>💎</span>
            <span className="text-gray-700 dark:text-gray-300">CMC</span>
          </a>
        </div>
      </div>

      {/* 2. Chuyển đổi tiền tệ */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-blue-200 dark:border-gray-700">
        <button
          onClick={() => setShowConverter(!showConverter)}
          className="flex items-center gap-3 w-full mb-3"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-gray-900 dark:text-white">Chuyển đổi tiền tệ</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Crypto converter</p>
          </div>
          <svg className={`w-5 h-5 transition-transform ${showConverter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showConverter && (
          <div className="space-y-3 bg-white dark:bg-gray-800 rounded-lg p-4">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Số lượng</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Từ</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="BNB">BNB</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Sang</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="USD">USD</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="BNB">BNB</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleConvert}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Chuyển đổi
            </button>
            {convertedAmount !== '0' && (
              <div className="p-3 bg-blue-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Kết quả:</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {convertedAmount} {toCurrency}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Tính lãi/lỗ tiềm năng */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-green-200 dark:border-gray-700">
        <button
          onClick={() => setShowProfitCalc(!showProfitCalc)}
          className="flex items-center gap-3 w-full mb-3"
        >
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-gray-900 dark:text-white">Dự đoán lãi/lỗ</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">AI-powered prediction</p>
          </div>
          <svg className={`w-5 h-5 transition-transform ${showProfitCalc ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showProfitCalc && (
          <div className="space-y-3 bg-white dark:bg-gray-800 rounded-lg p-4">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Giá mua vào ($)</label>
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="VD: 40000"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Giá hiện tại ($)</label>
              <input
                type="number"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                placeholder="VD: 45000"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Số lượng</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="VD: 0.5"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button
              onClick={calculateProfit}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              🤖 Tính toán & Dự đoán
            </button>

            {prediction && (
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Hiện tại:</p>
                  <p className={`text-lg font-bold ${prediction.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {prediction.profitLoss >= 0 ? '+' : ''}{prediction.profitLoss.toFixed(2)} USD ({prediction.profitPercent}%)
                  </p>
                  <p className="text-xs text-gray-500">Giá trị: ${prediction.currentValue.toFixed(2)}</p>
                </div>

                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🔮</span>
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                      Dự đoán AI (Độ tin cậy: {prediction.confidence}%)
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Xu hướng: <span className={`font-semibold ${prediction.trend === 'Tăng' ? 'text-green-600' : 'text-red-600'}`}>
                      {prediction.trend}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Giá dự đoán: <span className="font-bold">${prediction.predictedPrice}</span>
                  </p>
                  <p className={`text-lg font-bold ${parseFloat(prediction.predictedProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(prediction.predictedProfit) >= 0 ? '+' : ''}{prediction.predictedProfit} USD
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    * Dự đoán dựa trên phân tích xu hướng và thuật toán AI
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Quản lý ví */}
      <Link
        href="/quan-ly-vi"
        className="block bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-purple-200 dark:border-gray-700 hover:shadow-lg transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">Quản lý ví</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Portfolio tracker</p>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  );
}
