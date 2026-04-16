import { motion } from 'framer-motion';

export function LogoGakha({ className = "", color = "#013220", showText = true }: { className?: string; color?: string; showText?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Triple Leaf Emblem - Recreated based on user image */}
        <path
          d="M50 85C50 85 58.5 76.5 64 69C69.5 61.5 73.5 52.5 74.5 42C75.5 31.5 71 21 71 21C71 21 64.5 28 60 36C55.5 44 52 53.5 50 62C48 53.5 44.5 44 40 36C35.5 28 29 21 29 21C29 21 24.5 31.5 25.5 42C26.5 52.5 30.5 61.5 36 69C41.5 76.5 50 85 50 85Z"
          fill={color}
        />
        <path
          d="M50 10C50 10 58.5 23.5 62.5 38.5C66.5 53.5 64 74.5 50 85C36 74.5 33.5 53.5 37.5 38.5C41.5 23.5 50 10 50 10Z"
          fill={color}
        />
        
        {/* Vein details - cutouts or overlay lines */}
        <path
          d="M50 20V78"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M35 35C30 45 32 60 40 75"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M65 35C70 45 68 60 60 75"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>
      
      {showText && (
        <span 
          className="text-current font-black tracking-tighter uppercase leading-none"
          style={{ 
            fontFamily: "'Inter', sans-serif", 
            fontSize: '1.2em',
            transform: 'scaleY(1.4)', // Matching the condensed look
            color: color
          }}
        >
          GAKHA
        </span>
      )}
    </div>
  );
}
