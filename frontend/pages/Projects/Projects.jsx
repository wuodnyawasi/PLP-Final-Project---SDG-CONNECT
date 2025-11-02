import React from 'react';
import './Projects.css';
import { 
    FaFilter, FaSearch, FaMapMarkerAlt, FaClock, 
    FaHandsHelping, FaCheckCircle, FaTag 
} from 'react-icons/fa';

// --- Placeholder Project Data (Simulates DB Population) ---
const projects = [
    {
        id: 1,
        title: "Community Clean-Up: Kibera Market",
        sdgId: 11, // SDG 11: Sustainable Cities
        sdgColor: '#fd9d24',
        type: "Event",
        location: "Nairobi, Kenya",
        shortDescription: "Join us for a massive Saturday clean-up to improve sanitation and waste management.",
        slotsAvailable: 25,
        imageUrl: 'cleanup_thumb.jpg',
    },
    {
        id: 2,
        title: "STEM Tutoring for Girls",
        sdgId: 4, // SDG 4: Quality Education
        sdgColor: '#c5192d',
        type: "Project",
        location: "Accra, Ghana",
        shortDescription: "Weekly tutoring sessions to empower young girls in underserved schools with STEM skills.",
        slotsAvailable: 5,
        imageUrl: 'tutoring_thumb.jpg',
    },
    {
        id: 3,
        title: "Water Well Drilling Fundraiser",
        sdgId: 6, // SDG 6: Clean Water
        sdgColor: '#26bde2',
        type: "Donation Drive",
        location: "Rural Mandera, Kenya",
        shortDescription: "Raise funds for a new borewell providing clean water to 300 families.",
        slotsAvailable: null, // No volunteer slots, donation focused
        imageUrl: 'water_well_thumb.jpg',
    },
    {
        id: 4,
        title: "Local Peace Mediation Workshop",
        sdgId: 16, // SDG 16: Peace and Justice
        sdgColor: '#00689d',
        type: "Event",
        location: "Lagos, Nigeria",
        shortDescription: "A conflict resolution workshop aimed at promoting dialogue between community leaders.",
        slotsAvailable: 10,
        imageUrl: 'peace_thumb.jpg',
    },
    // Add more projects here...
];

const ProjectListing = () => {
    // In a real application, you would use React state for filters/search
    // const [filteredProjects, setFilteredProjects] = useState(projects);

    return (
        <div className="project-listing-container">
            
            {/* --- Header & Search Banner --- */}
            <header className="listing-header">
                <h1>Find Your Next Impact Opportunity</h1>
                <p>Browse local actions aligned with the UN Sustainable Development Goals.</p>
                <div className="search-bar">
                    <input type="text" placeholder="Search by title, location, or keyword..." />
                    <button className="search-button"><FaSearch /> Search</button>
                    <button className="filter-button"><FaFilter /> Filter</button>
                </div>
            </header>

            {/* --- Project Grid --- */}
            <section className="projects-grid-section">
                <h2>Current Actions ({projects.length} Available)</h2>

                <div className="projects-grid">
                    {projects.map(project => (
                        <div key={project.id} className="project-card">
                            <div className="card-image-wrapper">
                                <img src={project.imageUrl} alt={project.title} className="card-image" />
                                <span 
                                    className="sdg-badge" 
                                    style={{ backgroundColor: project.sdgColor }}
                                    title={`SDG ${project.sdgId}`}
                                >
                                    SDG {project.sdgId}
                                </span>
                            </div>

                            <div className="card-content">
                                
                                <h3 className="card-title">{project.title}</h3>
                                
                                <p className="card-location">
                                    <FaMapMarkerAlt /> {project.location}
                                </p>
                                
                                <p className="card-description">{project.shortDescription}</p>
                                
                                <div className="card-meta">
                                    <span className={`meta-tag ${project.type.toLowerCase().replace(' ', '-')}-tag`}>
                                        <FaTag /> {project.type}
                                    </span>
                                    
                                    {project.slotsAvailable !== null && (
                                        <span className="meta-capacity">
                                            <FaHandsHelping /> {project.slotsAvailable} Slots Left
                                        </span>
                                    )}
                                </div>
                                
                                <button className="view-details-button">
                                    View Details <FaCheckCircle />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ProjectListing;