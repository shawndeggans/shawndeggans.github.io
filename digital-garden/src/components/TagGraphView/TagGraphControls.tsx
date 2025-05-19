import React from 'react';

interface TagGraphControlsProps {
  minContentCount: number;
  onMinContentCountChange: (value: number) => void;
  minConnectionStrength: number;
  onMinConnectionStrengthChange: (value: number) => void;
  hideIsolated: boolean;
  onHideIsolatedChange: (value: boolean) => void;
  showClusters: boolean;
  onShowClustersChange: (value: boolean) => void;
  tagStats: {
    totalTags: number;
    visibleTags: number;
    totalConnections: number;
    visibleConnections: number;
  };
}

export const TagGraphControls: React.FC<TagGraphControlsProps> = ({
  minContentCount,
  onMinContentCountChange,
  minConnectionStrength,
  onMinConnectionStrengthChange,
  hideIsolated,
  onHideIsolatedChange,
  showClusters,
  onShowClustersChange,
  tagStats,
}) => {
  return (
    <div className="tag-graph-controls">
      <div className="control-group">
        <label htmlFor="min-content-count">
          Min content count: <span className="control-value">{minContentCount}</span>
        </label>
        <input
          id="min-content-count"
          type="range"
          min="1"
          max="10"
          value={minContentCount}
          onChange={(e) => onMinContentCountChange(parseInt(e.target.value))}
          className="control-slider"
        />
      </div>

      <div className="control-group">
        <label htmlFor="min-connection-strength">
          Min connection: <span className="control-value">{Math.round(minConnectionStrength * 100)}%</span>
        </label>
        <input
          id="min-connection-strength"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={minConnectionStrength}
          onChange={(e) => onMinConnectionStrengthChange(parseFloat(e.target.value))}
          className="control-slider"
        />
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={hideIsolated}
            onChange={(e) => onHideIsolatedChange(e.target.checked)}
            className="control-checkbox"
          />
          Hide isolated tags
        </label>
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={showClusters}
            onChange={(e) => onShowClustersChange(e.target.checked)}
            className="control-checkbox"
          />
          Show tag clusters
        </label>
      </div>

      <div className="tag-stats">
        <div className="stat-item">
          <span className="stat-label">Tags:</span>
          <span className="stat-value">
            {tagStats.visibleTags} / {tagStats.totalTags}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Connections:</span>
          <span className="stat-value">
            {tagStats.visibleConnections} / {tagStats.totalConnections}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TagGraphControls;