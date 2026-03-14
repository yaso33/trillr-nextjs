import { useAuth } from '@/contexts/AuthContext'
import { ErrorLogger, UnauthorizedError, getUserErrorMessage } from '@/lib/errorHandler'
import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'

type AuthenticatedMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  'mutationFn'
>

export function useAuthenticatedMutation<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables, user: any) => Promise<TData>,
  options: AuthenticatedMutationOptions<TData, TVariables> = {}
) {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation<TData, Error, TVariables>({
    ...options,
    mutationFn: async (variables: TVariables) => {
      if (!user) {
        throw new UnauthorizedError('You must be logged in to perform this action.')
      }
      try {
        return await mutationFn(variables, user)
      } catch (error) {
        // The logger can handle normalization
        ErrorLogger.log(error, 'AuthenticatedMutation')
        // Re-throw the original error to let react-query handle it
        throw error
      }
    },
    onError: (error, variables, context) => {
      toast({
        title: 'An error occurred',
        description: getUserErrorMessage(error),
        variant: 'destructive',
      })
      // Call original onError if it was provided
      if (options.onError) {
        options.onError(error, variables, context)
      }
    },
    onSuccess: (data, variables, context) => {
      // Optimistically invalidate queries, could be made more specific
      queryClient.invalidateQueries()
      if (options.onSuccess) {
        options.onSuccess(data, variables, context)
      }
    },
  })
}
