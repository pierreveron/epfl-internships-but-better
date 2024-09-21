import { useContext } from 'react'
import { DataContext } from '../content/DataProvider' // Adjust import path as needed

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
