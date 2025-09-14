import { createMutationHook, createQueryHook } from "@/hooks/use-query";
import { getProject, getPublicProjects, Project, updateProject, listProjects, getProjectDetail } from "./utils";
import { threadKeys } from './keys';

export const useProjectQuery = (projectId: string | undefined) =>
  createQueryHook(
    threadKeys.project(projectId || ""),
    () =>
      projectId
        ? getProject(projectId)
        : Promise.reject("No project ID"),
    {
      enabled: !!projectId,
      retry: 1,
    }
  )();

export const useProjectDetailQuery = (projectId: string | undefined) =>
  createQueryHook(
    threadKeys.project(projectId || ""),
    () =>
      projectId
        ? getProjectDetail(projectId)
        : Promise.reject("No project ID"),
    {
      enabled: !!projectId,
      retry: 1,
    }
  )();

export const useUpdateProjectMutation = () =>
  createMutationHook(
    ({
      projectId,
      data,
    }: {
      projectId: string;
      data: Partial<Project>;
    }) => updateProject(projectId, data)
  )();

export const usePublicProjectsQuery = () =>
    createQueryHook(
      threadKeys.publicProjects(),
      () =>
        getPublicProjects(),
      {
        retry: 1,
      }
    )();

export const useProjectsQuery = (q?: string) =>
  createQueryHook(
    threadKeys.projects(q),
    () => listProjects(q),
    { retry: 1 }
  )();