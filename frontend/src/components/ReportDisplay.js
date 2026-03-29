// src/components/ReportDisplay.js
import React, { useState } from 'react';
import './ReportDisplay.css'; // The new CSS file

// Helper to map section titles to icons
const getIconForSection = (title) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('composition') || lowerTitle.includes('body')) return 'fas fa-chart-line';
  if (lowerTitle.includes('nutritional') || lowerTitle.includes('nutrition') || lowerTitle.includes('dietary')) return 'fas fa-utensils';
  if (lowerTitle.includes('meal') || lowerTitle.includes('plan')) return 'fas fa-calendar-day';
  if (lowerTitle.includes('hydration') || lowerTitle.includes('water')) return 'fas fa-tint';
  if (lowerTitle.includes('exercise') || lowerTitle.includes('fitness')) return 'fas fa-heartbeat';
  if (lowerTitle.includes('lifestyle')) return 'fas fa-person-walking';
  if (lowerTitle.includes('goal setting')) return 'fas fa-bullseye';
  return 'fas fa-notes-medical'; // Default
};

const ReportDisplay = ({ report, onReset }) => {
  // Collapsible/Read More state per section - hooks must be at top level
  const [expandedSections, setExpandedSections] = useState({});
  const toggleSection = (idx) => {
    setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Early return with proper null check (after hooks to satisfy rules-of-hooks)
  if (!report || !report.aiGeneratedReport) {
    return (
      <div className="report-container">
        <div className="error-message">
          <p>No report data available.</p>
        </div>
      </div>
    );
  }

  const { aiGeneratedReport, bmi, bmiCategory, createdAt } = report;

  // Improved AI Report Parser
  const parseAIReport = (text) => {
    if (!text || typeof text !== 'string') {
      return { intro: '', sections: [] };
    }

    // Clean the text first
    const cleanText = text.trim();
    
    // Split by markdown headers or bold text patterns
    const headerPattern = /(?:^|\n)\s*(?:\*\*|##)\s*([^*\n]+?)(?:\*\*|##)?\s*(?:\n|$)/g;
    let match;

    // Extract all headers and their positions
    const headers = [];
    while ((match = headerPattern.exec(cleanText)) !== null) {
      headers.push({
        title: match[1].trim(),
        index: match.index,
        fullMatch: match[0]
      });
    }

    if (headers.length === 0) {
      // No headers found, treat entire text as intro
      return { 
        intro: cleanText.replace(/^\s*Comprehensive Health Consultation Report\s*/i, '').trim(),
        sections: []
      };
    }

    // Extract intro (content before first header)
    const intro = cleanText.substring(0, headers[0].index)
      .replace(/^\s*Comprehensive Health Consultation Report\s*/i, '')
      .trim();

    // Extract sections
    const sections = headers.map((header, index) => {
      const startIndex = header.index + header.fullMatch.length;
      const endIndex = index < headers.length - 1 ? headers[index + 1].index : cleanText.length;
      const content = cleanText.substring(startIndex, endIndex)
        .replace(/^[-=]+\s*\n?/gm, '') // Remove separator lines
        .trim();

      return {
        title: header.title,
        content: content
      };
    });

    return { intro, sections };
  };

  const { intro, sections } = parseAIReport(aiGeneratedReport);
  
  // Find specific sections with more flexible matching
  const findSection = (keywords) => {
    return sections.find(s => 
      keywords.some(keyword => s.title.toLowerCase().includes(keyword.toLowerCase()))
    );
  };

  const overviewSection = findSection(['overview', 'congratulations', 'summary']);
  const compositionSection = findSection(['composition', 'body composition', 'bmi', 'analysis']);
  // const nutritionSection = findSection(['nutritional', 'nutrition', 'dietary', 'diet']);
  
  // Improved nutrition content renderer
  const renderNutritionContent = (content) => {
    if (!content) return <p>No nutritional information available.</p>;

    // Check for meal plan section
    if (content.toLowerCase().includes('meal plan')) {
      const parts = content.split(/(?:sample\s+)?meal\s+plan:?/i);
      const recommendations = parts[0]?.trim() || '';
      const mealPlanText = parts[1]?.trim() || '';

      // Parse meal plan items
      const mealItems = [];
      if (mealPlanText) {
        // Look for patterns like "* Breakfast:" or "Breakfast:"
        const mealPattern = /(?:^\*?\s*)?(\w+(?:\s+\w+)*):\s*([^\n*]+(?:\n(?!\*?\s*\w+:)[^\n*]*)*)/gm;
        let mealMatch;
        
        while ((mealMatch = mealPattern.exec(mealPlanText)) !== null) {
          const mealType = mealMatch[1].trim();
          const mealDetails = mealMatch[2].trim();
          
          // Extract calories if present
          const calorieMatch = mealDetails.match(/\((\d+)\s*calories?\)/i);
          const calories = calorieMatch ? calorieMatch[1] : null;
          const cleanDetails = mealDetails.replace(/\(\d+\s*calories?\)/i, '').trim();

          mealItems.push({
            type: mealType,
            details: cleanDetails,
            calories: calories
          });
        }
      }

      return (
        <>
          {recommendations && (
            <div className="dietary-focus">
              {recommendations.split(/\*|\n/).filter(item => item.trim()).map((item, index) => (
                <div key={index} className="diet-item">
                  <span>{item.trim()}</span>
                </div>
              ))}
            </div>
          )}
          
          {mealItems.length > 0 && (
            <>
              <h4 style={{marginTop: '25px', marginBottom: '15px', fontWeight: 500, color: '#ffffff'}}>
                Sample One-Day Meal Plan
              </h4>
              <div className="meal-plan">
                {mealItems.map((meal, index) => (
                  <div key={index} className="meal">
                    <div className="meal-type">
                      {getMealEmoji(meal.type)} {meal.type}
                    </div>
                    <div className="meal-details">{meal.details}</div>
                    {meal.calories && (
                      <div className="calories">{meal.calories} calories</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      );
    }

    // Default rendering for other nutritional content
    return (
      <div className="dietary-focus">
        {content.split(/\*|\n/).filter(item => item.trim()).map((item, index) => (
          <div key={index} className="diet-item">
            <span>{item.trim()}</span>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to get meal emoji
  const getMealEmoji = (mealType) => {
    const type = mealType.toLowerCase();
    if (type.includes('breakfast')) return '🌅';
    if (type.includes('lunch')) return '🍽️';
    if (type.includes('dinner')) return '🌙';
    if (type.includes('snack')) return '🥜';
    return '🍴';
  };

  // Render hydration section specially
  const renderHydrationContent = (content) => {
    const waterMatch = content.match(/(\d+)\s*cups?\s*\((\d+)\s*ounces?\)/i);
    if (waterMatch) {
      return (
        <div className="hydration-card">
          <div className="water-icon">💧</div>
          <div className="water-amount">{waterMatch[1]}+ cups</div>
          <div>({waterMatch[2]} ounces) of water per day</div>
        </div>
      );
    }
    return <p>{content}</p>;
  };

  // Check if section should use special rendering
  const renderSectionContent = (title, content) => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('nutritional') || lowerTitle.includes('nutrition') || lowerTitle.includes('dietary')) {
      return renderNutritionContent(content);
    }
    
    if (lowerTitle.includes('hydration') || lowerTitle.includes('water')) {
      return renderHydrationContent(content);
    }
    
    if (lowerTitle.includes('exercise') && !content.trim()) {
      return (
        <div className="exercise-placeholder">
          <div className="exercise-icon">💪</div>
          <h4 style={{marginBottom: '10px', fontSize: '1.2rem', color: '#ffffff'}}>
            Exercise Recommendations
          </h4>
          <p style={{color: '#c8c8c8'}}>
            Exercise recommendations will be detailed in your personalized fitness plan
          </p>
        </div>
      );
    }

    // Default content rendering: convert to concise bullet list with highlighted labels
    const bullets = normalizeToBullets(content);
    if (bullets.length === 0) {
      return <p style={{color: '#c8c8c8', lineHeight: '1.6'}}>{content || 'Content not available.'}</p>;
    }
    return (
      <ul style={{margin: 0, paddingLeft: '1.2rem', color: '#c8c8c8'}}>
        {bullets.map((b, i) => (
          <li key={i} style={{marginBottom: '8px'}}> {formatBullet(b)} </li>
        ))}
      </ul>
    );
  };

  // Convert mixed markdown/plain text into clean bullets
  const normalizeToBullets = (text) => {
    if (!text) return [];
    let t = text
      .replace(/\r/g, '')
      .replace(/\*\*/g, '')
      .replace(/\s*###?\s*/g, ' ')
      .replace(/\s\+\s/g, '\n')  // plus-separated to new lines
      .replace(/\s?\*\s?/g, '\n') // asterisk bullets to new lines
      .replace(/\s?-\s/g, '\n- ') // dash bullets start
      .trim();
    const raw = t.split(/\n+/).map(s => s.trim()).filter(Boolean);
    // De-duplicate and keep concise phrases
    const unique = [];
    raw.forEach(item => {
      const clean = item.replace(/^[-•\s]+/, '').trim();
      if (clean && !unique.includes(clean)) unique.push(clean);
    });
    // Cap bullets for compact view; expansion handled outside
    return unique;
  };

  // Bold the keyword before ':' if present
  const formatBullet = (text) => {
    const idx = text.indexOf(':');
    if (idx > 0 && idx < 40) {
      const label = text.slice(0, idx).trim();
      const rest = text.slice(idx + 1).trim();
      return (
        <>
          <strong style={{color: '#fff'}}>{label}:</strong> {rest}
        </>
      );
    }
    return <span>{text}</span>;
  };
  
  return (
    <div className="report-container">
      <div className="report-header">
        <h1>Comprehensive Health Consultation Report</h1>
        <div className="date">
          Generated on: {createdAt ? new Date(createdAt).toLocaleString() : 'Unknown date'}
        </div>
      </div>

      <div className="content">
        {/* Congratulations Section */}
        {(overviewSection || intro) && (
          <div className="congratulations">
            <h2>
              {overviewSection ? overviewSection.title : 'Congratulations on taking the first step towards a healthier you!'}
            </h2>
            <p>{overviewSection ? overviewSection.content : intro}</p>
          </div>
        )}

        {/* Body Composition Section with BMI Card */}
        {compositionSection && bmi && (
          <div className="section">
            <div className="section-header">
              <div className="section-icon">
                <i className={getIconForSection(compositionSection.title)}></i>
              </div>
              <h3>{compositionSection.title}</h3>
            </div>
            <div className="metric-card">
              <h4>Body Mass Index</h4>
              <div className="metric-value">{bmi}</div>
              <div className="metric-label">{bmiCategory || 'Normal Weight Range'}</div>
            </div>
            <p style={{marginTop: '15px', color: '#b8b8b8'}}>
              {compositionSection.content}
            </p>
          </div>
        )}

        {/* Other Sections */}
        {sections
          .filter(section => 
            !section.title.toLowerCase().includes('overview') && 
            !section.title.toLowerCase().includes('composition')
          )
          .map(({ title, content }, index) => (
            <div key={index} className="section">
              <div className="section-header">
                <div className="section-icon">
                  <i className={getIconForSection(title)}></i>
                </div>
                <h3>{title}</h3>
              </div>
              <div className="section-content">
                {(() => {
                  const bullets = normalizeToBullets(content);
                  const visibleContent = bullets.length > 0
                    ? (expandedSections[index] ? bullets : bullets.slice(0, 5))
                    : (expandedSections[index] ? content : (content.length > 600 ? content.slice(0, 600) + '...' : content));
                  return bullets.length > 0
                    ? (
                        <ul style={{margin: 0, paddingLeft: '1.2rem', color: '#c8c8c8'}}>
                          {visibleContent.map((b, i) => (
                            <li key={i} style={{marginBottom: '8px'}}>{formatBullet(b)}</li>
                          ))}
                        </ul>
                      )
                    : renderSectionContent(title, visibleContent);
                })()}
                {(() => {
                  const bullets = normalizeToBullets(content);
                  const isLong = bullets.length > 0 ? bullets.length > 5 : content.length > 600;
                  return isLong ? (
                  <button
                    className="form-button"
                    style={{ marginTop: '10px', padding: '8px 14px' }}
                    onClick={() => toggleSection(index)}
                  >
                    {expandedSections[index] ? 'Show less' : 'Read more'}
                  </button>
                ) : null; })()}
              </div>
            </div>
          ))
        }
      </div>
      
      {onReset && (
        <div className="reset-button-container" style={{textAlign: 'center', marginTop: '30px'}}>
          <button 
            className="form-button" 
            onClick={onReset}
            style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportDisplay;