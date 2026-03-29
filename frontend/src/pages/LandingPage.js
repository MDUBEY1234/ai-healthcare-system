// src/pages/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import TextType from '../components/UI/TextType'; // Import our new component

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 sm:px-6 py-8">
      <TextType
        as="h1"
        text={["Health Report Generation", "Advanced AI Analytics", "Your Personal Wellness Partner"]}
        typingSpeed={60}
        pauseDuration={2000}
        className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight mb-4 sm:mb-6"
        textColors={['#ffffff', '#ffffff', '#ffffff']} // Using our accent colors
      />

      <TextType
        as="p"
        text="Generate comprehensive health reports and get personalized insights with our cutting-edge AI."
        typingSpeed={40}
        initialDelay={1000} // Start after the heading has typed a bit
        loop={false}
        className="text-base sm:text-lg md:text-xl max-w-xl sm:max-w-2xl md:max-w-3xl mb-8 sm:mb-10"
        style={{ color: 'var(--text-secondary)' }}
        startOnVisible={true}
      />

      <Link
        to="/register"
        className="px-6 sm:px-8 py-3 sm:py-4 font-semibold text-white rounded-lg shadow-lg transition-all duration-300"
        style={{ background: 'var(--bg-secondary)' }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        Get Started Now
      </Link>
    </div>
  );
};

export default LandingPage;