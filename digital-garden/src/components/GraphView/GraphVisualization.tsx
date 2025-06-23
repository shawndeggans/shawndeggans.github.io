import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphLink, GraphConfig } from '../../types/graph';

interface GraphVisualizationProps {
  data: GraphData;
  config: GraphConfig;
  onNodeClick: (node: GraphNode) => void;
  onNodeHover: (node: GraphNode | null) => void;
  selectedNodeId?: string;
}

export const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  data,
  config,
  onNodeClick,
  onNodeHover,
  selectedNodeId,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  
  // Obsidian-style state management
  const highlightedNodesRef = useRef<Set<string>>(new Set());
  const highlightedLinksRef = useRef<Set<string>>(new Set());
  const hoveredNodeRef = useRef<GraphNode | null>(null);
  
  // D3 element references for efficient updates
  const nodeElementsRef = useRef<d3.Selection<SVGCircleElement, GraphNode, SVGGElement, unknown> | null>(null);
  const linkElementsRef = useRef<d3.Selection<SVGLineElement, GraphLink, SVGGElement, unknown> | null>(null);
  const labelElementsRef = useRef<d3.Selection<SVGTextElement, GraphNode, SVGGElement, unknown> | null>(null);

  // Obsidian-style helper methods
  const clearHighlights = useCallback(() => {
    highlightedNodesRef.current.clear();
    highlightedLinksRef.current.clear();
  }, []);

  const isHighlightedNode = useCallback((node: GraphNode): boolean => {
    return highlightedNodesRef.current.has(node.id);
  }, []);

  const isHighlightedLink = useCallback((link: GraphLink): boolean => {
    return highlightedLinksRef.current.has(link.id);
  }, []);

  const getNodeColor = useCallback((node: GraphNode): string => {
    if (isHighlightedNode(node)) {
      // Node is highlighted
      return node === hoveredNodeRef.current
        ? config.colors.nodes.hover
        : config.colors.nodes.selected;
    } else {
      return node.id === selectedNodeId 
        ? config.colors.nodes.selected 
        : config.colors.nodes.default;
    }
  }, [config.colors, selectedNodeId, isHighlightedNode]);

  const getLinkColor = useCallback((link: GraphLink): string => {
    return isHighlightedLink(link) 
      ? config.colors.links.hover 
      : config.colors.links.default;
  }, [config.colors, isHighlightedLink]);

  const updateHighlight = useCallback(() => {
    // Trigger update of highlighted objects - Obsidian pattern
    if (nodeElementsRef.current) {
      nodeElementsRef.current
        .style('fill', getNodeColor)
        .style('opacity', d => {
          if (hoveredNodeRef.current === null) return 1;
          return isHighlightedNode(d) ? 1 : 0.3;
        })
        .style('stroke', d => d.fx !== undefined ? '#e74c3c' : '#fff')
        .style('stroke-width', d => {
          if (d === hoveredNodeRef.current) return 3;
          return d.fx !== undefined ? 2.5 : 1.5;
        });
    }

    if (linkElementsRef.current) {
      linkElementsRef.current
        .style('stroke', getLinkColor)
        .style('opacity', d => isHighlightedLink(d) ? 0.8 : 0.3)
        .style('stroke-width', d => isHighlightedLink(d) ? 2 : 1);
    }

    if (labelElementsRef.current) {
      labelElementsRef.current
        .style('opacity', d => d === hoveredNodeRef.current ? 1 : 0);
    }
  }, [getNodeColor, getLinkColor, isHighlightedNode, isHighlightedLink]);

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    if ((!node && !highlightedNodesRef.current.size) || 
        (node && hoveredNodeRef.current === node)) {
      return;
    }

    clearHighlights();

    if (node) {
      // Add the hovered node itself
      highlightedNodesRef.current.add(node.id);
      
      // Add all neighbors using pre-computed data
      node.neighbors.forEach(neighborId => {
        highlightedNodesRef.current.add(neighborId);
      });
      
      // Add all links using pre-computed data
      node.links.forEach(linkId => {
        highlightedLinksRef.current.add(linkId);
      });
    }
    
    hoveredNodeRef.current = node;
    updateHighlight();
    onNodeHover(node);
  }, [clearHighlights, updateHighlight, onNodeHover]);

  const createSimulation = useCallback(() => {
    if (!svgRef.current) return;

    const { width, height, forces } = config;
    
    // Clear previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Create new simulation with optimized forces
    const simulation = d3.forceSimulation<GraphNode, GraphLink>(data.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(data.links)
        .id(d => d.id)
        .strength(forces.link))
      .force('charge', d3.forceManyBody()
        .strength(-200)) // Reduced from -300 for less repulsion
      .force('center', d3.forceCenter(width / 2, height / 2)
        .strength(forces.center))
      .force('collision', d3.forceCollide()
        .radius((d: d3.SimulationNodeDatum) => {
          const node = d as GraphNode;
          return config.nodeRadius.min + (node.size * 2) + 5; // Added padding
        })
        .strength(forces.collision))
      .alphaDecay(0.02) // Slower cooling for smoother animation
      .velocityDecay(0.4); // Higher damping to reduce drift

    simulationRef.current = simulation;
    return simulation;
  }, [data, config]);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    const { colors, nodeRadius } = config;

    // Clear previous content
    svg.selectAll("*").remove();

    // Create container groups
    const container = svg.append('g').attr('class', 'graph-container');
    const linksGroup = container.append('g').attr('class', 'links');
    const nodesGroup = container.append('g').attr('class', 'nodes');

    // Create links with Obsidian-style setup
    const linkElements = linksGroup
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .style('stroke', getLinkColor)
      .style('stroke-width', 1)
      .style('stroke-opacity', 0.6);

    linkElementsRef.current = linkElements;

    // Create nodes with Obsidian-style setup
    const nodeElements = nodesGroup
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('r', d => nodeRadius.min + (d.size * 2))
      .style('fill', getNodeColor)
      .style('stroke', '#fff')
      .style('stroke-width', 1.5)
      .style('cursor', 'pointer');

    nodeElementsRef.current = nodeElements;

    // Create labels with Obsidian-style setup
    const labelElements = nodesGroup
      .selectAll('text')
      .data(data.nodes)
      .enter()
      .append('text')
      .text(d => d.title)
      .style('font-family', 'Open Sans, sans-serif')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#2c3e50')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('opacity', 0); // Hide labels initially

    labelElementsRef.current = labelElements;

    // Simplified Obsidian-style interactions
    nodeElements
      .on('mouseover', (_, d) => handleNodeHover(d))
      .on('mouseout', () => handleNodeHover(null))
      .on('click', (_, d) => {
        // Simple click handler - no drag conflicts
        onNodeClick(d);
      })
      .on('dblclick', (event, d) => {
        // Double-click to release fixed position
        event.stopPropagation();
        d.fx = undefined;
        d.fy = undefined;
        if (simulation) simulation.alpha(0.3).restart();
      })
      .call(d3.drag<SVGCircleElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active && simulation) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, _) => {
          if (!event.active && simulation) simulation.alphaTarget(0);
          // Keep node fixed after dragging (sticky behavior)
        })
      );

    // Update selected node appearance
    nodeElements
      .style('fill', d => d.id === selectedNodeId ? colors.nodes.selected : colors.nodes.default);

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
        .attr('x1', d => (d.source as GraphNode).x || 0)
        .attr('y1', d => (d.source as GraphNode).y || 0)
        .attr('x2', d => (d.target as GraphNode).x || 0)
        .attr('y2', d => (d.target as GraphNode).y || 0);

      nodeElements
        .attr('cx', d => d.x || 0)
        .attr('cy', d => d.y || 0);

      labelElements
        .attr('x', d => d.x || 0)
        .attr('y', d => (d.y || 0) + (nodeRadius.min + (d.size * 2)) + 15);
    });

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
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
  }, [data, config, createSimulation, onNodeClick, handleNodeHover, selectedNodeId, getNodeColor, getLinkColor]);

  return (
    <svg
      ref={svgRef}
      width={config.width}
      height={config.height}
      style={{ backgroundColor: config.colors.background }}
    />
  );
};