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

  const createSimulation = useCallback(() => {
    if (!svgRef.current) return;

    const { width, height, forces } = config;
    
    // Clear previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Create new simulation
    const simulation = d3.forceSimulation<GraphNode, GraphLink>(data.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(data.links)
        .id(d => d.id)
        .strength(forces.link))
      .force('charge', d3.forceManyBody().strength(forces.charge))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(forces.center))
      .force('collision', d3.forceCollide()
        .radius((d: d3.SimulationNodeDatum) => config.nodeRadius.min * (d as GraphNode).size)
        .strength(forces.collision));

    simulationRef.current = simulation;
    return simulation;
  }, [data, config]);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    const { width, height, colors, nodeRadius } = config;

    // Clear previous content
    svg.selectAll("*").remove();

    // Create container groups
    const container = svg.append('g').attr('class', 'graph-container');
    const linksGroup = container.append('g').attr('class', 'links');
    const nodesGroup = container.append('g').attr('class', 'nodes');

    // Create links
    const linkElements = linksGroup
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .style('stroke', colors.links.default)
      .style('stroke-width', 1)
      .style('stroke-opacity', 0.6);

    // Create nodes
    const nodeElements = nodesGroup
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('r', d => nodeRadius.min + (d.size * 2))
      .style('fill', colors.nodes.default)
      .style('stroke', '#fff')
      .style('stroke-width', 1.5)
      .style('cursor', 'pointer');

    // Create labels
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

    // Add interactions
    nodeElements
      .on('click', (event, d) => {
        onNodeClick(d);
      })
      .on('mouseenter', (event, d) => {
        // Highlight connected nodes and links
        const connectedNodes = new Set([d.id]);
        const connectedLinks = data.links.filter(link => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          if (sourceId === d.id) {
            connectedNodes.add(targetId);
            return true;
          }
          if (targetId === d.id) {
            connectedNodes.add(sourceId);
            return true;
          }
          return false;
        });

        // Update node styles
        nodeElements
          .style('opacity', node => connectedNodes.has(node.id) ? 1 : 0.3)
          .style('fill', node => {
            if (node.id === d.id) return colors.nodes.hover;
            return connectedNodes.has(node.id) ? colors.nodes.default : colors.nodes.default;
          });

        // Update link styles
        linkElements
          .style('opacity', link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
            const targetId = typeof link.target === 'string' ? link.target : link.target.id;
            return (sourceId === d.id || targetId === d.id) ? 1 : 0.1;
          })
          .style('stroke', link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
            const targetId = typeof link.target === 'string' ? link.target : link.target.id;
            return (sourceId === d.id || targetId === d.id) ? colors.links.hover : colors.links.default;
          });

        // Show label for hovered node
        labelElements
          .style('opacity', node => node.id === d.id ? 1 : 0);

        onNodeHover(d);
      })
      .on('mouseleave', () => {
        // Reset all styles
        nodeElements
          .style('opacity', 1)
          .style('fill', d => d.id === selectedNodeId ? colors.nodes.selected : colors.nodes.default);

        linkElements
          .style('opacity', 0.6)
          .style('stroke', colors.links.default);

        labelElements.style('opacity', 0);

        onNodeHover(null);
      });

    // Update selected node appearance
    nodeElements
      .style('fill', d => d.id === selectedNodeId ? colors.nodes.selected : colors.nodes.default);

    // Create simulation
    const simulation = createSimulation();
    if (!simulation) return;

    // Update positions on simulation tick
    simulation.on('tick', () => {
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
  }, [data, config, createSimulation, onNodeClick, onNodeHover, selectedNodeId]);

  return (
    <svg
      ref={svgRef}
      width={config.width}
      height={config.height}
      style={{ backgroundColor: config.colors.background }}
    />
  );
};