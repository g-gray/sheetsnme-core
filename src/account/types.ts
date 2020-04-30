export enum CURRENCY {
  RUB = 'RUB',
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

export type AccountWithBalanceRes = AccountRes & {
  balance: number,
}

export type AccountQuery = {
  id?         : string,
  title       : string,
  currencyCode: string,
  createdAt?  : string,
  updatedAt?  : string,
}

export type AccountResult = {
  id          : string,
  title       : string,
  currencyCode: string,
  createdAt   : string,
  updatedAt   : string,
  row         : number,
}

export type AccountWithBalanceResult = AccountResult & {
  balance: number,
}

export type Balance = {
  accountId: string,
  balance  : number,
}

export type BalancesById = {[key: string]: Balance}

export enum ACCOUNT_ERROR {
  ID_REQUIRED                = 'ACCOUNT_ID_REQUIRED',
  NOT_FOUND                  = 'ACCOUNT_NOT_FOUND',
  CAN_NOT_CHANGE             = 'CAN_NOT_CHANGE_THIS_ACCOUNT',
  CAN_NOT_DELETE             = 'CAN_NOT_DELETE_THIS_ACCOUNT',
  THERE_ARE_RELATED_ENTITIES = 'CAN_NOT_DELETE_THIS_ACCOUNT_THERE_ARE_RELATED_TRANSACTIONS',
}
