export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 border-t-4 border-orange-500">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Logo & Description */}
          <div className="flex flex-col gap-6">
            <a className="flex items-center gap-3" href="/">
              <div className="size-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>currency_bitcoin</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg leading-tight">CRYPTO</span>
                <span className="text-gray-400 text-xs font-medium uppercase">News Portal</span>
              </div>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed">
              Cổng thông tin hàng đầu về tiền mã hóa, cung cấp tin tức, phân tích chuyên sâu về Bitcoin, Ethereum, DeFi và blockchain.
            </p>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-colors text-white" href="#">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
              </a>
              <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-colors text-white" href="#">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
              </a>
              <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-colors text-white" href="#">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
              </a>
            </div>
          </div>

          {/* Chuyên mục */}
          <div>
            <h4 className="text-base font-bold mb-4 text-white leading-normal">Chuyên mục</h4>
            <ul className="space-y-2">
              <li><a className="text-gray-400 hover:text-orange-500 transition-colors text-sm leading-normal" href="#">Tin tức Crypto</a></li>
              <li><a className="text-gray-400 hover:text-orange-500 transition-colors text-sm leading-normal" href="#">Phân tích thị trường</a></li>
              <li><a className="text-gray-400 hover:text-orange-500 transition-colors text-sm leading-normal" href="#">Kiến thức Blockchain</a></li>
              <li><a className="text-gray-400 hover:text-orange-500 transition-colors text-sm" href="#">Hướng dẫn Trading</a></li>
              <li><a className="text-gray-400 hover:text-orange-500 transition-colors text-sm" href="#">Pháp lý & Quy định</a></li>
            </ul>
          </div>

          {/* Tiện ích */}
          <div>
            <h4 className="text-base font-bold mb-4 text-white leading-normal">Tiện ích</h4>
            <ul className="space-y-3">
              <li><a className="text-gray-400 hover:text-orange-500 transition-colors text-sm" href="#">Bảng giá Coin</a></li>
              <li><a className="text-gray-400 hover:text-orange-500 transition-colors text-sm" href="#">Chuyển đổi tiền tệ</a></li>
              <li><a className="text-gray-400 hover:text-orange-500 transition-colors text-sm" href="#">Lịch sự kiện Crypto</a></li>
            </ul>
          </div>

          {/* Đăng ký nhận tin */}
          <div className="flex flex-col gap-6">
            <div>
              <h4 className="text-base font-bold mb-3 text-white leading-normal">Đăng ký nhận tin</h4>
              <p className="text-gray-400 text-sm mb-4 leading-normal">Cập nhật tin tức crypto và phân tích thị trường mới nhất.</p>
              <form className="flex flex-col gap-3">
                <input className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm leading-normal text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" placeholder="Email của bạn..." type="email"/>
                <button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-2 px-4 rounded-lg text-sm leading-normal transition-colors shadow-lg shadow-orange-500/20" type="button">
                  Đăng ký ngay
                </button>
              </form>
            </div>
            <div>
              <h4 className="text-xs font-bold mb-3 text-white uppercase opacity-80 leading-normal">Liên hệ</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-400 text-sm leading-normal">
                  <span className="material-symbols-outlined text-orange-500 text-[18px] leading-none">call</span>
                  <span>(024) 3999 8888</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 text-sm leading-normal">
                  <span className="material-symbols-outlined text-orange-500 text-[18px] leading-none">mail</span>
                  <span>lienhe@cryptonews.vn</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm leading-normal">© 2024 Crypto News Portal. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-gray-500 hover:text-white text-sm leading-normal" href="#">Điều khoản sử dụng</a>
            <a className="text-gray-500 hover:text-white text-sm leading-normal" href="#">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
}