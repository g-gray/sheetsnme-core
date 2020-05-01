export type PayeeWithDebtRes = PayeeRes & {
  debt: number,
}

export type PayeeReq = {
  id?       : string,
  title     : string,
  createdAt?: string,
  updatedAt?: string,
}

export type PayeeRes = {
  id       : string,
  title    : string,
  createdAt: string,
  updatedAt: string,
}

export type PayeeQuery = {
  id?       : string,
  title     : string,
  createdAt?: string,
  updatedAt?: string,
}

export type PayeeResult = PayeeRowDataResult

export type PayeeRowDataQuery = {
  id           : string,
  title        : string,
  createdAt    : string,
  updatedAt    : string,
}

export type PayeeRowDataResult = {
  id          : string,
  title       : string,
  createdAt   : string,
  updatedAt   : string,
  row         : number,
}


export type Debt = {
  payeeId: string,
  debt: number,
}

export type DebtsById = {[key: string]: Debt}



export enum PAYEE_ERROR {
  ID_REQUIRED                = 'PAYEE_ID_REQUIRED',
  NOT_FOUND                  = 'PAYEE_NOT_FOUND',
  THERE_ARE_RELATED_ENTITIES = 'CAN_NOT_DELETE_THIS_PAYEE_THERE_ARE_RELATED_TRANSACTIONS',
}
