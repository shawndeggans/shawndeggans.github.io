/**
 * UnifiedGraph Component
 * 
 * D3.js-powered network visualization that displays all node types uniformly.
 * Supports full-width display, interactive exploration, and filtering.
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { 
  UnifiedNode, 
  UnifiedLink, 
  NodeSimulationData, 
  LinkSimulationData,
  isContentNode,
  isTagNode 
} from '../../types/unifiedGraph';
import { FilteredData, FilterState } from '../../types/filter';
import { useFilterState } from '../../hooks/useFilterState';
import './UnifiedGraph.css';

interface UnifiedGraphProps {
  data: FilteredData;
  filterState: FilterState;
  className?: string;
  onNodeClick?: (node: UnifiedNode) => void;
  onNodeHover?: (node: UnifiedNode | null) => void;
}

export const UnifiedGraph: React.FC<UnifiedGraphProps> = ({
  data,
  filterState,
  className,
  onNodeClick,
  onNodeHover
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addTag } = useFilterState();

  // Local state for visualization
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Memoized graph configuration
  const graphConfig = useMemo(() => ({
    nodeRadius: 6,
    linkDistance: 40,
    chargeStrength: -100,
    centerStrength: 0.3,
    collisionRadius: 10,
    
    // Visual styling (uniform across all node types)
    nodeStyle: {
      fill: '#3b82f6',
      stroke: '#ffffff',
      strokeWidth: 2,
      opacity: 1
    },
    
    linkStyle: {
      stroke: '#e5e7eb',
      strokeWidth: 1,
      opacity: 0.4
    },
    
    // Highlight styles
    highlightStyle: {
      nodeOpacity: 1,
      linkOpacity: 0.8,
      fadedOpacity: 0.3
    }
  }), []);

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Main D3 visualization effect
  useEffect(() => {
    if (!data || !svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const { width, height } = dimensions;

    // Create simulation data with positions
    // Debug: Log node counts by type
    console.log('Graph data:', {
      totalNodes: data.nodes.length,
      contentNodes: data.nodes.filter(n => n.type === 'content').length,
      tagNodes: data.nodes.filter(n => n.type === 'tag').length
    });

    const nodes: NodeSimulationData[] = data.nodes.map(node => ({
      ...node,
      x: width / 2 + (Math.random() - 0.5) * 50,
      y: height / 2 + (Math.random() - 0.5) * 50
    }));

    const links: LinkSimulationData[] = data.links.map(link => ({
      ...link,
      source: link.source,
      target: link.target
    }));

    // Create force simulation with better positioning
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(graphConfig.linkDistance)
        .strength(0.3)
      )
      .force('charge', d3.forceManyBody()
        .strength(graphConfig.chargeStrength)
        .distanceMax(200)
      )
      .force('center', d3.forceCenter(width / 2, height / 2)
        .strength(graphConfig.centerStrength)
      )
      .force('collision', d3.forceCollide()
        .radius(graphConfig.collisionRadius)
        .strength(0.8)
      )
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));

    // Create main group for zoom/pan
    const g = svg.append('g');

    // Create links
    const linkSelection = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', graphConfig.linkStyle.stroke)
      .attr('stroke-width', (d: LinkSimulationData) => {
        // Vary stroke width by link type
        switch (d.type) {
          case 'content_link': return 2;
          case 'tag_assignment': return 1.5;
          case 'tag_cooccurrence': return 1;
          default: return 1;
        }
      })
      .attr('opacity', graphConfig.linkStyle.opacity);

    // Create nodes
    const nodeSelection = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node-group')
      .call(d3.drag<SVGGElement, NodeSimulationData>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
      );

    // Add node circles (uniform styling)
    nodeSelection.append('circle')
      .attr('r', (d: NodeSimulationData) => {
        // Slightly vary size by type while keeping uniform appearance
        if (d.type === 'content') return graphConfig.nodeRadius + 1;
        if (d.type === 'tag') return graphConfig.nodeRadius;
        return graphConfig.nodeRadius;
      })
      .attr('fill', (d: NodeSimulationData) => {
        // Different colors for different node types
        if (d.type === 'content') return '#3b82f6';
        if (d.type === 'tag') return '#8b5cf6';
        return graphConfig.nodeStyle.fill;
      })
      .attr('stroke', graphConfig.nodeStyle.stroke)
      .attr('stroke-width', graphConfig.nodeStyle.strokeWidth)
      .attr('opacity', graphConfig.nodeStyle.opacity);

    // Add node labels
    nodeSelection.append('text')
      .text((d: NodeSimulationData) => d.label)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('fill', '#374151')
      .attr('pointer-events', 'none')
      .style('opacity', 0);

    // Node interactions
    nodeSelection
      .on('mouseover', (event, d) => {
        setHoveredNode(d.id);
        onNodeHover?.(d);
        
        // Show label on hover
        d3.select(event.currentTarget)
          .select('text')
          .style('opacity', 1);
        
        // Highlight connected elements
        highlightConnections(d.id, true);
      })
      .on('mouseout', (event, d) => {
        setHoveredNode(null);
        onNodeHover?.(null);
        
        // Hide label
        d3.select(event.currentTarget)
          .select('text')
          .style('opacity', 0);
        
        // Remove highlights
        highlightConnections(d.id, false);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d.id);
        
        if (onNodeClick) {
          onNodeClick(d);
        } else {
          // Default behavior
          handleNodeClick(d);
        }
      });

    // Zoom and pan behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Wait for simulation to stabilize before fitting
    simulation.on('end', () => {
      const bounds = g.node()?.getBBox();
      if (bounds && bounds.width > 0 && bounds.height > 0) {
        const fullWidth = bounds.width;
        const fullHeight = bounds.height;
        const midX = bounds.x + fullWidth / 2;
        const midY = bounds.y + fullHeight / 2;
        
        const scale = Math.min(
          0.8 * width / fullWidth,
          0.8 * height / fullHeight,
          1.2
        );
        
        const translate = [
          width / 2 - scale * midX,
          height / 2 - scale * midY
        ];

        svg.transition()
          .duration(750)
          .call(
            zoom.transform,
            d3.zoomIdentity
              .translate(translate[0], translate[1])
              .scale(scale)
          );
      }
    });

    // Start with a reasonable zoom
    svg.call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(0.8)
        .translate(-width / 2, -height / 2)
    );

    // Simulation tick handler
    simulation.on('tick', () => {
      linkSelection
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeSelection
        .attr('transform', (d: NodeSimulationData) => `translate(${d.x},${d.y})`);
    });

    // Drag handlers
    function dragStarted(event: any, d: NodeSimulationData) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: NodeSimulationData) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: any, d: NodeSimulationData) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Highlight connections function
    function highlightConnections(nodeId: string, highlight: boolean) {
      const connectedNodeIds = new Set<string>();
      
      // Find connected nodes
      links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
        
        if (sourceId === nodeId) {
          connectedNodeIds.add(targetId);
        } else if (targetId === nodeId) {
          connectedNodeIds.add(sourceId);
        }
      });

      if (highlight) {
        // Fade non-connected elements
        nodeSelection
          .style('opacity', (d: NodeSimulationData) => 
            d.id === nodeId || connectedNodeIds.has(d.id) ? 1 : graphConfig.highlightStyle.fadedOpacity
          );

        linkSelection
          .style('opacity', (d: LinkSimulationData) => {
            const sourceId = typeof d.source === 'string' ? d.source : (d.source as any).id;
            const targetId = typeof d.target === 'string' ? d.target : (d.target as any).id;
            return sourceId === nodeId || targetId === nodeId ? 
              graphConfig.highlightStyle.linkOpacity : 
              graphConfig.highlightStyle.fadedOpacity;
          });
      } else {
        // Reset opacity
        nodeSelection.style('opacity', graphConfig.nodeStyle.opacity);
        linkSelection.style('opacity', graphConfig.linkStyle.opacity);
      }
    }

    // Cleanup function
    return () => {
      simulation.stop();
    };

  }, [data, dimensions, graphConfig, onNodeClick, onNodeHover, addTag, navigate]);

  // Handle node click behavior
  const handleNodeClick = (node: UnifiedNode) => {
    if (isContentNode(node)) {
      // Navigate to content page
      navigate(`/content/${node.id}`);
    } else if (isTagNode(node)) {
      // Add tag to filter
      addTag(node.label);
    }
  };

  // Loading state
  if (!data || data.nodes.length === 0) {
    return (
      <div className={`unified-graph unified-graph--empty ${className || ''}`}>
        <div className="graph-empty-state">
          <div className="empty-state__icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.4"/>
              <circle cx="36" cy="12" r="3" fill="currentColor" opacity="0.4"/>
              <circle cx="24" cy="36" r="3" fill="currentColor" opacity="0.4"/>
              <path d="M12 12L36 12M24 36L36 12M24 36L12 12" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
            </svg>
          </div>
          <h3>No connections to display</h3>
          <p>Try adjusting your filters to see the knowledge network.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`unified-graph ${className || ''}`}
    >
      <svg 
        ref={svgRef}
        width="100%"
        height="100%"
        className="graph-svg"
      />
      
      {/* Graph controls */}
      <div className="graph-controls">
        <div className="graph-legend">
          <div className="legend-item">
            <div className="legend-node legend-node--content"></div>
            <span>Content</span>
          </div>
          <div className="legend-item">
            <div className="legend-node legend-node--tag"></div>
            <span>Tags</span>
          </div>
        </div>
        
        <div className="graph-info">
          <span className="graph-stats">
            {data.nodes.length} nodes • {data.links.length} connections
          </span>
        </div>
      </div>
    </div>
  );
};

export default UnifiedGraph;