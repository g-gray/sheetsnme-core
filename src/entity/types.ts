export type EntityQuery = {
  id?       : string,
  createdAt?: Date,
  updatedAt?: Date,
}

export type EntityResult = {
  id       : string,
  row      : number,
  createdAt: Date,
  updatedAt: Date,
}

export enum ENTITY_ERROR {
  ID_REQUIRED          = 'ENTITY_ID_REQUIRED',
  NOT_FOUND            = 'ENTITY_NOT_FOUND',
  WAS_NOT_CREATED      = 'ENTITY_WAS_NOT_CREATED',
  WAS_NOT_UPDATED      = 'ENTITY_WAS_NOT_UPDATED',
  ROW_NUMBER_NOT_FOUND = 'ROW_NUMBER_NOT_FOUND',
}
