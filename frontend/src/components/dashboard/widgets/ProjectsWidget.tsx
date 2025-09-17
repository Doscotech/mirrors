"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FolderOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/lib/api';

export const ProjectsWidget: React.FC = () => {
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', 'list'],
    queryFn: getProjects,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Card className="backdrop-blur bg-card/80">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Workspaces and threads</CardDescription>
        </div>
        <Link aria-label="Open projects" prefetch href="/projects" className="text-muted-foreground hover:text-primary transition">
          <FolderOpen className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {projectsLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (projects?.length ?? 0) > 0 ? (
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <div className="text-2xl font-semibold">{projects?.length ?? 0}</div>
              <Link href="/projects" className="text-xs text-primary underline underline-offset-4">Open projects</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">No projects yet.</div>
            <div className="flex gap-2">
              <Link href="/projects">
                <Button size="sm">Create your first project</Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
