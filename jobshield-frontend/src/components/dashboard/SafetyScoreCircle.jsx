import React, { useState, useEffect } from 'react';

const SafetyScoreCircle = ({ score = 100, loading = false, inverted = false }) => {
  const [displayScore, setDisplayScore] = useState(0);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (loading) return;

    const targetScore = Math.max(0, Math.min(100, score ?? 0));
    let current = 0;
    const duration = 1500; // 1.5s
    const steps = 30;
    const increment = targetScore / steps;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setDisplayScore(targetScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [score, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 animate-pulse">
        <div className="w-36 h-36 rounded-full bg-gray-100 flex items-center justify-center" />
        <div className="h-4 w-24 bg-gray-200 rounded mt-4" />
      </div>
    );
  }

  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  let strokeColor;
  let statusText;
  let textColor;

  if (!inverted) {
    // Normal Safety Score: 100 is best
    if (displayScore <= 40) {
      strokeColor = '#EF4444';
      statusText = 'HIGH RISK';
      textColor = 'text-red-600';
    } else if (displayScore <= 70) {
      strokeColor = '#EAB308';
      statusText = 'STAY ALERT';
      textColor = 'text-yellow-600';
    } else {
      strokeColor = '#22C55E';
      statusText = 'GREAT JOB!';
      textColor = 'text-green-600';
    }
  } else {
    // Inverted Risk Score: 100 is worst
    if (displayScore <= 30) {
      strokeColor = '#22C55E';
      statusText = 'LOW RISK';
      textColor = 'text-green-600';
    } else if (displayScore <= 70) {
      strokeColor = '#EAB308';
      statusText = 'MEDIUM RISK';
      textColor = 'text-yellow-600';
    } else {
      strokeColor = '#EF4444';
      statusText = 'HIGH RISK';
      textColor = 'text-red-600';
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-gray-900 tracking-tight">
            {displayScore}%
          </span>
          <span className="text-[10px] uppercase font-bold text-gray-400 -mt-0.5">
            {inverted ? 'Risk Score' : 'Safety Score'}
          </span>
        </div>
      </div>

      {/* Label below circle */}
      <span className={`mt-3 text-xs font-black tracking-wider uppercase ${textColor}`}>
        {statusText}
      </span>
    </div>
  );
};

export default SafetyScoreCircle;
