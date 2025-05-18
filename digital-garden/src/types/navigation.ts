export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  isActive?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface ViewState {
  currentView: 'graph' | 'timeline' | 'content';
  contentSlug?: string;
  previousView?: 'graph' | 'timeline';
}