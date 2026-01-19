// components/page/KnowledgeToolsPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface LearningResource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'course' | 'tool' | 'news' | 'community' | 'book' | 'video' | 'podcast' | 'platform';
  level: 'beginner' | 'intermediate' | 'advanced';
  isPremium: boolean;
  rating: number;
  icon: string;
  color: string;
}

export default function KnowledgeToolsPage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const resourceTypes = [
    { id: 'all', name: 'Tất cả', icon: '🌟', count: 0 },
    { id: 'course', name: 'Khóa học', icon: '📚', count: 0 },
    { id: 'tool', name: 'Công cụ', icon: '🛠️', count: 0 },
    { id: 'news', name: 'Tin tức', icon: '📰', count: 0 },
    { id: 'community', name: 'Cộng đồng', icon: '👥', count: 0 },
    { id: 'video', name: 'Video', icon: '🎥', count: 0 },
    { id: 'podcast', name: 'Podcast', icon: '🎙️', count: 0 },
    { id: 'platform', name: 'Nền tảng', icon: '💼', count: 0 }
  ];

  const resources: LearningResource[] = [
    // Advanced Courses
    {
      id: '1',
      title: 'Coursera - Blockchain Specialization',
      description: 'Chương trình chuyên sâu về blockchain từ University of Buffalo với chứng chỉ',
      url: 'https://www.coursera.org/specializations/blockchain',
      type: 'course',
      level: 'advanced',
      isPremium: true,
      rating: 4.8,
      icon: '🎓',
      color: 'blue'
    },
    {
      id: '2',
      title: 'Udemy - Ethereum & Solidity Complete Guide',
      description: 'Khóa học lập trình smart contract với Solidity từ cơ bản đến nâng cao',
      url: 'https://www.udemy.com/topic/ethereum/',
      type: 'course',
      level: 'intermediate',
      isPremium: true,
      rating: 4.7,
      icon: '⚡',
      color: 'purple'
    },
    {
      id: '3',
      title: 'Buildspace - Web3 Development',
      description: 'Học xây dựng dApp thực tế với cộng đồng developer năng động',
      url: 'https://buildspace.so/',
      type: 'course',
      level: 'intermediate',
      isPremium: false,
      rating: 4.9,
      icon: '🏗️',
      color: 'green'
    },
    {
      id: '4',
      title: 'CryptoZombies',
      description: 'Học Solidity qua game tương tác - Tạo game crypto của riêng bạn',
      url: 'https://cryptozombies.io/',
      type: 'course',
      level: 'beginner',
      isPremium: false,
      rating: 4.8,
      icon: '🧟',
      color: 'orange'
    },
    {
      id: '5',
      title: 'Alchemy University',
      description: 'Bootcamp miễn phí về Web3 development với mentor hỗ trợ',
      url: 'https://university.alchemy.com/',
      type: 'course',
      level: 'intermediate',
      isPremium: false,
      rating: 4.9,
      icon: '🔮',
      color: 'cyan'
    },
    {
      id: '6',
      title: 'LinkedIn Learning - Crypto Trading',
      description: 'Khóa học giao dịch crypto chuyên nghiệp với chứng chỉ LinkedIn',
      url: 'https://www.linkedin.com/learning/topics/cryptocurrency',
      type: 'course',
      level: 'intermediate',
      isPremium: true,
      rating: 4.5,
      icon: '💼',
      color: 'blue'
    },

    // Tools & Platforms
    {
      id: '7',
      title: 'DeFi Llama',
      description: 'Dashboard TVL và analytics cho tất cả các protocol DeFi',
      url: 'https://defillama.com/',
      type: 'tool',
      level: 'intermediate',
      isPremium: false,
      rating: 4.9,
      icon: '🦙',
      color: 'green'
    },
    {
      id: '8',
      title: 'Dune Analytics',
      description: 'Nền tảng phân tích blockchain với SQL queries và dashboards',
      url: 'https://dune.com/',
      type: 'tool',
      level: 'advanced',
      isPremium: false,
      rating: 4.8,
      icon: '📊',
      color: 'purple'
    },
    {
      id: '9',
      title: 'Etherscan',
      description: 'Block explorer và analytics platform cho Ethereum',
      url: 'https://etherscan.io/',
      type: 'tool',
      level: 'beginner',
      isPremium: false,
      rating: 4.9,
      icon: '🔍',
      color: 'blue'
    },
    {
      id: '10',
      title: 'Nansen',
      description: 'Blockchain analytics với smart money tracking và wallet labels',
      url: 'https://www.nansen.ai/',
      type: 'tool',
      level: 'advanced',
      isPremium: true,
      rating: 4.7,
      icon: '🎯',
      color: 'red'
    },
    {
      id: '11',
      title: 'Remix IDE',
      description: 'IDE trực tuyến để code, test và deploy smart contracts',
      url: 'https://remix.ethereum.org/',
      type: 'tool',
      level: 'intermediate',
      isPremium: false,
      rating: 4.8,
      icon: '💻',
      color: 'cyan'
    },
    {
      id: '12',
      title: 'Hardhat',
      description: 'Development environment cho Ethereum smart contracts',
      url: 'https://hardhat.org/',
      type: 'tool',
      level: 'advanced',
      isPremium: false,
      rating: 4.9,
      icon: '⛑️',
      color: 'yellow'
    },
    {
      id: '13',
      title: 'CoinGecko Terminal',
      description: 'Professional crypto analytics và real-time market data',
      url: 'https://www.coingecko.com/en/categories',
      type: 'tool',
      level: 'intermediate',
      isPremium: false,
      rating: 4.7,
      icon: '🦎',
      color: 'green'
    },
    {
      id: '14',
      title: 'Token Terminal',
      description: 'Financial metrics và fundamentals cho crypto protocols',
      url: 'https://tokenterminal.com/',
      type: 'tool',
      level: 'advanced',
      isPremium: false,
      rating: 4.8,
      icon: '📈',
      color: 'blue'
    },

    // News & Media
    {
      id: '15',
      title: 'CoinDesk',
      description: 'Tin tức crypto hàng đầu với phân tích chuyên sâu',
      url: 'https://www.coindesk.com/',
      type: 'news',
      level: 'beginner',
      isPremium: false,
      rating: 4.6,
      icon: '📰',
      color: 'orange'
    },
    {
      id: '16',
      title: 'The Block',
      description: 'Research và news về crypto markets và technology',
      url: 'https://www.theblock.co/',
      type: 'news',
      level: 'intermediate',
      isPremium: true,
      rating: 4.8,
      icon: '🧊',
      color: 'blue'
    },
    {
      id: '17',
      title: 'Decrypt',
      description: 'Tin tức crypto dễ hiểu cho người mới bắt đầu',
      url: 'https://decrypt.co/',
      type: 'news',
      level: 'beginner',
      isPremium: false,
      rating: 4.5,
      icon: '🔓',
      color: 'purple'
    },
    {
      id: '18',
      title: 'CryptoSlate',
      description: 'News, research và directory cho crypto projects',
      url: 'https://cryptoslate.com/',
      type: 'news',
      level: 'intermediate',
      isPremium: false,
      rating: 4.6,
      icon: '📱',
      color: 'cyan'
    },
    {
      id: '19',
      title: 'Messari',
      description: 'Crypto research và market intelligence platform',
      url: 'https://messari.io/',
      type: 'news',
      level: 'advanced',
      isPremium: true,
      rating: 4.9,
      icon: '📊',
      color: 'red'
    },

    // Communities
    {
      id: '20',
      title: 'Reddit - r/cryptocurrency',
      description: 'Cộng đồng crypto lớn nhất với 7M+ thành viên',
      url: 'https://www.reddit.com/r/CryptoCurrency/',
      type: 'community',
      level: 'beginner',
      isPremium: false,
      rating: 4.5,
      icon: '👽',
      color: 'orange'
    },
    {
      id: '21',
      title: 'Discord - DeFi Community',
      description: 'Kênh Discord để thảo luận về DeFi protocols và strategies',
      url: 'https://discord.com/',
      type: 'community',
      level: 'intermediate',
      isPremium: false,
      rating: 4.6,
      icon: '💬',
      color: 'purple'
    },
    {
      id: '22',
      title: 'Twitter Crypto Community',
      description: 'Follow các crypto influencers và alpha hunters',
      url: 'https://twitter.com/search?q=%23crypto',
      type: 'community',
      level: 'intermediate',
      isPremium: false,
      rating: 4.7,
      icon: '🐦',
      color: 'blue'
    },
    {
      id: '23',
      title: 'Telegram Crypto Channels',
      description: 'Nhóm Telegram để nhận tin tức và signals nhanh nhất',
      url: 'https://telegram.org/',
      type: 'community',
      level: 'intermediate',
      isPremium: false,
      rating: 4.5,
      icon: '✈️',
      color: 'cyan'
    },
    {
      id: '24',
      title: 'Stack Exchange - Bitcoin',
      description: 'Q&A platform cho developers và technical questions',
      url: 'https://bitcoin.stackexchange.com/',
      type: 'community',
      level: 'advanced',
      isPremium: false,
      rating: 4.8,
      icon: '❓',
      color: 'orange'
    },
    {
      id: '25',
      title: 'BitcoinTalk Forum',
      description: 'Forum crypto lâu đời nhất, nơi Bitcoin được công bố',
      url: 'https://bitcointalk.org/',
      type: 'community',
      level: 'intermediate',
      isPremium: false,
      rating: 4.4,
      icon: '💬',
      color: 'yellow'
    },

    // Video Content
    {
      id: '26',
      title: 'Whiteboard Crypto',
      description: 'Giải thích các khái niệm crypto phức tạp một cách đơn giản',
      url: 'https://www.youtube.com/c/WhiteboardCrypto',
      type: 'video',
      level: 'beginner',
      isPremium: false,
      rating: 4.8,
      icon: '📺',
      color: 'red'
    },
    {
      id: '27',
      title: 'Coin Bureau',
      description: 'Phân tích crypto projects và market trends chi tiết',
      url: 'https://www.youtube.com/c/CoinBureau',
      type: 'video',
      level: 'intermediate',
      isPremium: false,
      rating: 4.7,
      icon: '🎬',
      color: 'blue'
    },
    {
      id: '28',
      title: 'Finematics',
      description: 'DeFi explained với animations chất lượng cao',
      url: 'https://www.youtube.com/c/Finematics',
      type: 'video',
      level: 'intermediate',
      isPremium: false,
      rating: 4.9,
      icon: '🎨',
      color: 'purple'
    },
    {
      id: '29',
      title: 'Benjamin Cowen',
      description: 'Technical analysis và data-driven market insights',
      url: 'https://www.youtube.com/c/BenjaminCowen',
      type: 'video',
      level: 'advanced',
      isPremium: false,
      rating: 4.6,
      icon: '📉',
      color: 'green'
    },
    {
      id: '30',
      title: 'Bankless',
      description: 'Podcast và videos về DeFi, NFTs và Web3 culture',
      url: 'https://www.youtube.com/c/Bankless',
      type: 'video',
      level: 'intermediate',
      isPremium: false,
      rating: 4.8,
      icon: '🏦',
      color: 'cyan'
    },

    // Podcasts
    {
      id: '31',
      title: 'Unchained Podcast',
      description: 'Interviews với crypto leaders và innovators',
      url: 'https://unchainedpodcast.com/',
      type: 'podcast',
      level: 'intermediate',
      isPremium: false,
      rating: 4.8,
      icon: '🎙️',
      color: 'purple'
    },
    {
      id: '32',
      title: 'The Pomp Podcast',
      description: 'Anthony Pompliano phỏng vấn các CEO và investors',
      url: 'https://www.anthonypompliano.com/podcast/',
      type: 'podcast',
      level: 'intermediate',
      isPremium: false,
      rating: 4.7,
      icon: '🎧',
      color: 'orange'
    },
    {
      id: '33',
      title: 'What Bitcoin Did',
      description: 'Peter McCormack khám phá Bitcoin và cryptocurrency',
      url: 'https://www.whatbitcoindid.com/',
      type: 'podcast',
      level: 'beginner',
      isPremium: false,
      rating: 4.6,
      icon: '₿',
      color: 'yellow'
    },
    {
      id: '34',
      title: 'Epicenter Podcast',
      description: 'Deep dives vào blockchain technology và protocols',
      url: 'https://epicenter.tv/',
      type: 'podcast',
      level: 'advanced',
      isPremium: false,
      rating: 4.7,
      icon: '🌐',
      color: 'blue'
    },
    {
      id: '35',
      title: 'Zero Knowledge',
      description: 'Podcast về cryptography và zero-knowledge proofs',
      url: 'https://www.zeroknowledge.fm/',
      type: 'podcast',
      level: 'advanced',
      isPremium: false,
      rating: 4.8,
      icon: '🔒',
      color: 'red'
    },

    // Trading & Investment Platforms
    {
      id: '36',
      title: 'Binance',
      description: 'Sàn giao dịch crypto lớn nhất thế giới với hơn 350 coins',
      url: 'https://www.binance.com/',
      type: 'platform',
      level: 'beginner',
      isPremium: false,
      rating: 4.7,
      icon: '🟡',
      color: 'yellow'
    },
    {
      id: '37',
      title: 'Coinbase',
      description: 'Nền tảng crypto user-friendly cho người mới',
      url: 'https://www.coinbase.com/',
      type: 'platform',
      level: 'beginner',
      isPremium: false,
      rating: 4.5,
      icon: '🔵',
      color: 'blue'
    },
    {
      id: '38',
      title: 'Kraken',
      description: 'Sàn crypto uy tín với security cao và fees thấp',
      url: 'https://www.kraken.com/',
      type: 'platform',
      level: 'intermediate',
      isPremium: false,
      rating: 4.6,
      icon: '🐙',
      color: 'purple'
    },
    {
      id: '39',
      title: 'Uniswap',
      description: 'DEX hàng đầu cho Ethereum và ERC-20 tokens',
      url: 'https://uniswap.org/',
      type: 'platform',
      level: 'intermediate',
      isPremium: false,
      rating: 4.8,
      icon: '🦄',
      color: 'pink'
    },
    {
      id: '40',
      title: 'PancakeSwap',
      description: 'DEX phổ biến nhất trên Binance Smart Chain',
      url: 'https://pancakeswap.finance/',
      type: 'platform',
      level: 'intermediate',
      isPremium: false,
      rating: 4.6,
      icon: '🥞',
      color: 'orange'
    },
    {
      id: '41',
      title: 'Curve Finance',
      description: 'DEX tối ưu cho stablecoin swaps với slippage thấp',
      url: 'https://curve.fi/',
      type: 'platform',
      level: 'advanced',
      isPremium: false,
      rating: 4.7,
      icon: '🌀',
      color: 'cyan'
    },
    {
      id: '42',
      title: 'dYdX',
      description: 'Decentralized exchange cho perpetual trading',
      url: 'https://dydx.exchange/',
      type: 'platform',
      level: 'advanced',
      isPremium: false,
      rating: 4.7,
      icon: '⚡',
      color: 'blue'
    },

    // Additional Learning Resources
    {
      id: '43',
      title: 'Khan Academy - Bitcoin',
      description: 'Giải thích Bitcoin và cryptography từ Khan Academy',
      url: 'https://www.khanacademy.org/economics-finance-domain/core-finance/money-and-banking/bitcoin/v/bitcoin-what-is-it',
      type: 'course',
      level: 'beginner',
      isPremium: false,
      rating: 4.6,
      icon: '🏫',
      color: 'green'
    },
    {
      id: '44',
      title: 'Bitcoin Whitepaper',
      description: 'Tài liệu gốc của Satoshi Nakamoto về Bitcoin',
      url: 'https://bitcoin.org/bitcoin.pdf',
      type: 'course',
      level: 'advanced',
      isPremium: false,
      rating: 5.0,
      icon: '📄',
      color: 'orange'
    },
    {
      id: '45',
      title: 'Ethereum Yellowpaper',
      description: 'Technical specification của Ethereum protocol',
      url: 'https://ethereum.github.io/yellowpaper/paper.pdf',
      type: 'course',
      level: 'advanced',
      isPremium: false,
      rating: 4.9,
      icon: '📝',
      color: 'purple'
    },
    {
      id: '46',
      title: 'CoinMarketCap API',
      description: 'API để lấy dữ liệu crypto cho projects của bạn',
      url: 'https://coinmarketcap.com/api/',
      type: 'tool',
      level: 'intermediate',
      isPremium: true,
      rating: 4.8,
      icon: '🔌',
      color: 'blue'
    },
    {
      id: '47',
      title: 'CryptoCompare',
      description: 'Live data, charts và market analysis tools',
      url: 'https://www.cryptocompare.com/',
      type: 'tool',
      level: 'intermediate',
      isPremium: false,
      rating: 4.6,
      icon: '⚖️',
      color: 'cyan'
    },
    {
      id: '48',
      title: 'LunarCrush',
      description: 'Social media analytics cho crypto markets',
      url: 'https://lunarcrush.com/',
      type: 'tool',
      level: 'intermediate',
      isPremium: false,
      rating: 4.5,
      icon: '🌙',
      color: 'purple'
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesLevel = selectedLevel === 'all' || resource.level === selectedLevel;
    return matchesType && matchesLevel;
  });

  // Update counts
  resourceTypes.forEach(type => {
    if (type.id === 'all') {
      type.count = resources.length;
    } else {
      type.count = resources.filter(r => r.type === type.id).length;
    }
  });

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch(level) {
      case 'beginner': return 'Cơ bản';
      case 'intermediate': return 'Trung cấp';
      case 'advanced': return 'Nâng cao';
      default: return level;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 pt-28">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="text-6xl animate-pulse">💡</div>
              <div className="text-6xl animate-bounce animation-delay-200">📚</div>
              <div className="text-6xl animate-pulse animation-delay-400">🚀</div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-200 to-white">
                Thư viện tài nguyên Crypto
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              {resources.length}+ tài nguyên học tập, công cụ và cộng đồng hàng đầu cho hành trình crypto của bạn
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-bold">{resources.filter(r => !r.isPremium).length}</div>
                <div className="text-sm text-white/80">Miễn phí</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-bold">{resources.filter(r => r.level === 'beginner').length}</div>
                <div className="text-sm text-white/80">Cơ bản</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-bold">{resources.filter(r => r.type === 'tool').length}</div>
                <div className="text-sm text-white/80">Công cụ</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-bold">{resources.filter(r => r.type === 'platform').length}</div>
                <div className="text-sm text-white/80">Nền tảng</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16" viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none">
            <path d="M0,50 C240,100 480,0 720,50 C960,100 1200,0 1440,50 L1440,100 L0,100 Z" 
                  fill="rgb(238, 242, 255)" 
                  className="dark:fill-gray-900"
            />
          </svg>
        </div>
      </div>

      {/* Filters Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Type Filter */}
        <div className={`mb-8 transform transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Loại tài nguyên</h2>
          <div className="flex flex-wrap gap-3">
            {resourceTypes.map((type, index) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`group relative px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedType === type.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg hover:scale-105'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="mr-2">{type.icon}</span>
                {type.name}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  selectedType === type.id 
                    ? 'bg-white/20' 
                    : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                }`}>
                  {type.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Level Filter */}
        <div className={`mb-8 transform transition-all duration-700 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Độ khó</h2>
          <div className="flex flex-wrap gap-3">
            {['all', 'beginner', 'intermediate', 'advanced'].map((level, index) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedLevel === level
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg hover:scale-105'
                }`}
              >
                {level === 'all' ? '🌟 Tất cả' : 
                 level === 'beginner' ? '🟢 Cơ bản' :
                 level === 'intermediate' ? '🟡 Trung cấp' : '🔴 Nâng cao'}
                <span className="ml-2">
                  ({resources.filter(r => level === 'all' || r.level === level).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className={`transform transition-all duration-700 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Đang hiển thị {filteredResources.length} tài nguyên
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredCard(resource.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-3"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-4xl transform transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">
                          {resource.icon}
                        </div>
                        {resource.isPremium && (
                          <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                            PRO
                          </span>
                        )}
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(resource.level)}`}>
                        {getLevelText(resource.level)}
                      </span>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {resource.rating}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-500">
                    {resource.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                    {resource.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {resource.isPremium ? '💳 Có phí' : '🆓 Miễn phí'}
                    </span>
                    
                    <div className="flex items-center text-sm font-semibold text-purple-600 dark:text-purple-400">
                      <span>Truy cập</span>
                      <svg className="w-5 h-5 ml-1 transform transition-transform duration-500 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Border */}
                {hoveredCard === resource.id && (
                  <div className="absolute inset-0 border-4 border-purple-500 rounded-3xl animate-pulse"></div>
                )}

                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className={`mt-16 text-center transform transition-all duration-700 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl p-12 text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              Sẵn sàng bắt đầu học?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Khám phá thêm {resources.length}+ tài nguyên và bắt đầu hành trình crypto của bạn ngay hôm nay!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/kien-thuc"
                className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-bold rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="mr-2">📚</span>
                Kiến thức cơ bản
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-lg text-white font-bold rounded-full border-2 border-white/30 hover:bg-white/30 hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="mr-2">🏠</span>
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 30px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}
