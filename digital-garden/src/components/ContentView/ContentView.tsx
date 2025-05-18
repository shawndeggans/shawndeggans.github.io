import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useContent } from '../../hooks/useContent';
import { processContentForDisplay, calculateReadingTime } from '../../utils/markdown';
import './ContentView.css';
import { useBacklinks } from '../../hooks/useBacklinks';
import { BacklinkFilters } from '../../types/backlinks';
import BacklinksSection from './BacklinksSection';
import RelatedContent from './RelatedContent';
import './BacklinkPreview.css';
import './BacklinkItem.css';
import './BacklinksSection.css';
import './RelatedContent.css';

const ContentView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { 
    getContent, 
    loadSingleContent, 
    loading, 
    error,
    contentMap,  // Added for backlinks functionality
    links        // Added for backlinks functionality
  } = useContent();
  const [content, setContent] = useState(getContent(slug || ''));

  // Enhanced backlinks state
  const [backlinkFilters, setBacklinkFilters] = useState<BacklinkFilters>({
    search: '',
    tags: [],
    dateRange: {},
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Enhanced backlinks hook
  const { incoming, outgoing, related } = useBacklinks(
    content,
    contentMap,
    links.map(link => ({
      source: link.from || '',
      target: link.to || ''
    })),
    backlinkFilters
  );

  useEffect(() => {
    if (slug) {
      const existingContent = getContent(slug);
      if (existingContent) {
        setContent(existingContent);
      } else {
        // Try to load the content if it's not in the cache
        loadSingleContent(slug).then(loadedContent => {
          if (loadedContent) {
            setContent(loadedContent);
          }
        });
      }
    }
  }, [slug, getContent, loadSingleContent]);

  if (loading) {
    return <div className="content-loading">Loading...</div>;
  }

  if (error) {
    return <div className="content-error">Error: {error}</div>;
  }

  if (!content) {
    return (
      <div className="content-not-found">
        <h1>Content Not Found</h1>
        <p>The requested content "{slug}" could not be found.</p>
        <Link to="/">Return to Graph View</Link>
      </div>
    );
  }

  const processedContent = processContentForDisplay(content.content);
  const readingTime = calculateReadingTime(content.content);

  return (
    <div className="content-view">
      <article className="content-article">
        <header className="content-header">
          <h1>{content.metadata.title}</h1>
          <div className="content-meta">
            <span className="content-date">{content.metadata.date}</span>
            <span className="content-reading-time">{readingTime} min read</span>
            {content.metadata.tags.length > 0 && (
              <div className="content-tags">
                {content.metadata.tags.map(tag => (
                  <span key={tag} className="content-tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="content-body">
          <div className="markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
        </div>

        {/* Enhanced backlinks section - replaces the simple links section */}
        {(incoming.length > 0 || outgoing.length > 0 || related.length > 0) && (
          <div className="content-backlinks">
            <BacklinksSection
              title="Referenced by"
              backlinks={incoming}
              contentMap={contentMap}
              emptyMessage="No content links to this page yet"
              showContext={true}
              maxDisplay={5}
            />
            
            <BacklinksSection
              title="References"
              backlinks={outgoing}
              contentMap={contentMap}
              emptyMessage="This content doesn't link to other pages"
              maxDisplay={5}
            />
            
            {related.length > 0 && (
              <RelatedContent related={related} maxDisplay={3} />
            )}
          </div>
        )}
      </article>

      <nav className="content-navigation">
        <Link to="/" className="nav-link">← Graph View</Link>
        <Link to="/timeline" className="nav-link">Timeline View</Link>
      </nav>
    </div>
  );
};

export default ContentView;