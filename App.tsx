import React, { useState, useEffect } from 'react';
import { User } from './types';
import UserProfileModal from './components/UserProfileModal';
import ChatWidget from './components/ChatWidget';

const App: React.FC = () => {
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

  // Initialize snowfall and load user
  useEffect(() => {
    const createSnowflakes = () => {
        const container = document.querySelector('.snow-container');
        if (!container) return;
        
        container.innerHTML = ''; // Clear existing
        const flakeCount = 50;
        const chars = ['❅', '❆', '•', '*', '.'];
        
        for (let i = 0; i < flakeCount; i++) {
            const flake = document.createElement('div');
            flake.classList.add('snowflake');
            flake.innerHTML = chars[Math.floor(Math.random() * chars.length)];
            
            const posX = Math.random() * 100;
            const size = Math.random() * 1.5 + 0.5; // 0.5em to 2em
            const duration = Math.random() * 10 + 5; // 5s to 15s
            const delay = Math.random() * 5; // 0s to 5s
            
            flake.style.left = `${posX}%`;
            flake.style.fontSize = `${size}em`;
            flake.style.animationDuration = `${duration}s, 3s`;
            flake.style.animationDelay = `${delay}s, ${delay}s`;
            
            container.appendChild(flake);
        }
    };
    createSnowflakes();

    const storedUser = localStorage.getItem('studyWithMe_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHeaderHidden(true);
      } else {
        setIsHeaderHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSaveUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('studyWithMe_user', JSON.stringify(newUser));
  };

  const scrollToSection = (id: string) => {
      const el = document.getElementById(id);
      if(el) el.scrollIntoView({ behavior: 'smooth'});
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setIsSubmittingNewsletter(true);

    try {
        // Sử dụng Formspree endpoint mbddjqbk
        const response = await fetch("https://formspree.io/f/mbddjqbk", {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                email: newsletterEmail,
                message: "Người dùng này muốn đăng ký nhận tin tức từ StudyWithMe (Newsletter Subscription)"
            })
        });

        if (response.ok) {
            alert('Đăng ký thành công! Cảm ơn bạn đã quan tâm đến StudyWithMe.');
            setNewsletterEmail('');
        } else {
            alert('Có lỗi xảy ra khi gửi đăng ký. Vui lòng thử lại sau.');
        }
    } catch (error) {
        console.error("Email error:", error);
        alert('Có lỗi kết nối. Vui lòng kiểm tra mạng.');
    } finally {
        setIsSubmittingNewsletter(false);
    }
  };

  // Menu items including dynamic Profile item
  const menuItems: { 
    label: string; 
    icon: string; 
    href?: string; 
    onClick?: () => void; 
    fab?: boolean; 
    far?: boolean; 
  }[] = [
    { label: 'Trang Chủ', icon: 'fa-home', href: '#' },
    { label: 'Người Thắp Đèn', icon: 'fa-user-graduate', href: 'nguoi_thap_den.html' },
    { label: 'Định Hướng Nghề Nghiệp', icon: 'fa-compass', href: 'https://ah-henna.vercel.app/' },
    { label: 'Phương Pháp Học Tập', icon: 'fa-book-open', href: 'phuong_phap.html' },
    { label: 'Khóa Học Lớp 12', icon: 'fa-chalkboard-teacher', onClick: () => { setIsSidebarActive(false); scrollToSection('class12'); } },
    { label: 'Thời Khóa Biểu', icon: 'fa-calendar-alt', href: 'https://lk-sand.vercel.app/' },
    { label: 'Tài Liệu', icon: 'fa-file-alt', href: 'tai_lieu.html' },
    { label: 'Cộng Đồng Discord', icon: 'fa-discord', href: 'https://discord.gg/uHYE9VWp5e', fab: true },
    { label: 'Diễn Đàn Học Tập', icon: 'fa-users', href: 'https://ag-peach.vercel.app/' },
    { label: 'Quiz Ngắn', icon: 'fa-circle-question', href: 'https://sites.google.com/view/gangmahoc/trang-ch%E1%BB%A7/quiz-ng%E1%BA%AFn?authuser=0/', far: true },
    { label: 'EduGames Hub', icon: 'fa-gamepad', href: 'gamee.html' },
  ];

  if (user) {
      menuItems.unshift({ 
          label: 'Hồ Sơ Của Bạn', 
          icon: 'fa-id-card', 
          onClick: () => { setIsSidebarActive(false); setIsProfileModalOpen(true); },
          href: '#' // Dummy
      });
  }

  return (
    <div className="text-[#333] leading-relaxed relative overflow-x-hidden min-h-screen">
      {/* Snowfall Container */}
      <div className="snow-container absolute top-0 left-0 w-full h-full pointer-events-none z-0"></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-[250px] h-screen bg-white/95 shadow-2xl z-[1000] transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isSidebarActive ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 bg-gradient-to-br from-primary to-accent text-white flex justify-between items-center">
          <h3 className="text-xl font-bold font-bungee">StudyWithMe</h3>
          <button onClick={() => setIsSidebarActive(false)} className="text-white text-2xl">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <ul className="list-none p-0 m-0">
          {menuItems.map((item, idx) => (
            <li key={idx} className="border-b border-gray-100">
              <a
                href={item.href || '#'}
                onClick={(e) => {
                    if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                    }
                }}
                className={`flex items-center px-5 py-4 text-dark hover:bg-gray-100 hover:text-primary transition-colors ${item.label === 'Hồ Sơ Của Bạn' ? 'text-primary font-bold bg-blue-50' : ''}`}
              >
                <i className={`${item.fab ? 'fab' : item.far ? 'fa-regular' : 'fas'} ${item.icon} w-6 text-center mr-3`}></i>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Header */}
      <header
        className={`bg-white/95 shadow-lg sticky top-0 z-[999] backdrop-blur-md transition-transform duration-300 ${
          isHeaderHidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarActive(true)}
                className="bg-none border-none text-2xl text-primary cursor-pointer mr-4"
              >
                <i className="fas fa-bars"></i>
              </button>
              <span className="text-3xl text-primary mr-2">
                <i className="fas fa-graduation-cap"></i>
              </span>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent font-bungee">
                StudyWithMe
              </h1>
            </div>
            
            <nav className="hidden md:block">
              <ul className="flex list-none">
                {['Trang Chủ', 'Giới Thiệu', 'Liên Hệ'].map((item) => (
                  <li key={item} className="ml-6">
                    <a
                      href="#"
                      className="text-dark font-medium transition-colors relative group hover:text-primary"
                    >
                      {item}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                 <div 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-2 cursor-pointer p-1 pr-3 rounded-full hover:bg-gray-100 transition-colors animate-[fadeIn_0.5s]"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold overflow-hidden border-2 border-primary shadow-md">
                    {user.avatar ? (
                      <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="font-semibold text-primary hidden sm:block font-oswald">{user.name}</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="bg-gradient-to-r from-primary to-accent text-white border-none shadow-lg px-5 py-2 rounded-full font-semibold transition-transform hover:-translate-y-1 hover:shadow-xl flex items-center gap-2"
                >
                  <i className="fas fa-user-plus"></i>
                  <span>Tạo Hồ Sơ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 text-center text-white relative">
        <div className="max-w-[1200px] mx-auto px-5 relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl mb-5 drop-shadow-lg font-bungee leading-tight">
              Học Tập Thông Minh, <br/> Tương Lai Rộng Mở
            </h2>
            <p className="text-xl md:text-2xl mb-10 opacity-90 drop-shadow-md font-dancing">
              Khám phá phương pháp học tập hiệu quả, kết nối với cộng đồng học tập sôi động và định hướng tương lai của bạn
            </p>
            <div className="flex justify-center gap-5 flex-wrap">
              <a
                href="#"
                className="px-8 py-3 rounded-full text-lg font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-lg transition-transform hover:-translate-y-1 flex items-center gap-2"
              >
                <i className="fas fa-play-circle"></i> Bắt Đầu Học Ngay
              </a>
              <a
                href="gioi_thieu.html"
                className="px-8 py-3 rounded-full text-lg font-semibold border-2 border-white text-white bg-transparent transition-transform hover:-translate-y-1 flex items-center gap-2 hover:bg-white hover:text-primary"
              >
                <i className="fas fa-info-circle"></i> Tìm Hiểu Thêm
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-5 pb-16 relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-14 border border-white/50">
          
          {/* Features Grid */}
          <div className="text-center mb-16">
            <h2 className="text-4xl text-dark mb-4 font-bungee relative inline-block after:content-[''] after:absolute after:w-20 after:h-1 after:bg-gradient-to-r after:from-primary after:to-accent after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:rounded">
              Khám Phá Hệ Thống Học Tập
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg mt-6 font-dancing">
              Trải nghiệm phương pháp học tập đa dạng với các công cụ và tài nguyên phong phú
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {[
              { title: 'Người Thắp Đèn', desc: 'Kết nối với những người thầy, người hướng dẫn tâm huyết...', img: 'https://res.cloudinary.com/dhybzbyp3/image/upload/v1762441274/1234_nzaywb.jpg', link: 'nguoi_thap_den.html', icon1: 'fa-users', stats1: 'Nhiều Mentor', icon2: 'fa-star', stats2: '4.7/5 Rating' },
              { title: 'Định Hướng Nghề Nghiệp', desc: 'Tìm hiểu các ngành nghề, xu hướng thị trường lao động...', img: 'https://res.cloudinary.com/dhybzbyp3/image/upload/v1762441423/1236_d6wcup.jpg', link: 'https://ah-henna.vercel.app/', icon1: 'fa-briefcase', stats1: 'Đa Dạng Ngành', icon2: 'fa-chart-line', stats2: 'Xu Hướng Mới' },
              { title: 'Phương Pháp Học Tập', desc: 'Khám phá các phương pháp học tập hiệu quả, kỹ năng...', img: 'https://res.cloudinary.com/dhybzbyp3/image/upload/v1762441423/1237_chch2x.jpg', link: 'phuong_phap.html', icon1: 'fa-lightbulb', stats1: 'Hiệu Quả Cao', icon2: 'fa-clock', stats2: 'Tiết Kiệm Giờ' },
              { title: 'Quiz Ngắn', desc: 'Kiểm tra kiến thức nhanh với các bài quiz ngắn...', img: 'https://res.cloudinary.com/dhybzbyp3/image/upload/v1762441422/1235_j3rtci.jpg', link: 'https://sites.google.com/view/gangmahoc/trang-ch%E1%BB%A7/quiz-ng%E1%BA%AFn?authuser=0', icon1: 'fa-question-circle', stats1: 'Nhiều Chủ Đề', icon2: 'fa-clock', stats2: '5-10 Phút' },
              { title: 'Thời Khoá Biểu', desc: 'Giúp lên lịch cá nhân, làm chủ thời gian, tối ưu hiệu suất.', img: 'https://res.cloudinary.com/dhybzbyp3/image/upload/v1765637563/t%E1%BA%A3i_xu%E1%BB%91ng_1_t1ye5c.jpg', link: 'https://lk-sand.vercel.app/', icon1: 'fa-calendar-check', stats1: 'Kế Hoạch', icon2: 'fa-clock', stats2: 'Quản Lý Giờ' },
              { title: 'EduGames Hub', desc: 'Trò chơi học tập, rèn luyện kiến thức.', img: 'https://res.cloudinary.com/dhybzbyp3/image/upload/v1765637563/t%E1%BA%A3i_xu%E1%BB%91ng_2_b1aags.jpg', link: 'gamee.html', icon1: 'fa-gamepad', stats1: 'Giải Trí', icon2: 'fa-brain', stats2: 'Thông Minh' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:-translate-y-3 hover:shadow-2xl transition-all duration-400 flex flex-col h-full group">
                <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url('${card.img}')` }}>
                  <div className="absolute bottom-0 left-0 w-full h-2/5 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-3 text-dark font-oswald">{card.title}</h3>
                  <p className="text-gray-500 mb-5 flex-1 leading-relaxed text-sm">{card.desc}</p>
                  <a href={card.link} className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all w-max self-start">
                    Khám Phá Ngay
                  </a>
                  <div className="flex justify-between mt-4 text-gray-400 text-xs font-medium pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1"><i className={`fas ${card.icon1}`}></i> {card.stats1}</span>
                    <span className="flex items-center gap-1"><i className={`fas ${card.icon2}`}></i> {card.stats2}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* COMMUNITY SECTION */}
          <div className="text-center mb-10">
            <h2 className="text-4xl text-dark mb-4 font-bungee relative inline-block after:content-[''] after:absolute after:w-20 after:h-1 after:bg-gradient-to-r after:from-primary after:to-accent after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:rounded">
              Cộng Đồng Học Tập
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg mt-6 font-dancing">
              Kết nối, chia sẻ và học hỏi cùng hàng ngàn học sinh trên khắp cả nước
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
             {/* Library Card - Cat Reading */}
             <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:-translate-y-3 hover:shadow-2xl transition-all duration-300">
                <div className="h-56 bg-cover bg-center transform hover:scale-105 transition-transform duration-700" style={{ backgroundImage: "url('https://res.cloudinary.com/dhybzbyp3/image/upload/v1762441987/897_qfqdx8.jpg')" }}></div>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-dark font-oswald">Thư Viện Tài Liệu</h3>
                    <p className="text-gray-500 mb-6 text-sm">Thư viện tài liệu phong phú với đề thi, bài giảng, sách tham khảo và tài liệu học tập chất lượng.</p>
                    <a href="tai_lieu.html" className="block w-full text-center py-2 rounded-full border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors">
                        Khám Phá Ngay
                    </a>
                    <div className="flex justify-between mt-4 text-gray-400 text-xs pt-3 border-t border-gray-100">
                        <span><i className="fas fa-file-alt mr-1"></i> Nhiều Tài Liệu</span>
                        <span><i className="fas fa-download mr-1"></i> Miễn Phí</span>
                    </div>
                </div>
             </div>

             {/* Discord Card - Cat Relaxing */}
             <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:-translate-y-3 hover:shadow-2xl transition-all duration-300">
                <div className="h-56 bg-cover bg-center transform hover:scale-105 transition-transform duration-700" style={{ backgroundImage: "url('https://res.cloudinary.com/dhybzbyp3/image/upload/v1762442016/1456_jnl6zq.jpg')" }}></div>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-dark font-oswald">Cộng Đồng Discord</h3>
                    <p className="text-gray-500 mb-6 text-sm">Tham gia cộng đồng học tập sôi động trên Discord để trao đổi, thảo luận và học hỏi cùng nhau.</p>
                    <a href="https://discord.gg/uHYE9VWp5e" className="block w-full text-center py-2 rounded-full border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors">
                        Tham Gia Ngay
                    </a>
                    <div className="flex justify-between mt-4 text-gray-400 text-xs pt-3 border-t border-gray-100">
                        <span><i className="fab fa-discord mr-1"></i> Nhiều Thành Viên</span>
                        <span><i className="fas fa-comments mr-1"></i> Trò Chuyện</span>
                    </div>
                </div>
             </div>

             {/* Forum Card - Cat by Water/Nature */}
             <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:-translate-y-3 hover:shadow-2xl transition-all duration-300">
                <div className="h-56 bg-cover bg-center transform hover:scale-105 transition-transform duration-700" style={{ backgroundImage: "url('https://res.cloudinary.com/dhybzbyp3/image/upload/v1762442016/1456_jnl6zq.jpg')" }}></div>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-dark font-oswald">Diễn Đàn Học Tập</h3>
                    <p className="text-gray-500 mb-6 text-sm">Nơi chia sẻ kiến thức, kinh nghiệm học tập và giải đáp thắc mắc từ cộng đồng.</p>
                    <a href="https://ag-peach.vercel.app/" className="block w-full text-center py-2 rounded-full border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors">
                        Tham Gia Ngay
                    </a>
                    <div className="flex justify-between mt-4 text-gray-400 text-xs pt-3 border-t border-gray-100">
                        <span><i className="fas fa-users mr-1"></i> Cộng Đồng Lớn</span>
                        <span><i className="fas fa-question-circle mr-1"></i> Hỏi Đáp</span>
                    </div>
                </div>
             </div>
          </div>

          {/* CTA Section */}
          <div className="relative rounded-3xl overflow-hidden py-20 px-5 text-center text-white mb-16 bg-gradient-to-r from-primary to-accent">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://res.cloudinary.com/dhybzbyp3/image/upload/v1762440815/111_sgtgny.jpg')] bg-cover bg-center opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-dancing mb-6">Sẵn Sàng Bắt Đầu Hành Trình Học Tập?</h2>
              <p className="text-xl max-w-2xl mx-auto mb-10 font-oswald opacity-90">Tham gia cộng đồng học tập của chúng tôi ngay hôm nay để khám phá tiềm năng của bạn</p>
              <button className="bg-white text-primary px-8 py-3 rounded-full text-lg font-bold shadow-lg hover:-translate-y-1 transition-transform flex items-center gap-2 mx-auto">
                <i className="fas fa-rocket"></i> Cùng Học Tập Nào!
              </button>
            </div>
          </div>

          {/* Class 12 Section */}
          <div id="class12" className="text-center mb-16">
            <h2 className="text-4xl text-dark mb-4 font-bungee relative inline-block after:content-[''] after:absolute after:w-20 after:h-1 after:bg-gradient-to-r after:from-primary after:to-accent after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:rounded">
              Khóa Học Lớp 12
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg mt-6 font-dancing">
              Chuẩn bị tốt nhất cho kỳ thi THPT Quốc gia
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Toán Học', icon: 'fa-square-root-alt', sub: 'Đại số & Hình học', link: 'm%C3%B4n-to%C3%A1n' },
              { name: 'Vật Lý', icon: 'fa-atom', sub: 'Cơ học & Điện từ', link: 'm%C3%B4n-v%E1%BA%ADt-l%C3%AD' },
              { name: 'Hoá Học', icon: 'fa-flask', sub: 'Hữu cơ & Vô cơ', link: 'm%C3%B4n-ho%C3%A1' },
              { name: 'Sinh Học', icon: 'fa-dna', sub: 'Di truyền & Tiến hoá', link: 'm%C3%B4n-sinh-h%E1%BB%8Dc' },
              { name: 'Địa Lý', icon: 'fa-globe-asia', sub: 'Tự nhiên & KT-XH', link: 'm%C3%B4n-%C4%91%E1%BB%8Ba-l%C3%AD' },
              { name: 'Lịch Sử', icon: 'fa-landmark', sub: 'VN & Thế giới', link: 'm%C3%B4n-l%E1%BB%8Bch-s%E1%BB%AD' },
              { name: 'Ngữ Văn', icon: 'fa-book', sub: 'Văn học & Tiếng Việt', link: 'm%C3%B4n-ng%E1%BB%AF-v%C4%83n' },
              { name: 'Tiếng Anh', icon: 'fa-language', sub: 'Ngữ pháp & Kỹ năng', link: 'm%C3%B4n-ti%E1%BA%BFng-anh' },
            ].map((sub, i) => (
              <a 
                href={`https://sites.google.com/view/gangmahoc/trang-ch%E1%BB%A7/c%C3%A1c-kho%C3%A1-h%E1%BB%8Dc-l%E1%BB%9Bp-12/${sub.link}?authuser=0`}
                key={i} 
                className="bg-white rounded-xl p-6 text-center shadow-md hover:-translate-y-2 hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="text-4xl text-primary mb-4 group-hover:scale-110 transition-transform">
                  <i className={`fas ${sub.icon}`}></i>
                </div>
                <h4 className="font-bold text-dark mb-2">{sub.name}</h4>
                <p className="text-xs text-gray-500">{sub.sub}</p>
              </a>
            ))}
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white pt-16 pb-8 relative z-10">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <h3 className="text-xl font-bold mb-6 relative pb-3 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-1 after:bg-gradient-to-r after:from-primary after:to-accent">
                Về StudyWithMe
              </h3>
              <ul className="space-y-3 text-gray-300">
                {['Giới thiệu', 'Đội ngũ', 'Sứ mệnh', 'Liên hệ'].map(item => (
                    <li key={item}><a href="#" className="hover:text-accent transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs"></i> {item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 relative pb-3 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-1 after:bg-gradient-to-r after:from-primary after:to-accent">
                Hỗ Trợ
              </h3>
              <ul className="space-y-3 text-gray-300">
                 {['Câu hỏi thường gặp', 'Chính sách bảo mật', 'Điều khoản dịch vụ'].map(item => (
                    <li key={item}><a href="#" className="hover:text-accent transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs"></i> {item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 relative pb-3 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-1 after:bg-gradient-to-r after:from-primary after:to-accent">
                Kết Nối
              </h3>
              <div className="flex gap-4 mb-6">
                {[
                    { icon: 'fa-facebook-f', link: 'https://www.facebook.com/profile.php?id=100081257824203' },
                    { icon: 'fa-tiktok', link: 'https://www.tiktok.com/@studywithme97mt?_t=ZS-90qPBEngpOs&_r=1' },
                    { icon: 'fa-discord', link: 'https://discord.gg/uHYE9VWp5e' }
                ].map((social, i) => (
                    <a key={i} href={social.link} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all">
                        <i className={`fab ${social.icon}`}></i>
                    </a>
                ))}
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3">
                  <input 
                    type="email" 
                    placeholder="Email của bạn" 
                    required 
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    disabled={isSubmittingNewsletter}
                    className="p-3 rounded bg-white/10 border-none text-white outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" 
                  />
                  <button 
                    type="submit" 
                    disabled={isSubmittingNewsletter}
                    className="bg-primary py-2 rounded font-bold hover:bg-accent transition-colors disabled:bg-gray-500"
                  >
                    {isSubmittingNewsletter ? 'Đang gửi...' : 'Đăng Ký Nhận Tin'}
                  </button>
              </form>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-white/10 text-gray-400">
            <p>&copy; 2024 StudyWithMe - All Rights Reserved</p>
          </div>
        </div>
      </footer>

      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveUser}
        initialUser={user}
      />
      
      <ChatWidget user={user} onOpenProfile={() => setIsProfileModalOpen(true)} />
    </div>
  );
};

export default App;