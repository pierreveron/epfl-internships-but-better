import { useCallback, useState } from 'react'

export const useAsyncError = () => {
  const [, setError] = useState()
  return useCallback(
    (e: unknown) => {
      setError(() => {
        throw e
      })
    },
    [setError],
  )
}
