import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M100 63.58L1.5 0V102.74H198.5V0L100 63.58Z" fill="currentColor" />
    <path
      d="M100 200L198.5 102.74L100 63.58L1.5 102.74L100 200Z"
      fill="#888888"
    />
    <path
      d="M78.3896 178.66L99.9996 200L121.61 178.66L99.9996 157.18L78.3896 178.66Z"
      fill="currentColor"
    />
    <path
      d="M1.5 102.74L100 63.58L198.5 102.74L100 157.18L1.5 102.74Z"
      fill="currentColor"
      className="text-neutral-800"
    />
  </svg>
);

export default Logo;