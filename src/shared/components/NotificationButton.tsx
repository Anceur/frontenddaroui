import React, { useState } from 'react';
import { Bell } from 'lucide-react';

interface NotificationButtonProps {
    count: number;
  }
export default function NotificationButton({ count }: NotificationButtonProps): JSX.Element {
    const [isHovered, setIsHovered] = useState<boolean>(false);
  
    return (
      <button
        aria-label={`Afficher les notifications (${count})`}
        title="Afficher les notifications"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '42px',
          height: '42px',
          background: isHovered ? '#FFFAF0' : 'transparent',
          border: '1px solid #FFD700',
          borderRadius: '8px',
          cursor: 'pointer',
          color: '#FF8C00',
          transition: 'all 0.3s ease'
        }}
      >
        <Bell size={18} />
        {count > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#FF8C00',
            color: '#FFFFFF',
            borderRadius: '10px',
            padding: '2px 6px',
            fontSize: '11px',
            fontWeight: 'bold',
            minWidth: '20px',
            textAlign: 'center'
          }}>
            {count}
          </span>
        )}
      </button>
    );
  }