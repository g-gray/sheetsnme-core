import * as t from '../types'

export class PublicError extends Error implements t.IPublicError {
  status: number
  body: any

  constructor(status: number, message: string, body?: any) {
    super(message)
    this.name = 'PublicError'
    this.status = status
    this.body = body
  }
}


export class BadRequest extends PublicError implements t.IBadRequest {
  constructor(message: string, body?: any) {
    super(t.HTTP_STATUS_CODES.BAD_REQUEST, message, body)
    this.name = 'BadRequest'
  }
}

export class NotFound extends PublicError implements t.INotFound {
  constructor(message: string) {
    super(t.HTTP_STATUS_CODES.NOT_FOUND, message)
    this.name = 'NotFound'
  }
}

export class Unauthorized extends PublicError implements t.IUnauthorized {
  constructor(message: string) {
    super(t.HTTP_STATUS_CODES.UNAUTHORIZED, message)
    this.name = 'Unauthorized'
  }
}

export class NotAcceptable extends PublicError implements t.IUnauthorized {
  constructor(message: string) {
    super(t.HTTP_STATUS_CODES.NOT_ACCEPTABLE, message)
    this.name = 'NotAcceptable'
  }
}


export class ValidationError extends PublicError implements t.IValidationError {
  body: any

  constructor(body?: t.ValidationErrorBody) {
    super(t.HTTP_STATUS_CODES.BAD_REQUEST, 'ValidationError', body)
    this.name = 'ValidationError'
  }
}
