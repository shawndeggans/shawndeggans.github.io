import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import './styles/global.css';

// Using HashRouter for GitHub Pages compatibility with Create React App
function App() {
  return (
    <Router>
      <div className="App">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;