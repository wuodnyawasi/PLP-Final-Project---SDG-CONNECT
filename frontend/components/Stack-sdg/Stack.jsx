import React from 'react'
import './Stack.css'
import sdg1 from '../../src/assets/sdg1.png'
import sdg2 from '../../src/assets/sdg2.png'
import sdg3 from '../../src/assets/sdg3.png'
import sdg4 from '../../src/assets/sdg4.png'
import sdg5 from '../../src/assets/sdg5.png'
import sdg6 from '../../src/assets/sdg6.png'
import sdg7 from '../../src/assets/sdg7.png'
import sdg8 from '../../src/assets/sdg8.png'
import sdg9 from '../../src/assets/sdg9.png'
import sdg10 from '../../src/assets/sdg10.png'
import sdg11 from '../../src/assets/sdg11.png'
import sdg12 from '../../src/assets/sdg12.png'
import sdg13 from '../../src/assets/sdg13.png'
import sdg14 from '../../src/assets/sdg14.png'
import sdg15 from '../../src/assets/sdg15.png'
import sdg16 from '../../src/assets/sdg16.png'
import sdg17 from '../../src/assets/sdg17.png'

const sdgImages = [
  sdg1, sdg2, sdg3, sdg4, sdg5,
  sdg6, sdg7, sdg8, sdg9, sdg10,
  sdg11, sdg12, sdg13, sdg14, sdg15,
  sdg16, sdg17
];

const Stack = () => {
  if (sdgImages.length === 0) {
    return null;
  }

  return (
    // This is the main container that will be rotated 45 degrees
    <div className="sdg-diamond-container">
      {sdgImages.map((src, index) => (
        // Each image wrapper will be a square within the grid
        <div key={index} className="sdg-diamond-item">
          <img src={src} alt={`SDG ${index + 1}`} className="sdg-diamond-img" />
        </div>
      ))}
    </div>
  );
};

export default Stack;