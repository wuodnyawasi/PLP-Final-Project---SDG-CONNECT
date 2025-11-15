import React, { useState } from 'react'; // <-- FIX: ADDED { useState } HERE
import './Home.css';
import Header from '../../components/Header/Header';
import SDGGrid from '../../components/ExplorerImages/SDGGrid';
import DonationModal from '../../components/modal/DonationModal';


const Home = () => {
  // State is now correctly defined because useState is imported
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div>
      <Header />

      <div className="home-body-container-tile">
        <div className="home-body-container">

          {/* === Left Text/CTA Column === */}
          <div className="subTitle">

            <h2 className="section-title">Connect. Collaborate. Achieve the UN SDGs.</h2>

            <p className="main-pitch">
              SDG Connect is the dynamic platform uniting individuals, communities, and organizations to partner on projects that drive global change. The time for passive support is over. Every resource, every hour, and every partnership counts.
            </p>

            <div className="cta-buttons">
              <a href="/projects" className="explore-btn explore-prj">Find Local Projects</a>
              <button
                  onClick={() => setIsModalOpen(true)} // Opens the modal
                  className="explore-btn explore-rs"
              >
                  Offer Resources
              </button>
            </div>

            {/* Modal is rendered inside the subTitle column */}
            <DonationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

          </div> {/* Closes subTitle */}

          {/* === Right SDG Grid Column === */}
          <div className="gridContainer">
            <SDGGrid />
          </div>

        </div> {/* Closes home-body-container */}
      </div> {/* Closes home-body-container-tile */}
      
    </div> // Closes the main div
  );
};

export default Home;