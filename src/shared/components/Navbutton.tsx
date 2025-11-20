import React, { useState } from 'react';
interface NavButtonProps {
    icon: React.ReactNode;
    label: string;
    primary?: boolean;
  }
  
export default function NavButton({ icon, label, primary = false }: NavButtonProps): JSX.Element {
    const [isHovered, setIsHovered] = useState<boolean>(false);
  
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          background: primary ? '#FF8C00' : (isHovered ? '#FFFAF0' : 'transparent'),
          color: primary ? '#FFFFFF' : '#333333',
          border: primary ? 'none' : '1px solid #FFD700',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 4px 12px rgba(255, 140, 0, 0.15)' : 'none'
        }}
      >
        {icon}
        <span>{label}</span>
      </div>
    );
}