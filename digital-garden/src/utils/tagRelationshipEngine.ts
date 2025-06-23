/**
 * Tag Relationship Engine
 * 
 * Calculates tag co-occurrence relationships and clustering.
 * Supports both same-file clustering and cross-document tag linking.
 */

import { TagToTagLink } from '../types/unifiedGraph';

// Tag relationship data structures
export interface TagRelationship {
  tag1: string;
  tag2: string;
  cooccurrenceCount: number;
  strength: number;
  documents: string[];           // Document IDs where both tags appear
  contexts: TagContext[];        // Different contexts where tags co-occur
}

export interface TagContext {
  documentId: string;
  documentTitle: string;
  otherTags: string[];          // Other tags in the same document
  relevanceScore: number;       // How relevant this context is
}

export interface TagCluster {
  id: string;
  name: string;
  tags: string[];
  strength: number;             // Internal cohesion strength
  centralTag?: string;          // Most connected tag in cluster
  documents: string[];          // Documents that contribute to this cluster
}

export interface TagMetrics {
  tag: string;
  frequency: number;            // Number of documents with this tag
  connectivity: number;         // Number of other tags connected to this one
  centrality: number;           // Importance in the tag network
  clusters: string[];           // Cluster IDs this tag belongs to
}

// Content data interface for tag analysis
interface TaggedContent {
  id: string;
  title: string;
  tags: string[];
  date?: string;
}

/**
 * Main tag relationship engine class
 */
export class TagRelationshipEngine {
  private relationships: Map<string, TagRelationship> = new Map();
  private tagMetrics: Map<string, TagMetrics> = new Map();
  private clusters: TagCluster[] = [];
  private lastProcessed: Date | null = null;

  /**
   * Process content and build tag relationships
   */
  processTagRelationships(content: TaggedContent[]): void {
    console.log('🏷️ Processing tag relationships...');
    
    this.relationships.clear();
    this.tagMetrics.clear();
    this.clusters = [];

    // Step 1: Calculate tag frequencies
    const tagFrequencies = this.calculateTagFrequencies(content);

    // Step 2: Find co-occurrences
    this.calculateCooccurrences(content, tagFrequencies);

    // Step 3: Calculate tag metrics
    this.calculateTagMetrics(tagFrequencies);

    // Step 4: Identify clusters
    this.identifyClusters();

    this.lastProcessed = new Date();
    
    console.log(`✅ Processed ${this.relationships.size} tag relationships`);
    console.log(`🎯 Identified ${this.clusters.length} tag clusters`);
  }

  /**
   * Get tag relationships as graph links
   */
  getTagLinks(minStrength: number = 0.1): TagToTagLink[] {
    const links: TagToTagLink[] = [];

    for (const relationship of this.relationships.values()) {
      if (relationship.strength >= minStrength) {
        const link: TagToTagLink = {
          id: `tag-cooccurrence:${relationship.tag1}-${relationship.tag2}`,
          source: `tag:${relationship.tag1}`,
          target: `tag:${relationship.tag2}`,
          type: 'tag_cooccurrence',
          weight: relationship.strength,
          metadata: {
            cooccurrenceCount: relationship.cooccurrenceCount,
            strength: relationship.strength
          }
        };

        links.push(link);
      }
    }

    return links;
  }

