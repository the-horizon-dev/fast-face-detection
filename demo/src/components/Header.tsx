import React from 'react';

const Header = () => {
  return (
    <header className="bg-primary text-white text-center py-8 shadow-md">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2">Fast Face Detection</h1>
        <p className="text-lg">Demonstração do pacote de detecção facial com TensorFlow.js e React</p>
      </div>
    </header>
  );
};

export default Header; 