import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  handleError: (error: Error) => void
}

class ErrorBoundary extends Component<Props> {
  componentDidCatch(error: Error) {
    this.props.handleError(error)
  }

  render() {
    return this.props.children
  }
}

export default ErrorBoundary
