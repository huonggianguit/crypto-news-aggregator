"use client";

import React, { useState } from "react";

interface NavigationProps {
  isScrolled: boolean;
}

export function Navigation({ isScrolled }: NavigationProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const menuItems = [
    {
      label: "Trang chủ",
      icon: "home",
      href: "/",
      active: true,
    },
    {
      label: "Tin tức",
      icon: "newspaper",
      submenu: [
        { label: "Tin Bitcoin", href: "#" },
        { label: "Tin Ethereum", href: "#" },
        { label: "Tin Altcoin", href: "#" },
        { label: "Tin thị trường", href: "#" },
      ],
    },
    {
      label: "Phân tích",
      icon: "analytics",
      submenu: [
        { label: "Phân tích kỹ thuật", href: "#" },
        { label: "Phân tích on-chain", href: "#" },
        { label: "Dự báo thị trường", href: "#" },
      ],
    },
    {
      label: "Kiến thức",
      icon: "school",
      submenu: [
        { label: "Blockchain cơ bản", href: "#" },
        { label: "DeFi", href: "#" },
        { label: "NFT & Metaverse", href: "#" },
        { label: "Web3", href: "#" },
      ],
    },
    {
      label: "Pháp lý",
      icon: "gavel",
      href: "/van-ban-phap-ly",
    },
    {
      label: "Hướng dẫn",
      icon: "help",
      submenu: [
        { label: "Mua bán crypto", href: "#" },
        { label: "Sử dụng ví", href: "#" },
        { label: "Trading cơ bản", href: "#" },
        { label: "Bảo mật tài khoản", href: "#" },
      ],
    },
    {
      label: "Bảng giá",
      icon: "currency_bitcoin",
      href: "#",
    },
    {
      label: "Liên hệ",
      icon: "mail",
      href: "#",
    },
  ];

  return (
    <nav className="bg-gradient-to-r from-orange-500 to-amber-500 w-full shadow-md hidden lg:block">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <ul className="flex items-center justify-center gap-0 text-white font-normal text-sm leading-normal">
          {menuItems.map((item, index) => (
            <li key={index} className="group relative">
              <a 
                className={`flex items-center gap-2 px-5 py-3 leading-normal transition-all ${
                  item.active 
                    ? "bg-red-800/30 border-b-4 border-white" 
                    : "hover:bg-white/10 border-b-4 border-transparent hover:border-white/50"
                }`} 
                href={item.href || "#"}
              >
                <span className="material-symbols-outlined text-[18px] leading-none">{item.icon}</span>
                <span className="leading-tight whitespace-nowrap">{item.label}</span>
                {item.submenu && (
                  <span className="material-symbols-outlined text-[18px] opacity-70 group-hover:rotate-180 transition-transform duration-300">expand_more</span>
                )}
              </a>
              
              {item.submenu && (
                <div className="absolute left-0 top-full w-64 bg-white text-gray-800 shadow-xl rounded-b-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top translate-y-2 group-hover:translate-y-0">
                  <ul className="py-1">
                    {item.submenu.map((subitem, subindex) => (
                      <li key={subindex}>
                        <a className="block px-6 py-2.5 text-sm leading-normal hover:bg-orange-50 hover:text-orange-600 transition-colors" href={subitem.href}>
                          {subitem.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
