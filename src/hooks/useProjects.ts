// src/hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query'
import type { Project } from '../types/personio'

interface UseProjectsOptions {
  activeOnly?: boolean
}

export function useProjects({ activeOnly = false }: UseProjectsOptions = {}) {
  return useQuery<Project[]>({
    queryKey: ['projects', { activeOnly }],
    queryFn: async () => {
      const response = await fetch(`/api/personio/projects${activeOnly ? '?active=true' : ''}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }
      return response.json()
    }
  })
}