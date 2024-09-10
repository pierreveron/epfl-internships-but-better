import { useEffect } from 'react'
import styles from '../styles/index.css?inline'
import loadingDots from '../styles/loading-dots.css?inline'

export default function App() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = styles + loadingDots
    document.currentScript?.parentElement?.appendChild(style)
  }, [])

  return (
    <div>
      <h1>Hello ISA EPFL!</h1>
    </div>
  )
}
