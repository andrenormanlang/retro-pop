'use client'

import Image from 'next/image';
import React, { CSSProperties, useState } from 'react';
import logo from '../../../public/logo.svg'; // Update the path to your actual logo file

const RetroPopLogo: React.FC = () => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const logoStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    transition: 'transform 0.3s ease-in-out',
    transform: isHovered ? 'scale(1.5)' : 'scale(1)',
  };

  return (
    <div
      style={logoStyle}
      onMouseOver={() => {
        setIsHovered(true);
      }}
      onMouseOut={() => {
        setIsHovered(false);
      }}
    >
      <Image src={logo} alt="Retro Pop Logo" width={85} height={85} />
    </div>
  );
};


export default RetroPopLogo;