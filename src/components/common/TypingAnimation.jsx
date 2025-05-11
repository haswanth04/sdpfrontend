import { useState, useEffect } from 'react';

const TypingAnimation = () => {
  const [text, setText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  const lines = [
    "Welcome to ExamPro",
    "Preparing secure environment...",
    "Loading question bank...",
    "Initializing user profiles...",
    "System ready for assessment",
    "Login to continue..."
  ];

  useEffect(() => {
    // Typing effect
    if (currentLine < lines.length) {
      const line = lines[currentLine];
      
      if (currentIndex < line.length) {
        const timer = setTimeout(() => {
          setText(prev => prev + line[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, Math.random() * 100 + 50); // Random typing speed for realism
        
        return () => clearTimeout(timer);
      } else {
        // Move to next line after delay
        const timer = setTimeout(() => {
          setText(prev => prev + '\n');
          setCurrentLine(prev => prev + 1);
          setCurrentIndex(0);
        }, 1000); // Pause at end of line
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentIndex, currentLine]);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="terminal-container bg-gray-900 text-green-500 p-6 rounded-lg shadow-md font-mono text-sm overflow-hidden">
      <div className="terminal-header flex items-center mb-2">
        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
        <div className="flex-1 text-center text-xs text-gray-400">terminal</div>
      </div>
      <div className="terminal-content">
        <pre className="whitespace-pre-line">
          {text}
          {cursorVisible && <span className="animate-pulse">▌</span>}
        </pre>
      </div>
    </div>
  );
};

export default TypingAnimation; 