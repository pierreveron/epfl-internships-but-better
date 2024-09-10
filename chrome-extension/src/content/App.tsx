import { useEffect, useRef } from 'react'
import styles from '../styles/index.css?inline'
import loadingDots from '../styles/loading-dots.css?inline'

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const style = document.createElement('style')
      style.textContent = styles + loadingDots
      containerRef.current.getRootNode().appendChild(style)
    }
  }, [])

  return (
    <div ref={containerRef}>
      <h1 className="tw-text-3xl tw-font-bold tw-underline">Hello ISA EPFL!</h1>
    </div>
  )
}
