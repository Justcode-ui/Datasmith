import React from 'react';
import { StepIndicator } from './StepIndicator';
import { Github } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-[var(--color-border-default)] bg-[var(--color-bg-base)]/80 backdrop-blur-md z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-gradient)] flex items-center justify-center text-white shadow-lg shadow-orange-950/20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] font-mono">
          Datasmith
        </span>
      </div>

      <StepIndicator />

      <a 
        href="https://github.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-elevated)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] group"
      >
        <Github size={18} />
        <span className="text-xs font-medium">Star on GitHub</span>
      </a>
    </nav>
  );
};
