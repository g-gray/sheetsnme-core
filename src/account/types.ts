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
