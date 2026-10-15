"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Music, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Link as LinkIcon, 
  Plus 
} from 'lucide-react';

interface Song {
  id: number;
  title: string;
  src: string;
}

// ลิงก์เพลงเริ่มต้น (สามารถใส่ได้ทั้ง YouTube URL และไฟล์ mp3)
const initialSongs: Song[] = [
  { id: 1, title: "1-100 - tattoo colour", src: "https://youtu.be/pt-0LgCVcUI" },
  { id: 2, title: "โปรดส่งใครมารักฉันที - อินสติงค์", src: "https://youtu.be/EDF7riZLhNA?si=ZHEJFNrI_os85nD3" },
  { id: 3, title: "โต๊ะริม - NONT TANONT", src: "https://youtu.be/XqQMisU5En8?si=TgbaW7y7w2_ZbBjW" },
  { id: 4, title: "กลิ่นดอกไม้ - Newery", src: "https://youtu.be/71KuVORecY8?si=_gJh1I9J3JB7pQE2" },
  { id: 5, title: "ทรายกับทะเล", src: "https://youtu.be/dMpBjCNZE0c?si=nO6raMwVqka2_TrX" },
];

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleaned = url.replace(/^\/music\//, '').trim();
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = cleaned.match(regExp);
  if (match && match[1]) {
    return match[1];
  }
  if (/^[\w-]{11}$/.test(cleaned)) {
    return cleaned;
  }
  return null;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export default function MusicPlayer() {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isYTReady, setIsYTReady] = useState(false);
  
  // จัดการระดับเสียง (0 - 100)
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(50);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const playerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeSong = songs[currentSong] || songs[0];
  const ytId = extractYouTubeId(activeSong.src);
  const isYouTube = !!ytId;

  // โหลด YouTube IFrame API
  useEffect(() => {
    if (typeof window === "undefined") return;

    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      
      const currentYtId = extractYouTubeId(songs[0]?.src) || "pt-0LgCVcUI";
      playerRef.current = new window.YT.Player('yt-audio-player', {
        height: '1',
        width: '1',
        videoId: currentYtId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            setIsYTReady(true);
            try {
              playerRef.current?.setVolume(volume);
            } catch (_) {}
          },
          onStateChange: (event: any) => {
            // PLAYING = 1, PAUSED = 2, BUFFERING = 3, ENDED = 0
            if (event.data === 1) {
              setIsPlaying(true);
              setIsLoading(false);
            } else if (event.data === 2) {
              setIsPlaying(false);
              setIsLoading(false);
            } else if (event.data === 3) {
              setIsLoading(true);
            } else if (event.data === 0) {
              nextSong();
            }
          },
          onError: () => {
            setIsLoading(false);
            setIsPlaying(false);
          }
        },
      });
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }
      window.onYouTubeIframeAPIReady = () => {
        setupPlayer();
      };
    }
  }, []);

  // ฟังก์ชันปรับระดับเสียง
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }

    // ปรับเสียง YouTube
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        if (newVol === 0) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
          playerRef.current.setVolume(newVol);
        }
      } catch (_) {}
    }

    // ปรับเสียง HTML Audio
    if (audioRef.current) {
      audioRef.current.volume = newVol / 100;
      audioRef.current.muted = (newVol === 0);
    }
  };

  // ฟังก์ชันเปิด/ปิดเสียง (Mute Toggle)
  const toggleMute = () => {
    if (isMuted) {
      const restored = prevVolume > 0 ? prevVolume : 50;
      setIsMuted(false);
      handleVolumeChange(restored);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      if (playerRef.current && typeof playerRef.current.mute === 'function') {
        try {
          playerRef.current.mute();
        } catch (_) {}
      }
      if (audioRef.current) {
        audioRef.current.muted = true;
      }
    }
  };

  // เปลี่ยนเพลง
  const loadAndPlaySong = useCallback((index: number, shouldPlay = true) => {
    const targetSong = songs[index];
    if (!targetSong) return;

    const videoId = extractYouTubeId(targetSong.src);

    if (videoId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        setIsLoading(true);
        try {
          playerRef.current.setVolume(isMuted ? 0 : volume);
        } catch (_) {}

        if (shouldPlay) {
          playerRef.current.loadVideoById(videoId);
          playerRef.current.playVideo();
          setIsPlaying(true);
        } else {
          playerRef.current.cueVideoById(videoId);
          setIsPlaying(false);
        }
      }
    } else {
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }

      if (audioRef.current) {
        audioRef.current.src = targetSong.src;
        audioRef.current.volume = isMuted ? 0 : volume / 100;
        audioRef.current.muted = isMuted;
        if (shouldPlay) {
          audioRef.current.play().catch(() => setIsPlaying(false));
          setIsPlaying(true);
        }
      }
    }
  }, [songs, volume, isMuted]);

  const togglePlay = () => {
    if (isYouTube) {
      if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') {
        return;
      }
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        try {
          playerRef.current.setVolume(isMuted ? 0 : volume);
        } catch (_) {}
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current) {
          audioRef.current.volume = isMuted ? 0 : volume / 100;
        }
        audioRef.current?.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
      }
    }
  };

  const nextSong = () => {
    const nextIndex = (currentSong + 1) % songs.length;
    setCurrentSong(nextIndex);
    loadAndPlaySong(nextIndex, true);
  };

  const prevSong = () => {
    const prevIndex = (currentSong - 1 + songs.length) % songs.length;
    setCurrentSong(prevIndex);
    loadAndPlaySong(prevIndex, true);
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    const songId = extractYouTubeId(newUrl);
    if (!songId && !newUrl.endsWith(".mp3")) {
      alert("กรุณากรอกลิงก์ YouTube ที่ถูกต้อง เช่น https://youtu.be/... หรือ https://www.youtube.com/watch?v=...");
      return;
    }
    const newSongItem: Song = {
      id: Date.now(),
      title: newTitle.trim() || `เพลงโปรดที่เธอชอบ #${songs.length + 1}`,
      src: newUrl.trim(),
    };
    const updated = [...songs, newSongItem];
    setSongs(updated);
    setCurrentSong(updated.length - 1);
    loadAndPlaySong(updated.length - 1, true);
    setNewTitle("");
    setNewUrl("");
    setShowAddModal(false);
  };

  return (
    <div className="bg-gradient-to-b from-blue-50/90 to-cyan-50/90 p-4 sm:p-5 rounded-3xl mt-4 sm:mt-6 border border-blue-200/70 shadow-md w-full relative">
      {/* ส่วนหัวแสดงชื่อเพลง */}
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center space-x-2 overflow-hidden flex-1 mr-2">
          <div className={`p-1.5 rounded-full shrink-0 ${isPlaying ? 'bg-cyan-500 text-white animate-spin' : 'bg-blue-100 text-blue-500'}`}>
            <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="text-left overflow-hidden">
            <span className="text-xs sm:text-sm font-semibold text-blue-800 line-clamp-1 block">
              {activeSong.title}
            </span>
            <span className="text-[10px] text-blue-500 block truncate">
              {isLoading ? "กำลังโหลดเพลง..." : isPlaying ? "กำลังเปิดให้ฟังนะ 🩵" : "กดปุ่มเล่นเพื่อฟังเพลง"}
            </span>
          </div>
        </div>

        {/* ปุ่มเพิ่มลิงก์ YouTube ของเราเอง */}
        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="text-blue-500 hover:text-blue-700 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full border border-blue-100 shadow-2xs transition shrink-0 active:scale-95"
          title="เพิ่มเพลงจาก YouTube"
          type="button"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* คลื่นเสียงน่ารักเวลาเล่น */}
      <div className="flex justify-center items-center gap-1 my-2.5 h-3.5">
        {[40, 70, 100, 60, 90, 50, 80].map((height, i) => (
          <span
            key={i}
            className={`w-1 bg-cyan-400 rounded-full transition-all duration-300 ${
              isPlaying ? 'animate-pulse' : 'opacity-30'
            }`}
            style={{
              height: isPlaying ? `${height}%` : '20%',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* ปุ่มควบคุม Playback */}
      <div className="flex justify-center items-center space-x-5 sm:space-x-6 my-1">
        <button 
          onClick={prevSong} 
          className="p-2 text-blue-500 hover:text-blue-700 transition active:scale-90"
          type="button"
          aria-label="Previous song"
        >
          <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button 
          onClick={togglePlay} 
          disabled={isYouTube && !isYTReady}
          className="bg-gradient-to-tr from-cyan-500 to-blue-500 text-white p-3.5 sm:p-4 rounded-full hover:from-cyan-600 hover:to-blue-600 transition shadow-md active:scale-95 disabled:opacity-50"
          type="button"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
          )}
        </button>

        <button 
          onClick={nextSong} 
          className="p-2 text-blue-500 hover:text-blue-700 transition active:scale-90"
          type="button"
          aria-label="Next song"
        >
          <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* แถบปรับระดับเสียงแบบเลื่อน (Volume Slider) รองรับจอมือถือ */}
      <div className="mt-3.5 pt-2.5 border-t border-blue-200/50">
        <div className="flex items-center gap-2 px-2 py-1.5 bg-white/70 backdrop-blur-xs rounded-2xl border border-blue-100 shadow-2xs">
          <button
            type="button"
            onClick={toggleMute}
            className="text-blue-500 hover:text-cyan-600 transition p-1 shrink-0 active:scale-90"
            title={isMuted ? "เปิดเสียง" : "ปิดเสียง"}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-gray-400" />
            ) : volume < 50 ? (
              <Volume1 className="w-4 h-4 text-cyan-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-600" />
            )}
          </button>

          {/* Slider input เลื่อนระดับเสียง */}
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-600 transition touch-pan-x"
            aria-label="Volume Slider"
          />

          <span className="text-[10px] font-mono font-medium text-blue-700/80 min-w-[30px] text-right shrink-0">
            {isMuted ? "0%" : `${volume}%`}
          </span>
        </div>
      </div>

      {/* กล่องใส่ลิงก์เพลง YouTube เพิ่มเติม */}
      {showAddModal && (
        <form onSubmit={handleAddSong} className="mt-3.5 pt-3 border-t border-blue-200/60 text-left space-y-2">
          <p className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
            <LinkIcon className="w-3 h-3" /> ใส่ลิงก์ YouTube เพลงที่อยากให้เธอฟัง:
          </p>
          <input
            type="text"
            placeholder="ชื่อเพลง (เช่น เพลงของเรา)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-blue-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-blue-900"
          />
          <input
            type="text"
            placeholder="วางลิงก์ YouTube (https://youtu.be/...)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            required
            className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-blue-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-blue-900"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-xs px-2.5 py-1 text-gray-500 hover:text-gray-700 active:scale-95"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="text-xs px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg shadow-xs font-medium active:scale-95"
            >
              เพิ่มและเปิดฟังเลย
            </button>
          </div>
        </form>
      )}

      {/* YouTube IFrame ซ่อนอยู่เบื้องหลังเพื่อเล่นเพลง */}
      <div className="absolute -top-[9999px] -left-[9999px] opacity-0 pointer-events-none w-1 h-1 overflow-hidden" aria-hidden="true">
        <div id="yt-audio-player" />
      </div>

      {/* รองรับไฟล์เสียง direct mp3 ปกติ */}
      <audio
        ref={audioRef}
        onEnded={nextSong}
      />
    </div>
  );
}