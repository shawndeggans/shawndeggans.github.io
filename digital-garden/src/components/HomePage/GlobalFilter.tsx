/**
 * GlobalFilter Component
 * 
 * Unified filter interface that affects both graph and timeline views.
 * Supports search text, tag selection, date ranges, and URL synchronization.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFilterState } from '../../hooks/useFilterState';
import { useTagData } from '../../hooks/useGraphData';
import { DateRange } from '../../types/filter';
import './GlobalFilter.css';

interface GlobalFilterProps {
  className?: string;
  compact?: boolean;
}

export const GlobalFilter: React.FC<GlobalFilterProps> = ({ 
  className, 
  compact = false 
}) => {
  const {
    filterState,
    setSearchText,
    addTag,
    removeTag,
    toggleTag,
    setDateRange,
    clearFilters,
    hasTag,
    isFilterActive
  } = useFilterState();

  const { allTags, getRelatedTags } = useTagData();

  // Calculate tag frequencies for tag cloud
  const tagFrequencies = useMemo(() => {
    const freqMap = new Map<string, number>();
    allTags.forEach(tag => {
      // In a real implementation, we'd count actual usage
      // For now, use a simple calculation
      freqMap.set(tag, Math.floor(Math.random() * 10) + 1);
    });
    return freqMap;
  }, [allTags]);

  const topTags = useMemo(() => {
    return Array.from(tagFrequencies.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([tag, count]) => ({ tag, count }));
  }, [tagFrequencies]);

  // Local state for UI interactions
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Refs for managing focus and clicks
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const tagSuggestionsRef = useRef<HTMLDivElement>(null);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Handle tag input changes
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    
    // Show suggestions when typing
    if (value.length > 0) {
      setShowTagSuggestions(true);
    } else {
      setShowTagSuggestions(false);
    }
  };

  // Handle tag input key events
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const trimmedTag = tagInput.trim();
      
      if (!hasTag(trimmedTag)) {
        addTag(trimmedTag);
      }
      
      setTagInput('');
      setShowTagSuggestions(false);
    } else if (e.key === 'Escape') {
      setTagInput('');
      setShowTagSuggestions(false);
      tagInputRef.current?.blur();
    }
  };

  // Handle tag suggestion click
  const handleTagSuggestionClick = (tag: string) => {
    if (!hasTag(tag)) {
      addTag(tag);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  // Handle date range changes
  const handleDateRangeChange = (start: string, end: string) => {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        setDateRange({ start: startDate, end: endDate });
      }
    } else {
      setDateRange(undefined);
    }
  };

  // Filter tag suggestions based on input
  const getFilteredTagSuggestions = () => {
    if (!tagInput) return allTags.slice(0, 8);
    
    const inputLower = tagInput.toLowerCase();
    return allTags
      .filter(tag => 
        tag.toLowerCase().includes(inputLower) && 
        !hasTag(tag)
      )
      .slice(0, 8);
  };

  // Handle clicks outside tag suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagSuggestionsRef.current && 
        !tagSuggestionsRef.current.contains(event.target as Node) &&
        !tagInputRef.current?.contains(event.target as Node)
      ) {
        setShowTagSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tagSuggestions = getFilteredTagSuggestions();

  return (
    <div className={`global-filter ${compact ? 'global-filter--compact' : ''} ${className || ''}`}>
      {/* Left Column: Search and Controls */}
      <div className="global-filter__controls">
        {/* Search Input */}
        <div className={`search-input ${searchFocused ? 'search-input--focused' : ''}`}>
        <div className="search-input__icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M7.4 12.8C10.6 12.8 13.2 10.2 13.2 7C13.2 3.8 10.6 1.2 7.4 1.2C4.2 1.2 1.6 3.8 1.6 7C1.6 10.2 4.2 12.8 7.4 12.8Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14.8 14.8L11.6 11.6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search content, tags, or ideas..."
          value={filterState.searchText}
          onChange={handleSearchChange}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="search-input__field"
        />
        
        {filterState.searchText && (
          <button
            onClick={() => setSearchText('')}
            className="search-input__clear"
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

        {/* Selected tags */}
        {filterState.selectedTags.length > 0 && (
          <div className="selected-tags">
            {filterState.selectedTags.map(tag => (
              <span key={tag} className="tag-chip">
                <span className="tag-chip__text">{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="tag-chip__remove"
                  aria-label={`Remove tag: ${tag}`}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M9 3L3 9M3 3L9 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Date filter is now more compact inline */}

      {/* Date Range Filter */}
      <div className="date-filter">
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className={`date-filter__toggle ${filterState.dateRange ? 'date-filter__toggle--active' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 1V5M11 1V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M2 7H14" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span>
            {filterState.dateRange 
              ? `${filterState.dateRange.start.toLocaleDateString()} - ${filterState.dateRange.end.toLocaleDateString()}`
              : 'Date range'
            }
          </span>
        </button>

        {showDatePicker && (
          <div className="date-picker">
            <div className="date-picker__inputs">
              <div className="date-input">
                <label htmlFor="start-date">From</label>
                <input
                  id="start-date"
                  type="date"
                  value={filterState.dateRange?.start.toISOString().split('T')[0] || ''}
                  onChange={e => handleDateRangeChange(
                    e.target.value, 
                    filterState.dateRange?.end.toISOString().split('T')[0] || ''
                  )}
                />
              </div>
              <div className="date-input">
                <label htmlFor="end-date">To</label>
                <input
                  id="end-date"
                  type="date"
                  value={filterState.dateRange?.end.toISOString().split('T')[0] || ''}
                  onChange={e => handleDateRangeChange(
                    filterState.dateRange?.start.toISOString().split('T')[0] || '',
                    e.target.value
                  )}
                />
              </div>
            </div>
            <div className="date-picker__actions">
              <button
                onClick={() => {
                  setDateRange(undefined);
                  setShowDatePicker(false);
                }}
                className="btn btn--secondary btn--small"
              >
                Clear
              </button>
              <button
                onClick={() => setShowDatePicker(false)}
                className="btn btn--primary btn--small"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

        {/* Clear all filters */}
        {isFilterActive && (
          <button
            onClick={clearFilters}
            className="clear-filters"
            title="Clear all filters"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Right Column: Tag Cloud */}
      <div className="global-filter__tag-cloud">
        <div className="tag-cloud">
          {topTags.map(({ tag, count }) => {
            const size = Math.max(0.7, Math.min(1.1, 0.7 + (count / 20)));
            const isSelected = hasTag(tag);
            
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`tag-cloud__tag ${isSelected ? 'tag-cloud__tag--selected' : ''}`}
                style={{ fontSize: `${size}rem` }}
                title={`${tag} (${count} items)`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GlobalFilter;