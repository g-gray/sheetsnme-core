export type Category = {
  id        : string,
  title     : string,
  createdAt?: string,
  updatedAt?: string,
  row?      : number,
}

export type Categories = Category[]

export type CategoryFields = {
  id        : string,
  title     : string,
  createdAt?: string,
  updatedAt?: string,
}



export enum CATEGORY_ERROR {
  ID_REQUIRED                = 'CATEGORY_ID_REQUIRED',
  NOT_FOUND                  = 'CATEGORY_NOT_FOUND',
  THERE_ARE_RELATED_ENTITIES = 'CAN_NOT_DELETE_THIS_CATEGORY_THERE_ARE_RELATED_TRANSACTIONS',
}
