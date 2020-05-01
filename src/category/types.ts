export type CategoryReq = {
  id?       : string,
  title     : string,
  createdAt?: string,
  updatedAt?: string,
}

export type CategoryRes = {
  id       : string,
  title    : string,
  createdAt: string,
  updatedAt: string,
}

export type CategoryQuery = {
  id?       : string,
  title     : string,
  createdAt?: string,
  updatedAt?: string,
}

export type CategoryResult = CategoryRowDataResult

export type CategoryRowDataQuery = {
  id           : string,
  title        : string,
  createdAt    : string,
  updatedAt    : string,
}

export type CategoryRowDataResult = {
  id          : string,
  title       : string,
  createdAt   : string,
  updatedAt   : string,
  row         : number,
}



export enum CATEGORY_ERROR {
  ID_REQUIRED                = 'CATEGORY_ID_REQUIRED',
  NOT_FOUND                  = 'CATEGORY_NOT_FOUND',
  THERE_ARE_RELATED_ENTITIES = 'CAN_NOT_DELETE_THIS_CATEGORY_THERE_ARE_RELATED_TRANSACTIONS',
}
