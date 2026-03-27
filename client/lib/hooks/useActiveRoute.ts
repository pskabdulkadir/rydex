import { useLocation } from 'react-router-dom';

/**
 * Hook that checks if a given path matches the current route
 * Supports both exact matches and partial matches
 */
export function useActiveRoute(path: string, exact: boolean = false): boolean {
  const location = useLocation();
  const currentPath = location.pathname;

  if (exact) {
    return currentPath === path;
  }

  return currentPath.startsWith(path);
}

/**
 * Hook that returns the current pathname
 */
export function useCurrentPath(): string {
  const location = useLocation();
  return location.pathname;
}

/**
 * Hook that checks if user is on a specific tab/section
 */
export function useActiveTab(tabPath: string): boolean {
  const location = useLocation();
  return location.pathname === tabPath || location.hash.includes(tabPath);
}
