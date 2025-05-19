import React from 'react';
import { useContent } from '../../hooks/useContent';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './AboutView.css';

export const AboutView: React.FC = () => {
  const { getContent, loading, error } = useContent();
  const content = getContent('about');

  if (loading) {
    return (
      <div className="about-view">
        <div className="about-loading">
          <div className="loading-spinner"></div>
          <p>Loading about page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="about-view">
        <div className="about-error">
          <h1>Error Loading About Page</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="about-view">
        <div className="about-not-found">
          <h1>About Page Not Found</h1>
          <p>The about page content could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="about-view">
      <article className="about-content">
        <header className="about-header">
          <h1>{content.metadata.title}</h1>
          {content.metadata.date && (
            <time className="about-date">
              {new Date(content.metadata.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
        </header>

        <div className="about-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
};

export default AboutView;