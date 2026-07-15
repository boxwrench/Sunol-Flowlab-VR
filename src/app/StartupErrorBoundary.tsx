import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class StartupErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Sunol FlowLab VR failed to start', error, info)
  }

  render() {
    if (this.state.error !== null) {
      return (
        <main className="startup-error" role="alert">
          <h1>Sunol FlowLab VR could not start</h1>
          <p>
            Reload the page. If the problem continues, report the browser and
            the message below.
          </p>
          <pre>{this.state.error.message}</pre>
        </main>
      )
    }

    return this.props.children
  }
}
