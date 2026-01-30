import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View } from 'react-native';
import { colors, spacing } from '../../design/tokens';
import { Typography } from './Typography';
import { ErrorState } from './ErrorState';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Custom error title */
  errorTitle?: string;
  /** Custom error message */
  errorMessage?: string;
  /** Callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    // TODO: Send to error reporting service (e.g., Sentry, Crashlytics)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleDismiss = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface[50],
          }}
        >
          <ErrorState
            title={this.props.errorTitle || 'Something went wrong'}
            message={this.props.errorMessage || 'We\'re sorry, an unexpected error occurred. Please try again.'}
            error={this.state.error ?? undefined}
            onRetry={this.handleRetry}
            onDismiss={this.handleDismiss}
            showDetails={__DEV__}
          />
        </View>
      );
    }

    return this.props.children;
  }
}
