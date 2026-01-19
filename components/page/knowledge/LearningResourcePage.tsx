// components/page/KnowledgePage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'blockchain' | 'defi' | 'nft' | 'web3' | 'trading' | 'security';
  icon: string;
  color: string;
  tags: string[];
}

interface KnowledgeCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
}

export default function KnowledgePage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const categories: KnowledgeCategory[] = [
    {
      id: 'all',
      name: 'Tất cả',
      icon: '🌐',
      color: 'gray',
      gradient: 'from-gray-500 to-gray-700',
      description: 'Tất cả tài nguyên học tập'
    },
    {
      id: 'blockchain',
      name: 'Blockchain',
      icon: '⛓️',
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Công nghệ blockchain cơ bản'
    },
    {
      id: 'defi',
      name: 'DeFi',
      icon: '💰',
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      description: 'Tài chính phi tập trung'
    },
    {
      id: 'nft',
      name: 'NFT & Metaverse',
      icon: '🎨',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-600',
      description: 'Nghệ thuật số & thế giới ảo'
    },
    {
      id: 'web3',
      name: 'Web3',
      icon: '🚀',
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-600',
      description: 'Internet thế hệ mới'
    },
    {
      id: 'trading',
      name: 'Trading',
      icon: '📈',
      color: 'orange',
      gradient: 'from-orange-500 to-red-600',
      description: 'Giao dịch & phân tích'
    },
    {
      id: 'security',
      name: 'Bảo mật',
      icon: '🔒',
      color: 'red',
      gradient: 'from-red-500 to-rose-600',
      description: 'An toàn tài sản crypto'
    }
  ];

  const resources: Resource[] = [
    // Blockchain
    {
      id: '1',
      title: 'Blockchain.com Learning Portal',
      description: 'Khóa học blockchain từ cơ bản đến nâng cao, hoàn toàn miễn phí',
      url: 'https://www.blockchain.com/learning-portal',
      category: 'blockchain',
      icon: '📚',
      color: 'blue',
      tags: ['Miễn phí', 'Cơ bản', 'Tiếng Anh']
    },
    {
      id: '2',
      title: 'MIT Blockchain Course',
      description: 'Khóa học blockchain của MIT - Kiến thức học thuật chất lượng cao',
      url: 'https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/',
      category: 'blockchain',
      icon: '🎓',
      color: 'blue',
      tags: ['Học thuật', 'Nâng cao', 'Miễn phí']
    },
    {
      id: '3',
      title: 'Ethereum.org - Learn',
      description: 'Tài liệu chính thức về Ethereum và smart contracts',
      url: 'https://ethereum.org/en/learn/',
      category: 'blockchain',
      icon: '⟠',
      color: 'blue',
      tags: ['Ethereum', 'Smart Contract', 'Official']
    },
    {
      id: '4',
      title: 'CoinMarketCap Learn',
      description: 'Hệ thống bài học về crypto từ cơ bản đến nâng cao với phần thưởng',
      url: 'https://coinmarketcap.com/learn/',
      category: 'blockchain',
      icon: '💎',
      color: 'blue',
      tags: ['Tương tác', 'Phần thưởng', 'Cơ bản']
    },

    // DeFi
    {
      id: '5',
      title: 'DeFi Pulse - Education',
      description: 'Tìm hiểu về các giao thức DeFi hàng đầu và cách sử dụng',
      url: 'https://www.defipulse.com/',
      category: 'defi',
      icon: '💹',
      color: 'green',
      tags: ['DeFi', 'Giao thức', 'Ranking']
    },
    {
      id: '6',
      title: 'Uniswap University',
      description: 'Học cách sử dụng DEX, cung cấp thanh khoản và yield farming',
      url: 'https://uniswap.org/blog',
      category: 'defi',
      icon: '🦄',
      color: 'green',
      tags: ['DEX', 'Liquidity', 'Uniswap']
    },
    {
      id: '7',
      title: 'Aave Academy',
      description: 'Kiến thức về lending, borrowing và interest-bearing tokens',
      url: 'https://aave.com/',
      category: 'defi',
      icon: '👻',
      color: 'green',
      tags: ['Lending', 'Borrowing', 'Staking']
    },
    {
      id: '8',
      title: 'Yearn Finance Docs',
      description: 'Tìm hiểu về yield optimization và vault strategies',
      url: 'https://docs.yearn.finance/',
      category: 'defi',
      icon: '💵',
      color: 'green',
      tags: ['Yield', 'Vault', 'Strategy']
    },

    // NFT & Metaverse
    {
      id: '9',
      title: 'OpenSea Learn',
      description: 'Hướng dẫn mua, bán và tạo NFT trên thị trường lớn nhất',
      url: 'https://opensea.io/learn',
      category: 'nft',
      icon: '🌊',
      color: 'purple',
      tags: ['NFT', 'Marketplace', 'Tutorial']
    },
    {
      id: '10',
      title: 'Rarible Protocol',
      description: 'Tìm hiểu về NFT protocol và cách tạo NFT marketplace',
      url: 'https://rarible.org/',
      category: 'nft',
      icon: '🎭',
      color: 'purple',
      tags: ['NFT', 'Protocol', 'Creator']
    },
    {
      id: '11',
      title: 'Decentraland Docs',
      description: 'Xây dựng và khám phá thế giới metaverse phi tập trung',
      url: 'https://docs.decentraland.org/',
      category: 'nft',
      icon: '🌍',
      color: 'purple',
      tags: ['Metaverse', 'Virtual Land', 'Gaming']
    },
    {
      id: '12',
      title: 'The Sandbox Academy',
      description: 'Tạo game và experience trong metaverse The Sandbox',
      url: 'https://www.sandbox.game/en/academy/',
      category: 'nft',
      icon: '🏖️',
      color: 'purple',
      tags: ['Metaverse', 'Game Dev', 'Creator']
    },

    // Web3
    {
      id: '13',
      title: 'Web3 University',
      description: 'Khóa học miễn phí về Web3 development và dApps',
      url: 'https://www.web3.university/',
      category: 'web3',
      icon: '🎓',
      color: 'cyan',
      tags: ['Developer', 'dApp', 'Miễn phí']
    },
    {
      id: '14',
      title: 'IPFS Documentation',
      description: 'Hệ thống lưu trữ phi tập trung cho Web3',
      url: 'https://docs.ipfs.tech/',
      category: 'web3',
      icon: '📦',
      color: 'cyan',
      tags: ['Storage', 'P2P', 'Protocol']
    },
    {
      id: '15',
      title: 'ENS Docs',
      description: 'Ethereum Name Service - Domain cho thế giới Web3',
      url: 'https://docs.ens.domains/',
      category: 'web3',
      icon: '🏷️',
      color: 'cyan',
      tags: ['DNS', 'Identity', 'Naming']
    },
    {
      id: '16',
      title: 'Chainlink Docs',
      description: 'Oracle network kết nối blockchain với dữ liệu thực tế',
      url: 'https://docs.chain.link/',
      category: 'web3',
      icon: '🔗',
      color: 'cyan',
      tags: ['Oracle', 'Data Feed', 'Integration']
    },

    // Trading
    {
      id: '17',
      title: 'Binance Academy',
      description: 'Học viện giao dịch crypto lớn nhất thế giới',
      url: 'https://academy.binance.com/',
      category: 'trading',
      icon: '🏫',
      color: 'orange',
      tags: ['Trading', 'Technical Analysis', 'Miễn phí']
    },
    {
      id: '18',
      title: 'TradingView Education',
      description: 'Phân tích kỹ thuật và chart patterns chuyên sâu',
      url: 'https://www.tradingview.com/education/',
      category: 'trading',
      icon: '📊',
      color: 'orange',
      tags: ['Chart', 'TA', 'Indicators']
    },
    {
      id: '19',
      title: 'CoinGecko Research',
      description: 'Nghiên cứu thị trường và phân tích on-chain',
      url: 'https://www.coingecko.com/research',
      category: 'trading',
      icon: '🦎',
      color: 'orange',
      tags: ['Research', 'On-chain', 'Market']
    },
    {
      id: '20',
      title: 'Glassnode Academy',
      description: 'Phân tích on-chain nâng cao cho trader chuyên nghiệp',
      url: 'https://academy.glassnode.com/',
      category: 'trading',
      icon: '🔬',
      color: 'orange',
      tags: ['On-chain', 'Analytics', 'Professional']
    },

    // Security
    {
      id: '21',
      title: 'Ledger Academy',
      description: 'Bảo mật ví cứng và best practices cho crypto security',
      url: 'https://www.ledger.com/academy',
      category: 'security',
      icon: '🔐',
      color: 'red',
      tags: ['Hardware Wallet', 'Security', 'Best Practices']
    },
    {
      id: '22',
      title: 'MetaMask Learn',
      description: 'Sử dụng ví MetaMask an toàn và bảo vệ tài sản',
      url: 'https://metamask.io/learn/',
      category: 'security',
      icon: '🦊',
      color: 'red',
      tags: ['Software Wallet', 'Security', 'Tutorial']
    },
    {
      id: '23',
      title: 'CertiK Blog',
      description: 'Tin tức về security audit và blockchain vulnerabilities',
      url: 'https://www.certik.com/resources/blog',
      category: 'security',
      icon: '🛡️',
      color: 'red',
      tags: ['Audit', 'Vulnerabilities', 'News']
    },
    {
      id: '24',
      title: 'Web3 Security',
      description: 'Best practices cho smart contract security và testing',
      url: 'https://ethereum.org/en/developers/docs/smart-contracts/security/',
      category: 'security',
      icon: '⚠️',
      color: 'red',
      tags: ['Smart Contract', 'Testing', 'Audit']
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 pt-28">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMThoMnYxMnptMCAxMmgtMlYzMGgydjEyem0tMTIgMGgtMlYzMGgydjEyem0wLTEyaC0yVjE4aDJ2MTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-block mb-6">
              <div className="text-6xl animate-bounce">🎓</div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
              Kiến Thức Crypto
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Khám phá thế giới blockchain, DeFi, NFT và Web3 với các tài nguyên học tập chất lượng cao
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm tài nguyên học tập..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-full text-gray-900 dark:text-white bg-white/20 backdrop-blur-lg border-2 border-white/30 focus:border-white/60 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all placeholder-white/70"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Animated Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
                  fill="rgb(249, 250, 251)" 
                  className="dark:fill-gray-900"
            />
          </svg>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`transform transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Chọn danh mục
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                  activeCategory === category.id
                    ? `bg-gradient-to-br ${category.gradient} text-white shadow-xl scale-105`
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className={`text-4xl mb-3 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12`}>
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                  <p className={`text-xs ${activeCategory === category.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {filteredResources.filter(r => category.id === 'all' || r.category === category.id).length} tài nguyên
                  </p>
                </div>

                {/* Selection Indicator */}
                {activeCategory === category.id && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-6 h-6 text-white animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className={`transform transition-all duration-700 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeCategory === 'all' ? 'Tất cả tài nguyên' : categories.find(c => c.id === activeCategory)?.name}
              <span className="ml-3 text-lg font-normal text-gray-500 dark:text-gray-400">
                ({filteredResources.length} kết quả)
              </span>
            </h2>
          </div>

          {filteredResources.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Không tìm thấy kết quả
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2"
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* Gradient Border Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${categories.find(c => c.id === resource.category)?.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <div className="absolute inset-[2px] bg-white dark:bg-gray-800 rounded-2xl"></div>
                  
                  {/* Content */}
                  <div className="relative p-6">
                    {/* Icon & Category Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`text-5xl transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12`}>
                        {resource.icon}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${categories.find(c => c.id === resource.category)?.gradient} text-white`}>
                        {categories.find(c => c.id === resource.category)?.name}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-purple-600 transition-all duration-500">
                      {resource.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {resource.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resource.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      <span>Tìm hiểu thêm</span>
                      <svg className="w-5 h-5 ml-2 transform transition-transform duration-500 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>

                  {/* Hover Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className={`mt-16 transform transition-all duration-700 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{resources.length}</div>
                <div className="text-white/80">Tài nguyên</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{categories.length - 1}</div>
                <div className="text-white/80">Danh mục</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-white/80">Miễn phí</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-white/80">Truy cập</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className={`mt-16 text-center transform transition-all duration-700 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Bắt đầu hành trình học tập của bạn ngay hôm nay!
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Khám phá thêm nhiều tài nguyên chất lượng cao và nâng cao kiến thức crypto của bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Về trang chủ
            </Link>
            <Link
              href="/quan-ly-vi"
              className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-full border-2 border-gray-300 dark:border-gray-600 hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Quản lý ví
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
