// Mock implementation of d3 for testing
export const forceSimulation = jest.fn(() => ({
  nodes: jest.fn().mockReturnThis(),
  links: jest.fn().mockReturnThis(),
  force: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  stop: jest.fn().mockReturnThis(),
  restart: jest.fn().mockReturnThis(),
  tick: jest.fn().mockReturnThis(),
  alpha: jest.fn().mockReturnThis(),
  alphaTarget: jest.fn().mockReturnThis(),
}));

export const forceLink = jest.fn(() => ({
  id: jest.fn().mockReturnThis(),
  distance: jest.fn().mockReturnThis(),
  strength: jest.fn().mockReturnThis(),
}));

export const forceManyBody = jest.fn(() => ({
  strength: jest.fn().mockReturnThis(),
}));

export const forceCenter = jest.fn(() => jest.fn());

export const select = jest.fn(() => ({
  append: jest.fn().mockReturnThis(),
  attr: jest.fn().mockReturnThis(),
  style: jest.fn().mockReturnThis(),
  selectAll: jest.fn().mockReturnThis(),
  data: jest.fn().mockReturnThis(),
  enter: jest.fn().mockReturnThis(),
  exit: jest.fn().mockReturnThis(),
  remove: jest.fn().mockReturnThis(),
  merge: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  call: jest.fn().mockReturnThis(),
  node: jest.fn(() => ({ getBoundingClientRect: () => ({ width: 800, height: 600 }) })),
}));

export const scaleOrdinal = jest.fn(() => jest.fn((x: unknown) => '#000000'));

export const schemeCategory10 = ['#1f77b4', '#ff7f0e', '#2ca02c'];

export const zoom = jest.fn(() => ({
  scaleExtent: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
}));

export const zoomTransform = jest.fn(() => ({
  k: 1,
  x: 0,
  y: 0,
}));

export const drag = jest.fn(() => ({
  on: jest.fn().mockReturnThis(),
}));

export const event = {
  x: 0,
  y: 0,
  subject: {},
};

// Add any other d3 functions as needed for tests