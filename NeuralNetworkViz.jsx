import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

const NeuralNetworkViz = ({ inputs, weights, activations }) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });

  const layers = [
    { nodes: 4, name: 'Input' },
    { nodes: 6, name: 'Hidden' },
    { nodes: 1, name: 'Output' }
  ];

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate node positions
    const layerSpacing = width / (layers.length - 1);
    const nodes = [];
    const links = [];

    layers.forEach((layer, i) => {
      const nodeSpacing = height / (layer.nodes + 1);
      for (let j = 0; j < layer.nodes; j++) {
        nodes.push({
          x: i * layerSpacing,
          y: (j + 1) * nodeSpacing,
          layer: i,
          index: j,
          value: activations?.[i]?.[j] || 0
        });
      }
    });

    // Create connections
    for (let i = 0; i < layers.length - 1; i++) {
      const currentLayer = nodes.filter(n => n.layer === i);
      const nextLayer = nodes.filter(n => n.layer === i + 1);
      
      currentLayer.forEach(current => {
        nextLayer.forEach(next => {
          links.push({
            source: current,
            target: next,
            weight: weights?.[i]?.[current.index]?.[next.index] || 0
          });
        });
      });
    }

    // Draw connections
    g.selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)
      .style("stroke", "#999")
      .style("stroke-opacity", 0.6)
      .style("stroke-width", d => Math.abs(d.weight) * 2);

    // Draw nodes
    const nodes_g = g.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    nodes_g.append("circle")
      .attr("r", 20)
      .style("fill", d => d3.interpolateReds(d.value))
      .style("stroke", "#666")
      .style("stroke-width", 1.5);

    nodes_g.append("text")
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text(d => d.value.toFixed(2));
  }, [dimensions, weights, activations]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border rounded shadow-sm"
      />
    </div>
  );
};

export default NeuralNetworkViz;
