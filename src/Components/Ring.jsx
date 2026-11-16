import React from "react";
import { motion } from "motion/react";

// A progress ring. The arc springs from wherever it currently is to the new
// value, so rapid changes (adding several foods) never restart the animation.
function Ring({ value, goal, color, stroke = 18, label, children }) {
  const size = 200;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = goal > 0 ? Math.min(value / goal, 1) : 0;

  return (
    <div className="ring" role="img" aria-label={label}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeOpacity="0.16"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: circumference, opacity: 0 }}
          animate={{
            strokeDashoffset: circumference * (1 - progress),
            opacity: progress > 0 ? 1 : 0,
          }}
          transition={{ type: "spring", bounce: 0, duration: 0.8 }}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}

export default Ring;
