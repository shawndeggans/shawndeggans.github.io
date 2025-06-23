import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../hooks/useContent';
import { GraphVisualization } from './GraphVisualization';
import { transformContentToGraphData, getDefaultGraphConfig } from '../../utils/graphData';
import { GraphNode } from '../../types/graph';
import './GraphView.css';

export const GraphView: React.FC = () => {
  const navigate = useNavigate();
  const { contentMap, links, loading, error } = useContent();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Update dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('.graph-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: Math.max(600, window.innerHeight - 200),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Transform content data for graph visualization
  const graphData = useMemo(() => {
    if (!contentMap.size) return { nodes: [], links: [] };
    return transformContentToGraphData(contentMap, links);
  }, [contentMap, links]);

  // Generate graph configuration
  const graphConfig = useMemo(() => {
    return getDefaultGraphConfig(dimensions.width, dimensions.height);
  }, [dimensions]);

  // Handle node click - navigate to content
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNodeId(node.id);
    navigate(`/content/${node.id}`);
  };

  // Handle node hover
  const handleNodeHover = (node: GraphNode | null) => {
    setHoveredNode(node);
  };

  if (loading) {
    return (
      <div className="graph-view">
        <div className="graph-loading">
          <div className="loading-spinner"></div>
          <p>Loading content graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="graph-view">
        <div className="graph-error">
          <p>Error loading content: {error}</p>
        </div>
      </div>
    );

  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="graph-view">
        <div className="graph-empty">
          <p>No content available to visualize.</p>
          <p>Add some markdown files to see the graph!</p>
        </div>
      </div>
    );
  }
  return (
    <div className="graph-view">
      <div className="graph-header">
        <div className="graph-stats">
          <span>{graphData.nodes.length} nodes</span>
          <span>{graphData.links.length} connections</span>
        </div>
      </div>

      {hoveredNode && (
        <div className="graph-tooltip">
          <h3>{hoveredNode.title}</h3>
          <div className="tooltip-meta">
            <span className="tooltip-date">{hoveredNode.date}</span>
            {hoveredNode.tags.length > 0 && (
              <div className="tooltip-tags">
                {hoveredNode.tags.map(tag => (
                  <span key={tag} className="tooltip-tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="graph-container" data-testid="graph-container">
        <GraphVisualization
          data={graphData}
          config={graphConfig}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          selectedNodeId={selectedNodeId || undefined}
        />
      </div>

      <div className="graph-instructions">
        <p>
          <strong>Click</strong> a node to read the content •{' '}
          <strong>Hover</strong> to see connections •{' '}
          <strong>Zoom</strong> and <strong>drag</strong> to explore
        </p>
      </div>
    </div>
  );
};

export default GraphView;