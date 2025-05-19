import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../hooks/useContent';
import { TagGraphVisualization } from './TagGraphVisualization';
import { TagGraphControls } from './TagGraphControls';
import {
  transformContentToTagGraph,
  getDefaultTagGraphConfig,
  filterTagGraph,
  detectTagClusters,
  getTagStats,
} from '../../utils/tagGraphData';
import { TagNode } from '../../types/tagGraph';
import './TagGraphView.css';

export const TagGraphView: React.FC = () => {
  const navigate = useNavigate();
  const { contentMap, loading, error } = useContent();
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [hoveredTag, setHoveredTag] = useState<TagNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Filter controls
  const [minContentCount, setMinContentCount] = useState(1);
  const [minConnectionStrength, setMinConnectionStrength] = useState(0.0);
  const [hideIsolated, setHideIsolated] = useState(false);
  const [showClusters, setShowClusters] = useState(false);

  // Update dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('.tag-graph-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: Math.max(600, window.innerHeight - 280),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Transform content data for tag graph visualization
  const fullTagGraph = useMemo(() => {
    if (!contentMap.size) return { nodes: [], links: [] };
    return transformContentToTagGraph(contentMap);
  }, [contentMap]);

  // Apply filters to tag graph
  const filteredTagGraph = useMemo(() => {
    return filterTagGraph(fullTagGraph, {
      minContentCount,
      minConnectionStrength,
      hideIsolated,
    });
  }, [fullTagGraph, minContentCount, minConnectionStrength, hideIsolated]);

  // Detect tag clusters
  const tagClusters = useMemo(() => {
    return showClusters ? detectTagClusters(filteredTagGraph) : undefined;
  }, [filteredTagGraph, showClusters]);

  // Generate graph configuration
  const graphConfig = useMemo(() => {
    return getDefaultTagGraphConfig(dimensions.width, dimensions.height);
  }, [dimensions]);

  // Get tag statistics
  const tagStats = useMemo(() => {
    return {
      totalTags: fullTagGraph.nodes.length,
      visibleTags: filteredTagGraph.nodes.length,
      totalConnections: fullTagGraph.links.length,
      visibleConnections: filteredTagGraph.links.length,
    };
  }, [fullTagGraph, filteredTagGraph]);

  // Get all content tagged with the selected tag
  const getContentForTag = (tagId: string): string[] => {
    const tagNode = fullTagGraph.nodes.find(node => node.id === tagId);
    return tagNode ? tagNode.connectedContent : [];
  };

  // Handle tag click - could navigate to filtered content view
  const handleTagClick = (tag: TagNode) => {
    setSelectedTagId(tag.id);
    
    // For now, navigate to timeline view with tag filter
    // You could also create a dedicated tag content view
    navigate(`/timeline?tag=${encodeURIComponent(tag.id)}`);
  };

  // Handle tag hover
  const handleTagHover = (tag: TagNode | null) => {
    setHoveredTag(tag);
  };

  if (loading) {
    return (
      <div className="tag-graph-view">
        <div className="tag-graph-loading">
          <div className="loading-spinner"></div>
          <p>Loading tag graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tag-graph-view">
        <div className="tag-graph-error">
          <p>Error loading content: {error}</p>
        </div>
      </div>
    );
  }

  if (fullTagGraph.nodes.length === 0) {
    return (
      <div className="tag-graph-view">
        <div className="tag-graph-empty">
          <p>No tags available to visualize.</p>
          <p>Add tags to your markdown files to see the tag graph!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tag-graph-view">
      <div className="tag-graph-header">
        <div className="tag-graph-title">
          <h1>Tag Network</h1>
          <p>Explore topics and their relationships</p>
        </div>
      </div>

      <TagGraphControls
        minContentCount={minContentCount}
        onMinContentCountChange={setMinContentCount}
        minConnectionStrength={minConnectionStrength}
        onMinConnectionStrengthChange={setMinConnectionStrength}
        hideIsolated={hideIsolated}
        onHideIsolatedChange={setHideIsolated}
        showClusters={showClusters}
        onShowClustersChange={setShowClusters}
        tagStats={tagStats}
      />

      {hoveredTag && (
        <div className="tag-graph-tooltip">
          <h3>#{hoveredTag.title}</h3>
          <div className="tooltip-meta">
            <span className="tooltip-content-count">
              {hoveredTag.contentCount} {hoveredTag.contentCount === 1 ? 'post' : 'posts'}
            </span>
            {hoveredTag.connectedContent.length > 0 && (
              <div className="tooltip-content-list">
                <strong>Recent content:</strong>
                <ul>
                  {hoveredTag.connectedContent.slice(0, 3).map(slug => (
                    <li key={slug}>
                      {contentMap.get(slug)?.metadata.title || slug}
                    </li>
                  ))}
                  {hoveredTag.connectedContent.length > 3 && (
                    <li>...and {hoveredTag.connectedContent.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="tag-graph-container">
        <TagGraphVisualization
          data={filteredTagGraph}
          config={graphConfig}
          onNodeClick={handleTagClick}
          onNodeHover={handleTagHover}
          selectedNodeId={selectedTagId || undefined}
          clusters={tagClusters}
        />
      </div>

      <div className="tag-graph-instructions">
        <p>
          <strong>Click</strong> a tag to view related content •{' '}
          <strong>Hover</strong> to see connections •{' '}
          <strong>Zoom</strong> and <strong>drag</strong> to explore •{' '}
          Node size = content count, link thickness = relationship strength
        </p>
      </div>
    </div>
  );
};

export default TagGraphView;