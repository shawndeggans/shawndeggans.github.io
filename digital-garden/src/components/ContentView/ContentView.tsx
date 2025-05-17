import React from 'react';
import { useParams } from 'react-router-dom';

const ContentView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  return (
    <div className="content-view">
      <h1>Content View</h1>
      <p>Viewing content with slug: {slug}</p>
      {/* Will implement markdown rendering in future tasks */}
    </div>
  );
};

export default ContentView;