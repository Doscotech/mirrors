import { Suspense } from 'react';
import ProjectInner from './project-inner';

export default function ProjectPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading project...</div>}>
      <ProjectInner />
    </Suspense>
  );
}
