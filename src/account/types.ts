export type Account = {
  id          : string,
  title       : string,
  currencyCode: string,
  createdAt?  : string,
  updatedAt?  : string,
  row?        : number,
}

export type Accounts = Account[]

export type AccountFields = {
  id?          : string,
  title        : string,
  currencyCode?: string,
  createdAt?   : string,
  updatedAt?   : string,
}


export type Balance = {
  accountId: string,
  balance  : number,
}

export type BalancesById = {[key: string]: Balance}

export enum ACCOUNT_ERROR {
  ID_REQUIRED                = 'ACCOUNT_ID_REQUIRED',
  CAN_NOT_CHANGE             = 'CAN_NOT_CHANGE_THIS_ACCOUNT',
  CAN_NOT_DELETE             = 'CAN_NOT_DELETE_THIS_ACCOUNT',
  THERE_ARE_RELATED_ENTITIES = 'CAN_NOT_DELETE_THIS_ACCOUNT_THERE_ARE_RELATED_TRANSACTIONS',
}
