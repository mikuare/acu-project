import { useEffect, useState } from 'react';
import AnimatedEarth from './AnimatedEarth';

interface LandingPageProps {
  onComplete: () => void;
}

const LandingPage = ({ onComplete }: LandingPageProps) => {
  const [showText, setShowText] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    // Show text after 500ms
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 500);

    // Show subtitle after 800ms
    const subtitleTimer = setTimeout(() => {
      setShowSubtitle(true);
    }, 800);

    // Complete after 2 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(subtitleTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* Animated Earth */}
        <div className="relative">
          <AnimatedEarth />
          {/* Glow effect behind Earth */}
          <div className="absolute inset-0 -z-10 bg-blue-500/20 rounded-full blur-3xl scale-150 animate-pulse" />
        </div>

        {/* Main title */}
        <div className="text-center space-y-4">
          <h1
            className={`text-6xl md:text-8xl font-bold text-white transition-all duration-1000 transform ${
              showText 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{
              background: 'linear-gradient(135deg, #60a5fa, #3b82f6, #1d4ed8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(59, 130, 246, 0.5)',
            }}
          >
            Acumatica
          </h1>

          {/* Subtitle */}
          <div
            className={`transition-all duration-1000 delay-300 transform ${
              showSubtitle 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-2xl md:text-4xl font-light text-blue-200 mb-2">
              Project
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto rounded-full" />
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center space-x-2 text-blue-300">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
    </div>
  );
};

export default LandingPage;
