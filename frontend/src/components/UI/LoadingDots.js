// src/components/UI/LoadingDots.js
import React from 'react';
import { motion } from 'framer-motion';
import Avatar from 'react-avatar'; // <-- THE MISSING LINE

const loadingContainerVariants = {
  start: { transition: { staggerChildren: 0.1 } },
  end: { transition: { staggerChildren: 0.1 } },
};

const loadingCircleVariants = {
  start: { y: "0%" },
  end: { y: "100%" },
};

const loadingCircleTransition = {
    duration: 0.4,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut'
}

const LoadingDots = () => {
  return (
    <motion.div 
        className="message-row other-message"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
      <div className="avatar-container">
        <Avatar name="AI" size="40" round={true} color="#2563eb" />
      </div>
      <div className="message-bubble other-bubble" style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
        <motion.div
            style={{ width: '40px', height: '10px', display: 'flex', justifyContent: 'space-around' }}
            variants={loadingContainerVariants}
            initial="start"
            animate="end"
        >
          <motion.span style={{ display: 'block', width: '8px', height: '8px', backgroundColor: '#9ca3af', borderRadius: '50%' }} variants={loadingCircleVariants} transition={loadingCircleTransition} />
          <motion.span style={{ display: 'block', width: '8px', height: '8px', backgroundColor: '#9ca3af', borderRadius: '50%' }} variants={loadingCircleVariants} transition={loadingCircleTransition} />
          <motion.span style={{ display: 'block', width: '8px', height: '8px', backgroundColor: '#9ca3af', borderRadius: '50%' }} variants={loadingCircleVariants} transition={loadingCircleTransition} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingDots;