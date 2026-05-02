import React, { useEffect, useState } from 'react';
import { GlobalLoading } from '../ui/GlobalLoading';

interface Props {
  /** The data dependencies that must be resolved (truthy) before rendering */
  resolve: any[];
  /** Optional message to show during resolution */
  message?: string;
  /** The component to render once resolved */
  children: React.ReactNode;
}

/**
 * RouteResolver simulates Angular Resolvers by ensuring data dependencies 
 * are met before rendering children.
 */
export const RouteResolver: React.FC<Props> = ({ resolve, message, children }) => {
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    // Check if all dependencies are resolved
    const allResolved = resolve.every(dep => {
      if (Array.isArray(dep)) return dep.length > 0;
      return !!dep;
    });

    if (allResolved) {
      // Small artificial delay for a smooth "Angular-like" transition
      const timer = setTimeout(() => setIsResolved(true), 150);
      return () => clearTimeout(timer);
    } else {
      setIsResolved(false);
    }
  }, [resolve]);

  if (!isResolved) {
    return <GlobalLoading message={message || "Resolving data..."} />;
  }

  return <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">{children}</div>;
};
