import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Alert } from 'react-native';
import { Typography } from './Typography';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    // TODO: Send to error reporting service
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center p-8 bg-surface-50">
          <Typography variant="h2" className="text-surface-900 text-center mb-2">
            Something went wrong
          </Typography>
          <Typography variant="body" className="text-surface-500 text-center mb-6">
            We're sorry, an unexpected error occurred. Please try again.
          </Typography>
          <Button 
            title="Try Again" 
            onPress={this.handleRetry}
            size="lg"
          />
          {__DEV__ && this.state.error && (
            <View className="mt-4 p-4 bg-danger-50 rounded-lg">
              <Typography variant="small" className="text-danger-600 font-mono">
                {this.state.error.message}
              </Typography>
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}
