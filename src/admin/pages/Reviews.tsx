import React from 'react';

const Reviews: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-title)', color: '#FF8C00' }}>
        Avis des clients
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p>Le contenu des avis et des retours des clients sera affiché ici...</p>
      </div>
    </div>
  );
};

export default Reviews;