export type TransactionListRes = {
  limit: number,
  offset: number,
  total: number,
  items: TransactionRes[],
  outcomeAmount: number,
  incomeAmount: number,
}

export type TransactionReq = {
  id?              : string,
  type             : TRANSACTION_TYPE,
  date             : string,
  categoryId?      : string,
  payeeId?         : string,
  comment?         : string,
  outcomeAccountId?: string,
  outcomeAmount?   : number,
  incomeAccountId? : string,
  incomeAmount?    : number,
  createdAt?       : string,
  updatedAt?       : string,
}

export type TransactionRes = {
  id              : string,
  type            : TRANSACTION_TYPE,
  date            : string,
  categoryId      : string,
  payeeId         : string,
  comment         : string,
  outcomeAccountId: string,
  outcomeAmount   : number,
  incomeAccountId : string,
  incomeAmount    : number,
  createdAt       : string,
  updatedAt       : string,
}

export type TransactionQuery = {
  id?             : string,
  date            : string,
  categoryId      : string,
  payeeId         : string,
  comment         : string,
  outcomeAccountId: string,
  outcomeAmount   : number,
  incomeAccountId : string,
  incomeAmount    : number,
  createdAt?      : string,
  updatedAt?      : string,
}

export type TransactionResult = TransactionRowDataResult

export type TransactionRowDataQuery = {
  id              : string,
  date            : string,
  categoryId      : string,
  payeeId         : string,
  comment         : string,
  outcomeAccountId: string,
  outcomeAmount   : number,
  incomeAccountId : string,
  incomeAmount    : number,
  createdAt       : string,
  updatedAt       : string,
}

export type TransactionRowDataResult = {
  id              : string,
  date            : string,
  categoryId      : string,
  payeeId         : string,
  comment         : string,
  outcomeAccountId: string,
  outcomeAmount   : number,
  incomeAccountId : string,
  incomeAmount    : number,
  createdAt       : string,
  updatedAt       : string,
  row             : number,
}


export type TransactionsAmounts = {
  outcomeAmount: number,
  incomeAmount: number,
}


export type TransactionsFilter = {
  id?        : string,
  dateFrom?  : string,
  dateTo?    : string,
  categoryId?: string,
  payeeId?   : string,
  comment?   : string,
  accountId? : string,
  amountFrom?: string,
  amountTo?  : string,
  limit?     : string,
  offset?    : string,
}



export enum TRANSACTION_TYPE {
  OUTCOME  = 'OUTCOME',
  INCOME   = 'INCOME',
  TRANSFER = 'TRANSFER',
  LOAN     = 'LOAN',
  BORROW   = 'BORROW',
}

export enum TRANSACTION_ERROR {
  ID_REQUIRED                       = 'TRANSACTION_ID_REQUIRED',
  NOT_FOUND                         = 'TRANSACTION_NOT_FOUND',
  LIMIT_MUST_BE_A_POSITIVE_INTEGER  = 'LIMIT_MUST_BE_A_POSITIVE_INTEGER',
  OFFSET_MUST_BE_A_POSITIVE_INTEGER = 'OFFSET_MUST_BE_A_POSITIVE_INTEGER',
}
