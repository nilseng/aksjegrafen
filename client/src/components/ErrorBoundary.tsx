import { Component, ErrorInfo } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ msg?: string }, ErrorBoundaryState> {
  constructor(props: { msg?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex justify-center items-center text-primary">
          {this.props.msg ?? "Beklager, noe gikk galt! 😬 Teodor har fått beskjed og kommer til å fikse det."}
        </div>
      );
    }

    return this.props.children;
  }
}
