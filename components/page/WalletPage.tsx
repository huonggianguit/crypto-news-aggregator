// components/page/WalletPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdraw';
  asset: string;
  amount: number;
  price: number;
  total: number;
  date: string;
  exchange?: string;
}

interface Portfolio {
  asset: string;
  symbol: string;
  amount: number;
  buyPrice: number;
  currentPrice: number;
  invested: number;
  currentValue: number;
  profitLoss: number;
  profitPercent: number;
  exchange?: string;
}

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'exchanges'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [connectedExchanges, setConnectedExchanges] = useState<string[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    type: 'buy' as 'buy' | 'sell' | 'deposit' | 'withdraw',
    asset: 'BTC',
    amount: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    exchange: '',
  });

  // Real-time prices from CoinGecko API
  const [currentPrices, setCurrentPrices] = useState<any>({
    BTC: 91165.77,
    ETH: 3200,
    BNB: 320,
    XRP: 0.65,
    ADA: 0.45,
    SOL: 98,
    DOT: 7.2,
  });
  const [pricesLoading, setPricesLoading] = useState(true);

  // Fetch real-time prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,ripple,cardano,solana,polkadot&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await response.json();
        
        setCurrentPrices({
          BTC: data.bitcoin?.usd || 91165.77,
          ETH: data.ethereum?.usd || 3200,
          BNB: data.binancecoin?.usd || 320,
          XRP: data.ripple?.usd || 0.65,
          ADA: data.cardano?.usd || 0.45,
          SOL: data.solana?.usd || 98,
          DOT: data.polkadot?.usd || 7.2,
        });
        setPricesLoading(false);
      } catch (error) {
        console.error('Error fetching prices:', error);
        setPricesLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load from localStorage
    const savedTransactions = localStorage.getItem('crypto_transactions');
    const savedExchanges = localStorage.getItem('connected_exchanges');
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedExchanges) {
      setConnectedExchanges(JSON.parse(savedExchanges));
    }
  }, []);

  useEffect(() => {
    // Calculate portfolio from transactions
    const portfolioMap = new Map<string, any>();

    transactions.forEach((tx) => {
      if (!portfolioMap.has(tx.asset)) {
        portfolioMap.set(tx.asset, {
          asset: tx.asset,
          symbol: tx.asset,
          amount: 0,
          invested: 0,
          transactions: [],
        });
      }

      const item = portfolioMap.get(tx.asset);
      
      if (tx.type === 'buy' || tx.type === 'deposit') {
        item.amount += tx.amount;
        item.invested += tx.total;
      } else if (tx.type === 'sell' || tx.type === 'withdraw') {
        item.amount -= tx.amount;
        item.invested -= tx.total;
      }
      
      item.transactions.push(tx);
    });

    const portfolioArray: Portfolio[] = Array.from(portfolioMap.values())
      .filter((item) => item.amount > 0)
      .map((item) => {
        const currentPrice = currentPrices[item.asset] || 0;
        const buyPrice = item.invested / item.amount;
        const currentValue = item.amount * currentPrice;
        const profitLoss = currentValue - item.invested;
        const profitPercent = (profitLoss / item.invested) * 100;

        return {
          ...item,
          buyPrice,
          currentPrice,
          currentValue,
          profitLoss,
          profitPercent,
        };
      });

    setPortfolio(portfolioArray);
  }, [transactions]);

  const handleAddTransaction = () => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: formData.type,
      asset: formData.asset,
      amount: parseFloat(formData.amount),
      price: parseFloat(formData.price),
      total: parseFloat(formData.amount) * parseFloat(formData.price),
      date: formData.date,
      exchange: formData.exchange,
    };

    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem('crypto_transactions', JSON.stringify(updatedTransactions));

    // Reset form
    setFormData({
      type: 'buy',
      asset: 'BTC',
      amount: '',
      price: '',
      date: new Date().toISOString().split('T')[0],
      exchange: '',
    });
    setShowAddModal(false);
  };

  const connectExchange = (exchange: string) => {
    if (!connectedExchanges.includes(exchange)) {
      const updated = [...connectedExchanges, exchange];
      setConnectedExchanges(updated);
      localStorage.setItem('connected_exchanges', JSON.stringify(updated));
      alert(`Đã kết nối với ${exchange}! (Demo mode)`);
    }
  };

  const disconnectExchange = (exchange: string) => {
    const updated = connectedExchanges.filter((e) => e !== exchange);
    setConnectedExchanges(updated);
    localStorage.setItem('connected_exchanges', JSON.stringify(updated));
  };

  const totalInvested = portfolio.reduce((sum, item) => sum + item.invested, 0);
  const totalValue = portfolio.reduce((sum, item) => sum + item.currentValue, 0);
  const totalProfit = totalValue - totalInvested;
  const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const income = transactions
    .filter((tx) => tx.type === 'sell')
    .reduce((sum, tx) => sum + tx.total, 0);

  const expense = transactions
    .filter((tx) => tx.type === 'buy')
    .reduce((sum, tx) => sum + tx.total, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/" className="text-sm opacity-80 hover:opacity-100 flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại
              </Link>
              <h1 className="text-3xl font-bold">💼 Quản lý ví Crypto</h1>
              <p className="text-sm opacity-90 mt-1">Theo dõi danh mục đầu tư của bạn</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm giao dịch
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm opacity-80">Tổng đầu tư</p>
              <p className="text-2xl font-bold">${totalInvested.toFixed(2)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm opacity-80">Giá trị hiện tại</p>
              <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm opacity-80">Lãi/Lỗ</p>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} USD
              </p>
              <p className="text-sm opacity-80">({totalProfitPercent.toFixed(2)}%)</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm opacity-80">Số tài sản</p>
              <p className="text-2xl font-bold">{portfolio.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              📊 Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'transactions'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              📝 Giao dịch
            </button>
            <button
              onClick={() => setActiveTab('exchanges')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'exchanges'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              🔗 Kết nối sàn
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Thu Chi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tổng thu (Bán)</p>
                    <p className="text-2xl font-bold text-green-600">${income.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Từ {transactions.filter(t => t.type === 'sell').length} giao dịch bán</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tổng chi (Mua)</p>
                    <p className="text-2xl font-bold text-red-600">${expense.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Từ {transactions.filter(t => t.type === 'buy').length} giao dịch mua</div>
              </div>
            </div>

            {/* Portfolio */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Danh mục đầu tư</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tài sản</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Số lượng</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Giá mua TB</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Giá hiện tại</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Đã đầu tư</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Giá trị hiện tại</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Lãi/Lỗ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {portfolio.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-3">
                            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p>Chưa có giao dịch nào</p>
                            <button
                              onClick={() => setShowAddModal(true)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                              Thêm giao dịch đầu tiên
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      portfolio.map((item) => (
                        <tr key={item.asset} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm font-bold">
                                {item.symbol}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{item.asset}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{item.amount.toFixed(6)}</td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">${item.buyPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">${item.currentPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">${item.invested.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">${item.currentValue.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className={`font-semibold ${item.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.profitLoss >= 0 ? '+' : ''}{item.profitLoss.toFixed(2)} USD
                            </div>
                            <div className={`text-xs ${item.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              ({item.profitPercent.toFixed(2)}%)
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lịch sử giao dịch</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ngày</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tài sản</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Số lượng</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Giá</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tổng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Sàn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        Chưa có giao dịch nào
                      </td>
                    </tr>
                  ) : (
                    [...transactions].reverse().map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {new Date(tx.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            tx.type === 'buy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            tx.type === 'sell' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            tx.type === 'deposit' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {tx.type === 'buy' ? 'Mua' : tx.type === 'sell' ? 'Bán' : tx.type === 'deposit' ? 'Nạp' : 'Rút'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{tx.asset}</td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{tx.amount}</td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white">${tx.price}</td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">${tx.total.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{tx.exchange || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Exchanges Tab */}
        {activeTab === 'exchanges' && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Kết nối với sàn giao dịch</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Kết nối ví của bạn với các sàn giao dịch lớn để tự động đồng bộ giao dịch. (Demo mode - chỉ lưu local)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Binance', logo: '🟡', desc: 'Sàn giao dịch lớn nhất thế giới' },
                { name: 'Coinbase', logo: '🔵', desc: 'Sàn uy tín tại Mỹ' },
                { name: 'Kraken', logo: '🟣', desc: 'Sàn lâu đời và bảo mật' },
                { name: 'Huobi', logo: '🔴', desc: 'Sàn hàng đầu châu Á' },
                { name: 'KuCoin', logo: '🟢', desc: 'The People\'s Exchange' },
                { name: 'Gate.io', logo: '🟠', desc: 'Nhiều coin altcoin' },
              ].map((exchange) => {
                const isConnected = connectedExchanges.includes(exchange.name);
                
                return (
                  <div
                    key={exchange.name}
                    className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 transition-all ${
                      isConnected
                        ? 'border-green-500 dark:border-green-600'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{exchange.logo}</div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{exchange.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{exchange.desc}</p>
                        </div>
                      </div>
                      {isConnected && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full">
                          Đã kết nối
                        </span>
                      )}
                    </div>
                    
                    {isConnected ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          API Key: ••••••••••••
                        </div>
                        <button
                          onClick={() => disconnectExchange(exchange.name)}
                          className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          Ngắt kết nối
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => connectExchange(exchange.name)}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Kết nối
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Thêm giao dịch</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loại giao dịch
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="buy">Mua</option>
                  <option value="sell">Bán</option>
                  <option value="deposit">Nạp</option>
                  <option value="withdraw">Rút</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tài sản
                </label>
                <select
                  value={formData.asset}
                  onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="BNB">Binance Coin (BNB)</option>
                  <option value="XRP">Ripple (XRP)</option>
                  <option value="ADA">Cardano (ADA)</option>
                  <option value="SOL">Solana (SOL)</option>
                  <option value="DOT">Polkadot (DOT)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Số lượng
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Giá (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ngày
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sàn (tùy chọn)
                </label>
                <input
                  type="text"
                  value={formData.exchange}
                  onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="VD: Binance"
                />
              </div>

              {formData.amount && formData.price && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tổng giá trị:</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ${(parseFloat(formData.amount) * parseFloat(formData.price)).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddTransaction}
                  disabled={!formData.amount || !formData.price}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
