import React from 'react';

const KitchenDisplay: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-title)', color: '#FF8C00' }}>
        Kitchen Display
      </h1>
      {/* Add your kitchen display content here */}
      <div className="bg-white rounded-lg shadow p-6">
        <p>Kitchen display system content will go here...</p>
      </div>
    </div>
  );
};

export default KitchenDisplay;