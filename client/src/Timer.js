import React, { useEffect, useState } from 'react';

const Timer = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="timer-container">
      <div className="timer-time">
        <span role="img" aria-label="clock">🕒</span> {formattedTime}
      </div>
      <div className="timer-date">
        <span role="img" aria-label="calendar">📅</span> {formattedDate}
      </div>
    </div>
  );
};

export default Timer;
