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

    // Create new simulation with adjusted forces for tags
    const simulation = d3.forceSimulation<TagNode, TagLink>(data.nodes)
      .force('link', d3.forceLink<TagNode, TagLink>(data.links)
        .id(d => d.id)
        .strength(link => forces.link * link.value)) // Scale by connection strength
      .force('charge', d3.forceManyBody().strength(forces.charge))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(forces.center))
      .force('collision', d3.forceCollide()
        .radius((d: d3.SimulationNodeDatum) => {
          const node = d as TagNode;
          return config.nodeRadius.min * (1 + node.size);
        })
        .strength(forces.collision));

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
    const { width, height, colors, nodeRadius } = config;

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

    // Add interactions
    nodeElements
      .on('click', (event, d) => {
        onNodeClick(d);
      })
      .on('mouseenter', (event, d) => {
        // Highlight connected tags and links
        const connectedTags = new Set([d.id]);
        const connectedLinks = data.links.filter(link => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          if (sourceId === d.id) {
            connectedTags.add(targetId);
            return true;
          }
          if (targetId === d.id) {
            connectedTags.add(sourceId);
            return true;
          }
          return false;
        });

        // Update node styles
        nodeElements
          .style('opacity', node => connectedTags.has(node.id) ? 1 : 0.3)
          .style('fill', node => {
            if (node.id === d.id) return colors.nodes.hover;
            return getNodeColor(node);
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
          .style('fill', getNodeColor);

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

    // Update positions on simulation tick
    simulation.on('tick', () => {
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