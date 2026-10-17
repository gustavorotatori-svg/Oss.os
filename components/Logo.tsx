import React, { useId } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const OssLogo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const textSizes = {
    sm: "text-base md:text-lg",
    md: "text-xl md:text-2xl",
    lg: "text-4xl md:text-5xl",
    xl: "text-5xl md:text-7xl"
  };

  return (
    <div translate="no" className={`flex items-center gap-2 notranslate ${className}`}>
      <span className={`font-black uppercase tracking-tighter leading-none italic -skew-x-6 ${textSizes[size]}`}>
        OSS<span className="text-green-600">.</span>OS
      </span>
      {size === 'lg' || size === 'xl' ? (
        <div className="flex flex-col gap-0.5 opacity-50">
          <div className="w-4 h-[1px] bg-current" />
          <div className="w-2 h-[1px] bg-zinc-500" />
        </div>
      ) : null}
    </div>
  );
};
