import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-primary text-white text-center py-6 mt-auto">
      <div className="container mx-auto px-4">
        <p>
          &copy; {new Date().getFullYear()} Fast Face Detection - {' '}
          <a 
            href="https://github.com/thehorizon-dev/fast-face-rekognition" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-white/80 transition-colors"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer; 