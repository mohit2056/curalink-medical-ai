import React from 'react';
import { useLottie } from 'lottie-react'; // Hook use kar rahe hain ab
import animationData from '../assets/animation.json'; 

const MedicalAnimation = () => {
  // Animation ki settings
  const options = {
    animationData: animationData,
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(options);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* View directly render karega bina import component crash ke */}
      <div style={{ width: '100%', maxWidth: '450px' }}>
        {View}
      </div>
    </div>
  );
};

export default MedicalAnimation;