/**
 * Premika App-Level Error Boundary
 * Catches unhandled rendering exceptions and displays a luxury recovery screen
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react-native';
import { LIGHT_THEME } from '@/theme/colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled App Error Boundary Catch:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <AlertTriangle size={48} color="#78201E" />
            </View>

            <Text style={styles.title}>Something Went Wrong</Text>
            <Text style={styles.subtitle}>
              We encountered an unexpected error. Please try refreshing or restarting the application.
            </Text>

            {this.state.error?.message && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText} numberOfLines={3}>
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <Pressable style={styles.button} onPress={this.handleReset}>
              <RefreshCw size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 360,
    width: '100%',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Urbanist_700Bold',
    color: '#221515',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Urbanist_400Regular',
    color: '#6B5958',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#F7F4F0',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EADFD7',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Urbanist_500Medium',
    color: '#998685',
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#78201E',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Urbanist_600SemiBold',
  },
});
