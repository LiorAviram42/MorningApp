import React, { useEffect, useState } from 'react';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onFinish, 400); // wait for fade out
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  const handleClick = () => {
    setVisible(false);
    setTimeout(onFinish, 400);
  };

  return (
    <div 
      onClick={handleClick}
      className={`absolute inset-0 z-50 bg-[#f7efc8] flex justify-center items-center transition-opacity duration-400 cursor-pointer ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <img 
        src="/splash_screen.png" 
        alt="Splash" 
        className="w-full h-full object-cover z-10"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center z-0 bg-[#f7efc8]">
        <h1 className="text-4xl font-bold text-[#333]">בוקר טוב!</h1>
      </div>
    </div>
  );
}
