import React from 'react'
import './SDGGrid.css'
import { sdgImages } from '../../src/assets/assets'


const SDGGrid = () => {
  // Convert object to array to loop
  const images = Object.values(sdgImages);

  return (
    <div className="sdg-grid">
      {images.map((img, idx) => (
        <div key={idx} className="sdg-item">
          <img src={img} alt={`SDG ${idx + 1}`} />
        </div>
      ))}
    </div>
  );
};

export default SDGGrid;


