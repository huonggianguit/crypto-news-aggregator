"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {MessageCircle} from 'lucide-react'
interface Post {
  id: string;
  slug: string;
  title: string;
  description: string;
  main_img: string;
  createdAt: string;
}

interface Message {
  id: string;
  type: "user" | "bot";
  text?: string;
  aiResponse?: string;
  posts?: Post[];
  suggestions?: string[];
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      text: "Xin chào! Tôi là trợ lý crypto. Bạn cần tôi trợ giúp điều gì về Bitcoin, Ethereum hay các đồng tiền mã hóa khác?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          aiResponse: data.aiResponse,
          posts: data.posts && data.posts.length > 0 ? data.posts : [],
          suggestions: data.suggestions || []
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          text: "Xin lỗi, tôi không thể xử lý câu hỏi của bạn. Vui lòng thử lại sau!",
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("Error:", error);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: "Lỗi kết nối. Vui lòng thử lại sau!",
      };
      setMessages((prev) => [...prev, botMessage]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center text-white text-2xl"
          title="Mở chatbot"
        >
         <MessageCircle size={24} /> 
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Trợ lý Crypto</h3>
              <p className="text-xs opacity-90">Sẵn sàng giúp bạn 24/7</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xl hover:bg-orange-600 w-8 h-8 flex items-center justify-center rounded-full transition"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                {msg.type === "bot" && (
                  <div className="w-full space-y-2">
                    {msg.aiResponse && (
                      <div className="bg-white rounded-lg p-3 text-sm text-gray-700 shadow-sm max-w-[85%]">
                        {msg.aiResponse}
                      </div>
                    )}
                    {msg.text && (
                      <div className="bg-white rounded-lg p-3 text-sm text-gray-700 shadow-sm max-w-[85%]">
                        {msg.text}
                      </div>
                    )}
                    {msg.posts && msg.posts.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 px-1 font-semibold">📚 Bài viết liên quan:</p>
                        {msg.posts.map((post) => (
                          <Link
                            key={post.id}
                            href={`/article/${post.slug}`}
                            className="block bg-white rounded-lg p-3 hover:shadow-md transition border-l-4 border-orange-500 hover:bg-orange-50"
                          >
                            <p className="font-semibold text-sm text-gray-900 line-clamp-2">
                              {post.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                              {post.description}
                            </p>
                            <p className="text-xs text-orange-500 mt-1">
                              {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 px-1 font-semibold">💡 Câu hỏi liên quan:</p>
                        <div className="space-y-1">
                          {msg.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => setInput(suggestion)}
                              className="block w-full text-left bg-white rounded-lg p-2 hover:shadow-md transition border-l-4 border-amber-500 hover:bg-amber-50 text-xs text-gray-700"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {msg.type === "user" && (
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg p-3 text-sm max-w-[85%] shadow-sm">
                    {msg.text}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg p-3 text-sm text-gray-800 shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                  Đang phản hồi...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="border-t bg-white p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về Bitcoin, Ethereum, DeFi..."
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-orange-500 text-gray-600"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