  /**
   * Get related tags for a specific tag
   */
  getRelatedTags(tag: string, limit: number = 10): string[] {
    const related: Array<{ tag: string; strength: number }> = [];

    for (const relationship of this.relationships.values()) {
      if (relationship.tag1 === tag) {
        related.push({ tag: relationship.tag2, strength: relationship.strength });
      } else if (relationship.tag2 === tag) {
        related.push({ tag: relationship.tag1, strength: relationship.strength });
      }
    }

    return related
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit)
      .map(item => item.tag);
  }

  /**
   * Get tag clusters
   */
  getTagClusters(): TagCluster[] {
    return [...this.clusters];
  }

  /**
   * Get tag metrics
   */
  getTagMetrics(tag?: string): TagMetrics | Map<string, TagMetrics> {
    if (tag) {
      return this.tagMetrics.get(tag) || this.createEmptyMetrics(tag);
    }
    return new Map(this.tagMetrics);
  }

  /**
   * Find tags that should be suggested based on existing tags
   */
  suggestTags(existingTags: string[], limit: number = 5): string[] {
    const suggestions = new Map<string, number>();

    for (const tag of existingTags) {
      const related = this.getRelatedTags(tag, 20);
      
      for (let i = 0; i < related.length; i++) {
        const relatedTag = related[i];
        
        // Skip if already in existing tags
        if (existingTags.includes(relatedTag)) {
          continue;
        }

        // Weight by position (earlier = stronger relationship)
        const weight = 1 - (i / related.length);
        suggestions.set(relatedTag, (suggestions.get(relatedTag) || 0) + weight);
      }
    }

    return Array.from(suggestions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(item => item[0]);
  }

  /**
   * Calculate semantic similarity between two tags
   */
  calculateTagSimilarity(tag1: string, tag2: string): number {
    const relationshipKey = this.getRelationshipKey(tag1, tag2);
    const relationship = this.relationships.get(relationshipKey);
    
    if (!relationship) {
      return 0;
    }

    return relationship.strength;
  }

  /**
   * Private methods
   */

  private calculateTagFrequencies(content: TaggedContent[]): Map<string, number> {
    const frequencies = new Map<string, number>();

    for (const item of content) {
      for (const tag of item.tags) {
        frequencies.set(tag, (frequencies.get(tag) || 0) + 1);
      }
    }

    return frequencies;
  }

  private calculateCooccurrences(content: TaggedContent[], frequencies: Map<string, number>): void {
    for (const item of content) {
      const tags = item.tags;
      
      // Generate all pairs of tags in this content
      for (let i = 0; i < tags.length; i++) {
        for (let j = i + 1; j < tags.length; j++) {
          const tag1 = tags[i];
          const tag2 = tags[j];
          
          this.addCooccurrence(tag1, tag2, item, frequencies);
        }
      }
    }
  }

  private addCooccurrence(
    tag1: string, 
    tag2: string, 
    content: TaggedContent, 
    frequencies: Map<string, number>
  ): void {
    const relationshipKey = this.getRelationshipKey(tag1, tag2);
    let relationship = this.relationships.get(relationshipKey);

    if (!relationship) {
      relationship = {
        tag1: tag1 < tag2 ? tag1 : tag2,
        tag2: tag1 < tag2 ? tag2 : tag1,
        cooccurrenceCount: 0,
        strength: 0,
        documents: [],
        contexts: []
      };
      this.relationships.set(relationshipKey, relationship);
    }

    // Update co-occurrence data
    relationship.cooccurrenceCount++;
    relationship.documents.push(content.id);

    // Add context
    const context: TagContext = {
      documentId: content.id,
      documentTitle: content.title,
      otherTags: content.tags.filter(t => t !== tag1 && t !== tag2),
      relevanceScore: this.calculateContextRelevance(content.tags)
    };
    relationship.contexts.push(context);

    // Calculate relationship strength using multiple factors
    const tag1Freq = frequencies.get(tag1) || 1;
    const tag2Freq = frequencies.get(tag2) || 1;
    
    // Jaccard-like coefficient with modifications
    const minFreq = Math.min(tag1Freq, tag2Freq);
    const maxFreq = Math.max(tag1Freq, tag2Freq);
    
    // Base strength: how often they appear together vs how often they appear separately
    const baseStrength = relationship.cooccurrenceCount / minFreq;
    
    // Frequency balance: prefer tags with similar frequencies
    const frequencyBalance = minFreq / maxFreq;
    
    // Context quality: average relevance of contexts
    const avgContextRelevance = relationship.contexts.reduce(
      (sum, ctx) => sum + ctx.relevanceScore, 0
    ) / relationship.contexts.length;

    // Combined strength (weighted average)
    relationship.strength = (
      baseStrength * 0.5 +
      frequencyBalance * 0.3 +
      avgContextRelevance * 0.2
    );

    // Normalize to 0-1 range
    relationship.strength = Math.min(relationship.strength, 1);
  }

  private calculateContextRelevance(allTags: string[]): number {
    // More tags in common context = higher relevance
    // Fewer total tags = more focused context
    const otherTagCount = allTags.length - 2; // Exclude the two tags we're analyzing
    
    if (otherTagCount === 0) {
      return 1; // Perfect focus on just these two tags
    }
    
    // Diminishing returns for larger tag sets
    return 1 / (1 + Math.log(1 + otherTagCount));
  }

  private calculateTagMetrics(frequencies: Map<string, number>): void {
    for (const [tag, frequency] of frequencies) {
      const connectivity = this.calculateTagConnectivity(tag);
      const centrality = this.calculateTagCentrality(tag);
      
      const metrics: TagMetrics = {
        tag,
        frequency,
        connectivity,
        centrality,
        clusters: [] // Will be filled when clusters are identified
      };

      this.tagMetrics.set(tag, metrics);
    }
  }

  private calculateTagConnectivity(tag: string): number {
    let connections = 0;
    
    for (const relationship of this.relationships.values()) {
      if (relationship.tag1 === tag || relationship.tag2 === tag) {
        connections++;
      }
    }
    
    return connections;
  }

  private calculateTagCentrality(tag: string): number {
    // Simple degree centrality for now
    // Could be enhanced with eigenvector centrality or PageRank
    const connectivity = this.calculateTagConnectivity(tag);
    const maxPossibleConnections = this.tagMetrics.size - 1;
    
    return maxPossibleConnections > 0 ? connectivity / maxPossibleConnections : 0;
  }

  private identifyClusters(): void {
    // Simple clustering based on relationship strengths
    // Could be enhanced with more sophisticated algorithms
    
    const processedTags = new Set<string>();
    const clusters: TagCluster[] = [];

    for (const [tag] of this.tagMetrics) {
      if (processedTags.has(tag)) {
        continue;
      }

      // Start a new cluster with this tag
      const cluster = this.buildClusterFromSeed(tag, processedTags);
      
      if (cluster.tags.length > 1) { // Only keep multi-tag clusters
        clusters.push(cluster);
      }
    }

    this.clusters = clusters;

    // Update tag metrics with cluster information
    for (const cluster of clusters) {
      for (const tag of cluster.tags) {
        const metrics = this.tagMetrics.get(tag);
        if (metrics) {
          metrics.clusters.push(cluster.id);
        }
      }
    }
  }

  private buildClusterFromSeed(seedTag: string, processedTags: Set<string>): TagCluster {
    const clusterTags = new Set([seedTag]);
    const clusterDocuments = new Set<string>();
    processedTags.add(seedTag);

    // Find strongly connected tags
    const relatedTags = this.getRelatedTags(seedTag, 10);
    
    for (const relatedTag of relatedTags) {
      if (processedTags.has(relatedTag)) {
        continue;
      }

      const similarity = this.calculateTagSimilarity(seedTag, relatedTag);
      
      if (similarity > 0.3) { // Threshold for cluster inclusion
        clusterTags.add(relatedTag);
        processedTags.add(relatedTag);
      }
    }

    // Collect documents for this cluster
    for (const relationship of this.relationships.values()) {
      if (clusterTags.has(relationship.tag1) && clusterTags.has(relationship.tag2)) {
        relationship.documents.forEach((doc: string) => clusterDocuments.add(doc));
      }
    }

    // Calculate cluster strength (average internal relationships)
    let totalStrength = 0;
    let relationshipCount = 0;

    for (const relationship of this.relationships.values()) {
      if (clusterTags.has(relationship.tag1) && clusterTags.has(relationship.tag2)) {
        totalStrength += relationship.strength;
        relationshipCount++;
      }
    }

    const avgStrength = relationshipCount > 0 ? totalStrength / relationshipCount : 0;

    return {
      id: `cluster-${seedTag}`,
      name: this.generateClusterName(Array.from(clusterTags)),
      tags: Array.from(clusterTags),
      strength: avgStrength,
      centralTag: seedTag,
      documents: Array.from(clusterDocuments)
    };
  }

  private generateClusterName(tags: string[]): string {
    // Simple cluster naming based on most common themes
    const sortedTags = tags.sort((a, b) => {
      const aMetrics = this.tagMetrics.get(a);
      const bMetrics = this.tagMetrics.get(b);
      return (bMetrics?.frequency || 0) - (aMetrics?.frequency || 0);
    });

    return sortedTags.slice(0, 2).join(' & ');
  }

  private getRelationshipKey(tag1: string, tag2: string): string {
    return tag1 < tag2 ? `${tag1}::${tag2}` : `${tag2}::${tag1}`;
  }

  private createEmptyMetrics(tag: string): TagMetrics {
    return {
      tag,
      frequency: 0,
      connectivity: 0,
      centrality: 0,
      clusters: []
    };
  }

  /**
   * Public utilities
   */

  getLastProcessed(): Date | null {
    return this.lastProcessed;
  }

  isProcessed(): boolean {
    return this.lastProcessed !== null;
  }

  getRelationshipCount(): number {
    return this.relationships.size;
  }

  getClusterCount(): number {
    return this.clusters.length;
  }
}

// Export singleton instance
export const tagRelationshipEngine = new TagRelationshipEngine();