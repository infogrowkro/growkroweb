import React, { useState, useEffect } from 'react';
import './CollaborationMatch.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const CollaborationMatch = ({ user, creators }) => {
  const [matches, setMatches] = useState([]);
  const [preferences, setPreferences] = useState({
    categories: [],
    location: '',
    minFollowers: 0,
    maxFollowers: 1000000,
    collaborationType: 'all'
  });
  const [loading, setLoading] = useState(false);

  // Find potential collaboration matches
  const findMatches = () => {
    if (!creators || creators.length === 0) return [];

    return creators
      .filter(creator => {
        // Filter by categories
        if (preferences.categories.length > 0 && 
            !preferences.categories.includes(creator.category)) {
          return false;
        }

        // Filter by location (if specified)
        if (preferences.location && 
            !creator.location?.toLowerCase().includes(preferences.location.toLowerCase())) {
          return false;
        }

        // Filter by follower count
        const totalFollowers = (creator.instagram_followers || 0) + (creator.youtube_subscribers || 0);
        if (totalFollowers < preferences.minFollowers || totalFollowers > preferences.maxFollowers) {
          return false;
        }

        return true;
      })
      .map(creator => {
        // Calculate match score
        let score = 0;
        
        // Category match bonus
        if (preferences.categories.includes(creator.category)) {
          score += 30;
        }

        // Location match bonus
        if (preferences.location && 
            creator.location?.toLowerCase().includes(preferences.location.toLowerCase())) {
          score += 25;
        }

        // Verification bonus
        if (creator.verification_status) {
          score += 20;
        }

        // Highlight package bonus
        if (creator.highlight_package) {
          score += creator.highlight_package === 'platinum' ? 15 : 
                  creator.highlight_package === 'gold' ? 10 : 5;
        }

        // Follower count factor (normalized)
        const totalFollowers = (creator.instagram_followers || 0) + (creator.youtube_subscribers || 0);
        score += Math.min(totalFollowers / 10000, 10); // Max 10 points for followers

        return {
          ...creator,
          matchScore: Math.round(score),
          matchReasons: getMatchReasons(creator, preferences)
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Top 10 matches
  };

  const getMatchReasons = (creator, prefs) => {
    const reasons = [];
    
    if (prefs.categories.includes(creator.category)) {
      reasons.push(`Same category: ${creator.category}`);
    }
    
    if (prefs.location && creator.location?.toLowerCase().includes(prefs.location.toLowerCase())) {
      reasons.push(`Local creator in ${creator.location}`);
    }
    
    if (creator.verification_status) {
      reasons.push('Verified creator');
    }
    
    if (creator.highlight_package) {
      reasons.push(`${creator.highlight_package.charAt(0).toUpperCase() + creator.highlight_package.slice(1)} member`);
    }

    const totalFollowers = (creator.instagram_followers || 0) + (creator.youtube_subscribers || 0);
    if (totalFollowers > 50000) {
      reasons.push('High engagement audience');
    }

    return reasons;
  };

  useEffect(() => {
    const newMatches = findMatches();
    setMatches(newMatches);
  }, [preferences, creators]);

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCategoryToggle = (category) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const sendCollaborationRequest = async (creatorId) => {
    // Placeholder for collaboration request
    alert(`Collaboration request sent! ${creators.find(c => c.id === creatorId)?.name} will be notified.`);
  };

  return (
    <div className="collaboration-match">
      <div className="match-header">
        <h2>🤝 Find Collaboration Partners</h2>
        <p>Discover creators who match your collaboration goals</p>
      </div>

      <div className="match-filters">
        <h3>Set Your Preferences</h3>
        
        <div className="filter-section">
          <label>Content Categories:</label>
          <div className="category-chips">
            {['fashion', 'tech', 'lifestyle', 'food', 'travel', 'fitness'].map(category => (
              <button
                key={category}
                className={`category-chip ${preferences.categories.includes(category) ? 'active' : ''}`}
                onClick={() => handleCategoryToggle(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label>Location:</label>
          <input
            type="text"
            placeholder="e.g., Mumbai, Delhi, Bangalore"
            value={preferences.location}
            onChange={(e) => handlePreferenceChange('location', e.target.value)}
            className="location-input"
          />
        </div>

        <div className="filter-section">
          <label>Follower Range:</label>
          <div className="follower-range">
            <input
              type="number"
              placeholder="Min followers"
              value={preferences.minFollowers}
              onChange={(e) => handlePreferenceChange('minFollowers', parseInt(e.target.value) || 0)}
              className="follower-input"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max followers"
              value={preferences.maxFollowers}
              onChange={(e) => handlePreferenceChange('maxFollowers', parseInt(e.target.value) || 1000000)}
              className="follower-input"
            />
          </div>
        </div>
      </div>

      <div className="match-results">
        <h3>Your Top Matches ({matches.length})</h3>
        
        {matches.length > 0 ? (
          <div className="matches-grid">
            {matches.map((creator) => (
              <div key={creator.id} className="match-card">
                <div className="match-score">
                  <span className="score">{creator.matchScore}%</span>
                  <span className="score-label">Match</span>
                </div>
                
                <div className="creator-info">
                  <div className="creator-avatar">
                    {creator.profile_picture ? (
                      <img src={creator.profile_picture} alt={creator.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {creator.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {creator.verification_status && (
                      <div className="verified-badge">✅</div>
                    )}
                  </div>
                  
                  <h4>{creator.name}</h4>
                  <p className="creator-category">{creator.category}</p>
                  <p className="creator-location">📍 {creator.location}</p>
                  
                  <div className="social-stats">
                    {creator.instagram_handle && (
                      <span className="stat">📸 {creator.instagram_followers.toLocaleString()}</span>
                    )}
                    {creator.youtube_handle && (
                      <span className="stat">🎥 {creator.youtube_subscribers.toLocaleString()}</span>
                    )}
                  </div>

                  {creator.highlight_package && (
                    <div className={`highlight-badge ${creator.highlight_package}`}>
                      {creator.highlight_package.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="match-reasons">
                  <h5>Why this match:</h5>
                  <ul>
                    {creator.matchReasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="match-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => sendCollaborationRequest(creator.id)}
                  >
                    Send Collaboration Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-matches">
            <div className="no-matches-icon">🔍</div>
            <h4>No matches found</h4>
            <p>Try adjusting your preferences to find more collaboration partners</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationMatch;