import React, { useState } from 'react';
import { LogOut } from 'lucide-react';

interface ProfileButtonProps {
  onLogoutClick?: () => void;
}

export default function ProfileButton({ onLogoutClick }: ProfileButtonProps): JSX.Element {
    const [isHovered, setIsHovered] = useState<boolean>(false);
  
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            background: isHovered ? '#FFFAF0' : 'transparent',
            border: '1px solid #FFD700',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF8C00, #FFD700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            CM
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#333333' }}>
              Chef Marco
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#999999' }}>
              Head Chef
            </p>
          </div>
        </button>
        
        <button
          onClick={onLogoutClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            background: 'transparent',
            border: '1px solid #FFD700',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#999999',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = '#FFFAF0';
            e.currentTarget.style.color = '#FF8C00';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#999999';
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }