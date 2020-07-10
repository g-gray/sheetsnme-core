export enum CURRENCY {
  RUB = 'RUB',
}

export type AccountWithBalanceRes = AccountRes & {
  balance: number,
}

export type AccountReq = {
  id?          : string,
  title        : string,
  currencyCode?: string,
  createdAt?   : string,
  updatedAt?   : string,
}

export type AccountRes = {
  id          : string,
  title       : string,
  currencyCode: string,
  createdAt   : string,
  updatedAt   : string,
}

export type AccountQuery = {
  id?          : string,
  title        : string,
  currencyCode?: string,
  createdAt?   : string,
  updatedAt?   : string,
}

export type AccountResult = AccountRowDataResult

export type AccountRowDataQuery = {
  id           : string,
  title        : string,
  currencyCode?: string,
  createdAt    : string,
  updatedAt    : string,
}

export type AccountRowDataResult = {
  id          : string,
  title       : string,
  currencyCode: string,
  createdAt   : string,
  updatedAt   : string,
  row         : number,
}



export type Balance = {
  accountId: string,
  balance  : number,
}

export type BalancesByCategoryId = {[key: string]: Balance}



export enum ACCOUNT_ERROR {
  ID_REQUIRED                = 'ACCOUNT_ID_REQUIRED',
  NOT_FOUND                  = 'ACCOUNT_NOT_FOUND',
  CAN_NOT_CHANGE             = 'CAN_NOT_CHANGE_THIS_ACCOUNT',
  CAN_NOT_DELETE             = 'CAN_NOT_DELETE_THIS_ACCOUNT',
  THERE_ARE_RELATED_ENTITIES = 'CAN_NOT_DELETE_THIS_ACCOUNT_THERE_ARE_RELATED_TRANSACTIONS',
}
