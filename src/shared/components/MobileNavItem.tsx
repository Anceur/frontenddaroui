import React from 'react';

interface MobileNavItemProps {
    icon: React.ReactNode;
    label: string;
    primary?: boolean;
    badge?: number | null;
  }
  
export default function MobileNavItem({ icon, label, primary = false, badge = null }: MobileNavItemProps): JSX.Element {
    return (
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '14px 16px',
          background: primary ? '#FF8C00' : 'transparent',
          color: primary ? '#FFFFFF' : '#333333',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: '500',
          marginBottom: '8px',
          transition: 'all 0.2s ease'
        }}
        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.background = primary ? '#e67e00' : '#FFFAF0';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {icon}
          <span>{label}</span>
        </div>
        {badge && (
          <span style={{
            background: primary ? '#FFFFFF' : '#FF8C00',
            color: primary ? '#FF8C00' : '#FFFFFF',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {badge}
          </span>
        )}
      </button>
    );
  }