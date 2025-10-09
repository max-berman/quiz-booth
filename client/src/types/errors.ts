/**
 * Custom error types for the application
 */

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

export class GameNotFoundError extends Error {
  code = 'GAME_NOT_FOUND'

  constructor(message: string = 'Game not found') {
    super(message)
    this.name = 'GameNotFoundError'
  }
}

export class PermissionDeniedError extends Error {
  code = 'PERMISSION_DENIED'

  constructor(message: string = 'Permission denied') {
    super(message)
    this.name = 'PermissionDeniedError'
  }
}

export class NetworkError extends Error {
  code = 'NETWORK_ERROR'

  constructor(message: string = 'Network error occurred') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends Error {
  code = 'VALIDATION_ERROR'

  constructor(message: string = 'Validation error') {
    super(message)
    this.name = 'ValidationError'
  }
}

export function isFirebaseError(error: any): boolean {
  return error && typeof error === 'object' && 'code' in error
}

export function createAppError(error: any): AppError {
  if (isFirebaseError(error)) {
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: error,
      timestamp: new Date(),
    }
  }

  if (error instanceof Error) {
    return {
      code: 'CLIENT_ERROR',
      message: error.message,
      details: error,
      timestamp: new Date(),
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    details: error,
    timestamp: new Date(),
  }
}
