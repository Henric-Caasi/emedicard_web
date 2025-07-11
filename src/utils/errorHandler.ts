import { logAuthError, getUserFriendlyErrorMessage as getAuthUserFriendlyErrorMessage, isNetworkError as isAuthNetworkError, isRateLimitError as isAuthRateLimitError } from './authErrorHandler';

// --- General Error Handling ---

export interface AppError {
  id: string;
  type: 'Authentication' | 'DataFetching' | 'FormSubmission' | 'Validation' | 'Unknown';
  message: string;
  title: string;
  isRetryable: boolean;
  originalError: any;
}

export const createAppError = (error: any, type: AppError['type'] = 'Unknown'): AppError => {
  const id = `err_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;
  let title = 'An Unexpected Error Occurred';
  let message = 'Something went wrong. Please try again later.';
  let isRetryable = false;

  if (type === 'Authentication') {
    title = 'Authentication Failed';
    message = getAuthUserFriendlyErrorMessage(error);
    isRetryable = !isAuthRateLimitError(error);
  } else if (isAuthNetworkError(error)) {
    type = 'DataFetching';
    title = 'Network Error';
    message = 'Could not connect to the server. Please check your internet connection and try again.';
    isRetryable = true;
  } else if (type === 'DataFetching') {
    title = 'Failed to Load Data';
    message = 'We couldn’t retrieve the necessary data. Please try again.';
    isRetryable = true;
  } else if (type === 'FormSubmission') {
    title = 'Submission Failed';
    message = 'Your submission could not be processed. Please check your input and try again.';
    isRetryable = true;
  } else if (type === 'Validation') {
    title = 'Invalid Input';
    message = error.message || 'Please check the form for errors.';
    isRetryable = false;
  }

  // Log the error for debugging
  logError(error, { type, id });

  return { id, type, title, message, isRetryable, originalError: error };
};

export const logError = (error: any, context: Record<string, any> = {}) => {
  if (context.type === 'Authentication') {
    logAuthError(error, {
      email: 'N/A',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context,
    });
  } else {
    console.group(`Application Error - ${context.type || 'Unknown'}`);
    console.error('Error ID:', context.id || 'N/A');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Context:', context);
    console.error('Error Object:', error);
    console.groupEnd();
  }
};
