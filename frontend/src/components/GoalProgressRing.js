import React from 'react';

const GoalProgressRing = ({ percent, achieved }) => {
  const radius = 32;
  const stroke = 7;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.min(100, Math.max(0, percent));
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg height={radius * 2} width={radius * 2} style={{ marginRight: 8 }}>
      <circle
        stroke="#E5E7EB"
        fill="none"
        strokeWidth={stroke}
        cx={radius}
        cy={radius}
        r={normalizedRadius}
      />
      <circle
        stroke={achieved ? '#10B981' : '#3B82F6'}
        fill="none"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,2,.6,1)' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.35em"
        fontSize="16"
        fontWeight="bold"
        fill={achieved ? '#10B981' : '#3B82F6'}
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
};

export default GoalProgressRing; 