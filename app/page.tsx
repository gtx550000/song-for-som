"use client";
import { useState } from 'react';
import MusicPlayer from './components/musicPlayer';
import { Heart, Shell, Sparkles } from 'lucide-react';

const cuteMessages = [
  "อยากชวนไปเดินเตะคลื่นด้วยกันจังเลย :) 🌊",
  "ทะเลยังมีคลื่น แต่ใจเราไม่เคยมีใครนอกจากเธอนะ 🩵",
  "ถ้าเธอเป็นทะเล เรายอมเป็นปลาที่หลงทางอยู่ในใจเธอ 🐠",
  "ฟังเพลงนี้แล้วคิดถึงรอยยิ้มของเธอจังเลย 🫧",
  "อยู่ใกล้ทะเลแล้วสบายใจ แต่อยู่ใกล้เธอแล้วใจฟูที่สุดเลย ✨",
];

export default function Home() {
  const [showMessage, setShowMessage] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [heartCount, setHeartCount] = useState<number[]>([]);

  const handleHeartClick = () => {
    if (!showMessage) {
      setShowMessage(true);
    } else {
      // เมื่อกดซ้ำ ให้สลับข้อความหวานๆ ข้อความถัดไป
      setMessageIndex((prev) => (prev + 1) % cuteMessages.length);
    }

    // สร้างเอฟเฟกต์หัวใจลอยขนาดเล็ก
    const newId = Date.now();
    setHeartCount((prev) => [...prev.slice(-6), newId]);
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-cyan-100 via-blue-200 to-blue-400 flex flex-col items-center justify-center p-3 xs:p-4 sm:p-6 relative overflow-x-hidden select-none">
      
      {/* เอฟเฟกต์ฟองอากาศ/คลื่นเบื้องหลัง */}
      <div className="absolute top-6 left-6 w-28 h-28 sm:w-36 sm:h-36 bg-white/25 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-6 right-6 w-36 h-36 sm:w-48 sm:h-48 bg-cyan-300/25 rounded-full blur-3xl pointer-events-none" />

      {/* Container หลัก ปรับขนาดให้พอดีจอสมาร์ทโฟนทุกรุ่น */}
      <div className="z-10 text-center space-y-4 sm:space-y-5 max-w-[360px] sm:max-w-sm w-full bg-white/65 backdrop-blur-md p-5 sm:p-7 rounded-3xl sm:rounded-[38px] shadow-2xl border border-white/70">
        
        {/* ไอคอนเปลือกหอยและหัวข้อ */}
        <div className="relative inline-block">
          <div className="p-2.5 sm:p-3 bg-cyan-100/80 rounded-full inline-block shadow-inner">
            <Shell className="text-cyan-600 w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
          </div>
        </div>
        
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-900 leading-snug sm:leading-tight">
            ทะเลของเจ้าส้ม<br/>
            <span className="text-cyan-700"></span>
          </h1>
          <p className="text-[11px] sm:text-xs text-blue-600 mt-1.5 flex items-center justify-center gap-1">
            ลองกดที่หัวใจสิ 🩵
          </p>
        </div>

        {/* ปุ่มลูกเล่นรูปหัวใจ */}
        <div className="relative flex justify-center items-center py-1">
          <button
            onClick={handleHeartClick}
            type="button"
            className={`group bg-white hover:bg-pink-50 text-pink-400 rounded-full p-3.5 sm:p-4 transition-all duration-300 transform active:scale-90 shadow-md border border-pink-100 cursor-pointer ${
              showMessage ? 'scale-110 shadow-pink-200 shadow-lg' : 'hover:scale-105'
            }`}
            title="กดเพื่อเปิดดูข้อความในใจ"
          >
            <Heart 
              className={`w-8 h-8 sm:w-9 sm:h-9 transition-all duration-300 ${
                showMessage 
                  ? 'fill-pink-500 text-pink-500 scale-105' 
                  : 'text-pink-400 group-hover:scale-110'
              }`} 
            />
          </button>

          {/* ฟองหัวใจลอยเวลาคลิก */}
          {heartCount.map((id, index) => (
            <span
              key={id}
              className="absolute pointer-events-none text-pink-500 text-sm sm:text-base animate-ping"
              style={{
                left: `${42 + (index % 3) * 12}%`,
                top: `${index % 2 === 0 ? '-8px' : '-18px'}`,
                animationDuration: '0.8s',
              }}
            >
              💖
            </span>
          ))}
        </div>

        {/* กล่องข้อความความรู้สึก */}
        {showMessage && (
          <div className="transition-all duration-300 transform">
            <div className="bg-white/95 p-3.5 sm:p-4 rounded-2xl text-blue-900 text-xs sm:text-sm border border-pink-200/60 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-center gap-1 font-medium text-pink-600 mb-1 text-[11px] sm:text-xs">
                <Sparkles className="w-3.5 h-3.5" /> ข้อความพิเศษส่งถึงเธอ
              </div>
              <p className="leading-relaxed font-normal">
                {cuteMessages[messageIndex]}
              </p>
              <div className="text-[10px] text-blue-400 mt-2">
                (กดที่หัวใจอีกครั้งเพื่อเปลี่ยนข้อความ ✨)
              </div>
            </div>
          </div>
        )}

        {/* เรียกใช้งาน Music Player (พร้อม Volume Slider) */}
        <MusicPlayer />
      </div>

      <footer className="mt-4 sm:mt-6 text-[11px] text-blue-900/60 text-center z-10">
        สร้างด้วยความรู้สึกดีๆ 🌊 | ฟังเพลงไปด้วยกันนะ (จากพี่กลอน)
      </footer>
    </div>
  );
}