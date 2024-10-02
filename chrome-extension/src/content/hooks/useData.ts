import { useContext } from 'react'
import { DataContext } from '../contexts/DataContext'

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
