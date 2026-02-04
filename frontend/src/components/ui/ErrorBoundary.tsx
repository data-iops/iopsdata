"use client";

import type { ReactNode } from "react";
import { Component } from "react";

import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { logError, normalizeError, type AppError } from "@/lib/errors";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  resetKey?: string | number;
};

type ErrorBoundaryState = {
  error: AppError | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error: normalizeError(error) };
  }

  componentDidCatch(error: Error) {
    logError(error, "ErrorBoundary");
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.props.resetKey !== prevProps.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { children, fallback } = this.props;
    const { error } = this.state;

    if (error) {
      if (fallback) return fallback;
      return (
        <div className="p-6">
          <ErrorMessage error={error} onRetry={this.handleRetry} />
        </div>
      );
    }

    return children;
  }
}
