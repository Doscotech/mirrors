"use client";
import React from 'react';
import { ProjectCard, ProjectCardProps } from './ProjectCard';

export interface ProjectSummaryCarouselProps {
  projects: ProjectCardProps[];
  loading?: boolean;
  className?: string;
  variant?: 'grid' | 'scroll';
}

export function ProjectSummaryCarousel({ projects, loading, className, variant = 'grid' }: ProjectSummaryCarouselProps) {
  if (loading) {
    return <div className={className}>Loading projects…</div>;
  }
  if (!projects.length) {
    return <div className={className + ' text-[11px] text-muted-foreground/70'}>No projects.</div>;
  }
  if (variant === 'scroll') {
    return (
      <div className={className + ' flex gap-3 overflow-x-auto pb-1'}>
        {projects.map(p => <ProjectCard key={p.id} {...p} />)}
      </div>
    );
  }
  return (
    <div className={className + ' grid gap-3 sm:grid-cols-2 lg:grid-cols-3'}>
      {projects.map(p => <ProjectCard key={p.id} {...p} />)}
    </div>
  );
}

export default ProjectSummaryCarousel;
