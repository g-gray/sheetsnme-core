export enum HTTP_STATUS_CODES {
  BAD_REQUEST    = 400,
  UNAUTHORIZED   = 401,
  NOT_FOUND      = 404,
  NOT_ACCEPTABLE = 406,
}

export enum APP_ERROR {
  NOT_ACCEPTABLE = 'NOT_ACCEPTABLE',
}



export interface IPublicError extends Error {
  status: number
  body  : any
}

export interface IPublicErrorConstructor extends ErrorConstructor {
  new (status: number, message: string, body?: any): IPublicError
  (status: number, message: string, body?: any): IPublicError
  readonly prototype: IPublicError
}


export interface IBadRequest extends IPublicError {}

export interface IBadRequestConstructor extends IPublicErrorConstructor {
  new (message: string, body?: any): IBadRequest
  (message: string, body?: any): IBadRequest
  readonly prototype: IBadRequest
}


export interface INotFound extends IPublicError {}

export interface INotFoundConstructor extends IPublicErrorConstructor {
  new (message: string): INotFound
  (message: string): INotFound
  readonly prototype: INotFound
}


export interface IUnauthorized extends IPublicError {}

export interface IUnauthorizedConstructor extends IPublicErrorConstructor {
  new (message: string): IUnauthorized
  (message: string): IUnauthorized
  readonly prototype: IUnauthorized
}


export interface NotAcceptable extends IPublicError {}

export interface NotAcceptableConstructor extends IPublicErrorConstructor {
  new (message: string): NotAcceptable
  (message: string): NotAcceptable
  readonly prototype: NotAcceptable
}


export interface IValidationError extends IPublicError {}

export interface IValidationErrorConstructor extends IPublicErrorConstructor {
  new (body?: ValidationErrorBody): IValidationError
  (body?: ValidationErrorBody): IValidationError
  readonly prototype: IValidationError
}


export type ValidationError = {
  text: string,
}

export type ValidationErrors = ValidationError[]

export type ValidationErrorBody = {errors: ValidationErrors}
