import React from 'react';
import './About.css';
import { FaHandsHelping, FaGlobe, FaLightbulb, FaExchangeAlt, FaBalanceScale } from 'react-icons/fa';



const AboutUs = () => {
    return (
        <div className="about-page-container">
            
            {/* --- Hero/Header Section --- */}
            <header className="about-header">
                <FaGlobe className="header-icon" />
                <h1>Bridging Global Goals with Local Action</h1>
                <p>
                    **SDG Connect** is the platform dedicated to localizing the 17 Sustainable Development Goals (SDGs). We empower citizens, communities, and organizations to drive tangible, sustainable change right where they live.
                </p>
            </header>
            
            <div className="about-content">
                
                {/* --- Section 1: Our Mission --- */}
                <section className="mission-section">
                    <h2>Our Core Mission</h2>
                    <p className="mission-text-long">
                        The scale of global challenges can feel overwhelming. We exist to simplify the process: connecting passion with purpose. By focusing on localized projects—from cleaning a street to funding a classroom—we turn global aspirations into measurable, local realities, ensuring no community is left behind in the journey to 2030.
                    </p>
                </section>

                {/* --- Section 2: The Three Pillars --- */}
                <section className="pillars-section">
                    <h2>The Three Pillars of SDG Connect</h2>
                    
                    <div className="pillar-cards-container">
                        
                        <div className="pillar-card">
                            <FaHandsHelping className="pillar-icon" />
                            <h4>Collaboration & Local Action</h4>
                            <p>We provide the tools to organize and join hands-on projects, like tree-planting drives and market clean-ups. Find volunteers, organize events, and turn community spirit into collective impact (Goals 11, 13).</p>
                        </div>
                        
                        <div className="pillar-card">
                            <FaExchangeAlt className="pillar-icon" />
                            <h4>Resource Mobilization</h4>
                            <p>Facilitate the sharing of resources—from financial donations (e.g., school fees) to in-kind support (e.g., building materials). We connect needs directly with those who can provide them (Goals 4, 9).</p>
                        </div>
                        
                        <div className="pillar-card">
                            <FaBalanceScale className="pillar-icon" />
                            <h4>Community Conflict Resolution</h4>
                            <p>Our platform enables communities to safely connect, communicate, and collaboratively work towards resolving local issues and conflicts, promoting peaceful and inclusive societies (Goal 16).</p>
                        </div>
                        
                    </div>
                </section>

                {/* --- Section 3: The Call to Action --- */}
                <section className="cta-section">
                    <h2>Join the Movement</h2>
                    <p>
                        Whether you are a seasoned NGO, a local business, or an individual wanting to make a difference, your journey to impact starts here. We are the mechanism for **Goal 17: Partnerships for the Goals**.
                    </p>
                    <a href="/projects" className="cta-button">Find a Local Project</a>
                    <a href="/donate" className="cta-button secondary-cta">Share Resources</a>
                </section>

            </div>
        </div>
    );
};

export default AboutUs;