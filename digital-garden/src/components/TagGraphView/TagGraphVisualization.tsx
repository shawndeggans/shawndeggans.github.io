import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { TagGraphData, TagNode, TagLink, TagGraphConfig } from '../../types/tagGraph';

interface TagGraphVisualizationProps {
  data: TagGraphData;
  config: TagGraphConfig;
  onNodeClick: (node: TagNode) => void;
  onNodeHover: (node: TagNode | null) => void;
  selectedNodeId?: string;
  clusters?: Array<{ id: string; tags: string[]; color: string }>;
}

export const TagGraphVisualization: React.FC<TagGraphVisualizationProps> = ({
  data,
  config,
  onNodeClick,
  onNodeHover,
  selectedNodeId,
  clusters,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<TagNode, TagLink> | null>(null);

  const createSimulation = useCallback(() => {
    if (!svgRef.current) return;

    const { width, height, forces } = config;
    
    // Clear previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Create new simulation with optimized forces for tags
    const simulation = d3.forceSimulation<TagNode, TagLink>(data.nodes)
      .force('link', d3.forceLink<TagNode, TagLink>(data.links)
        .id(d => d.id)
        .strength(link => forces.link * link.value)) // Scale by connection strength
      .force('charge', d3.forceManyBody()
        .strength(-250)) // Reduced from -400 for less repulsion
      .force('center', d3.forceCenter(width / 2, height / 2)
        .strength(forces.center))
      .force('collision', d3.forceCollide()
        .radius((d: d3.SimulationNodeDatum) => {
          const node = d as TagNode;
          return config.nodeRadius.min * (1 + node.size) + 5; // Added padding
        })
        .strength(forces.collision))
      .alphaDecay(0.02) // Slower cooling for smoother animation
      .velocityDecay(0.4); // Higher damping to reduce drift

    simulationRef.current = simulation;
    return simulation;
  }, [data, config]);

  const getNodeColor = useCallback((node: TagNode): string => {
    if (node.id === selectedNodeId) return config.colors.nodes.selected;
    
    // Check if node belongs to a cluster
    if (clusters) {
      for (const cluster of clusters) {
        if (cluster.tags.includes(node.id)) {
          return cluster.color;
        }
      }
    }
    
    return config.colors.nodes.default;
  }, [selectedNodeId, clusters, config.colors.nodes]);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    const { colors, nodeRadius } = config;

    // Clear previous content
    svg.selectAll("*").remove();

    // Create container groups
    const container = svg.append('g').attr('class', 'tag-graph-container');
    const linksGroup = container.append('g').attr('class', 'tag-links');
    const nodesGroup = container.append('g').attr('class', 'tag-nodes');

    // Create links with variable thickness based on strength
    const linkElements = linksGroup
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .style('stroke', link => 
        link.value > 0.5 ? colors.links.strong : colors.links.default
      )
      .style('stroke-width', link => 1 + (link.value * 3)) // Width 1-4 based on strength
      .style('stroke-opacity', link => 0.4 + (link.value * 0.4)); // Opacity 0.4-0.8

    // Create nodes with size based on content count
    const nodeElements = nodesGroup
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('r', d => nodeRadius.min + (d.size * 3))
      .style('fill', getNodeColor)
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .style('cursor', 'pointer');

    // Create labels for tags
    const labelElements = nodesGroup
      .selectAll('text')
      .data(data.nodes)
      .enter()
      .append('text')
      .text(d => d.title)
      .style('font-family', 'var(--font-family-heading)')
      .style('font-size', d => `${10 + d.size * 2}px`)
      .style('font-weight', '600')
      .style('fill', '#2c3e50')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('opacity', 0.8);

    // Add content count badges
    const badgeElements = nodesGroup
      .selectAll('.content-badge')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'content-badge');

    badgeElements
      .append('circle')
      .attr('r', 10)
      .style('fill', colors.nodes.selected)
      .style('stroke', '#fff')
      .style('stroke-width', 2);

    badgeElements
      .append('text')
      .text(d => d.contentCount)
      .style('font-family', 'var(--font-family-heading)')
      .style('font-size', '10px')
      .style('font-weight', '700')
      .style('fill', '#fff')
      .style('text-anchor', 'middle')
      .style('dominant-baseline', 'central')
      .style('pointer-events', 'none');

    // Track drag state
    let dragStartX = 0;
    let dragStartY = 0;
    let isDragging = false;
    const dragThreshold = 5; // pixels

    // Add drag behavior with proper click handling
    const drag = d3.drag<SVGCircleElement, TagNode>()
      .on('start', (event, d) => {
        // Store initial position
        dragStartX = event.x;
        dragStartY = event.y;
        isDragging = false;
        
        if (!event.active && simulation) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        // Check if we've moved enough to consider it a drag
        const dx = Math.abs(event.x - dragStartX);
        const dy = Math.abs(event.y - dragStartY);
        if (dx > dragThreshold || dy > dragThreshold) {
          isDragging = true;
        }
        
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active && simulation) simulation.alphaTarget(0);
        
        // If we didn't drag far enough, treat it as a click
        const dx = Math.abs(event.x - dragStartX);
        const dy = Math.abs(event.y - dragStartY);
        if (dx < dragThreshold && dy < dragThreshold && !isDragging) {
          // Navigate on click
          onNodeClick(d);
          // Optionally release the fixed position on navigation
          d.fx = undefined;
          d.fy = undefined;
        }
        // Otherwise keep node fixed after dragging (sticky behavior)
      });

    // Add interactions
    nodeElements
      .call(drag)
      .on('dblclick', (event, d) => {
        // Double-click to release fixed position
        event.stopPropagation(); // Prevent any bubbling
        d.fx = undefined;
        d.fy = undefined;
        if (simulation) simulation.alpha(0.3).restart();
      })
      .on('mouseenter', (_, d) => {
        // Always include the hovered node itself
        const connectedTags = new Set([d.id]);
        
        // Find connected tags through links
        data.links.forEach(link => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          if (sourceId === d.id) {
            connectedTags.add(targetId);
          } else if (targetId === d.id) {
            connectedTags.add(sourceId);
          }
        });

        // Update node styles - ensure hovered node stays visible
        nodeElements
          .style('opacity', node => {
            // Hovered node always full opacity
            if (node.id === d.id) return 1;
            // Connected nodes full opacity, others dimmed
            return connectedTags.has(node.id) ? 1 : 0.3;
          })
          .style('fill', node => {
            if (node.id === d.id) return colors.nodes.hover;
            return getNodeColor(node);
          })
          .style('stroke', node => {
            // Show different stroke for fixed nodes
            return node.fx !== undefined ? '#e74c3c' : '#fff';
          })
          .style('stroke-width', node => {
            // Slightly thicker stroke for hovered node
            if (node.id === d.id) return 4;
            return node.fx !== undefined ? 3 : 2;
          })
          .style('transform', node => {
            // Scale up hovered node slightly
            if (node.id === d.id) {
              const x = node.x || 0;
              const y = node.y || 0;
              return `translate(${x}px, ${y}px) scale(1.2) translate(${-x}px, ${-y}px)`;
            }
            return null;
          });

        // Update link styles
        linkElements
          .style('opacity', link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
            const targetId = typeof link.target === 'string' ? link.target : link.target.id;
            return (sourceId === d.id || targetId === d.id) ? 0.8 : 0.1;
          })
          .style('stroke', link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
            const targetId = typeof link.target === 'string' ? link.target : link.target.id;
            return (sourceId === d.id || targetId === d.id) ? colors.links.hover : colors.links.default;
          });

        // Highlight labels for connected tags
        labelElements
          .style('opacity', node => connectedTags.has(node.id) ? 1 : 0.3);

        onNodeHover(d);
      })
      .on('mouseleave', () => {
        // Reset all styles
        nodeElements
          .style('opacity', 1)
          .style('fill', getNodeColor)
          .style('stroke', d => {
            // Maintain stroke for fixed nodes
            return d.fx !== undefined ? '#e74c3c' : '#fff';
          })
          .style('stroke-width', d => {
            return d.fx !== undefined ? 3 : 2;
          })
          .style('transform', null); // Reset scale

        linkElements
          .style('opacity', link => 0.4 + (link.value * 0.4))
          .style('stroke', link => 
            link.value > 0.5 ? colors.links.strong : colors.links.default
          );

        labelElements.style('opacity', 0.8);

        onNodeHover(null);
      });

    // Create simulation
    const simulation = createSimulation();
    if (!simulation) return;

    // Auto-stop simulation after initial layout
    let tickCount = 0;
    const maxTicks = 300; // Stop after 300 ticks for performance

    // Update positions on simulation tick
    simulation.on('tick', () => {
      tickCount++;
      
      // Stop simulation after stabilization
      if (tickCount > maxTicks || simulation.alpha() < 0.01) {
        simulation.stop();
      }
      linkElements
        .attr('x1', d => (d.source as TagNode).x || 0)
        .attr('y1', d => (d.source as TagNode).y || 0)
        .attr('x2', d => (d.target as TagNode).x || 0)
        .attr('y2', d => (d.target as TagNode).y || 0);

      nodeElements
        .attr('cx', d => d.x || 0)
        .attr('cy', d => d.y || 0);

      labelElements
        .attr('x', d => d.x || 0)
        .attr('y', d => (d.y || 0) + (nodeRadius.min + (d.size * 3)) + 18);

      badgeElements
        .attr('transform', d => 
          `translate(${(d.x || 0) + (nodeRadius.min + (d.size * 3)) - 5}, ${(d.y || 0) - (nodeRadius.min + (d.size * 3)) + 5})`
        );
    });

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Cleanup
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [data, config, createSimulation, onNodeClick, onNodeHover, getNodeColor]);

  return (
    <svg
      ref={svgRef}
      width={config.width}
      height={config.height}
      style={{ backgroundColor: config.colors.background }}
    />
  );
};

export default TagGraphVisualization;