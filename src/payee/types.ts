export type Payee = {
  id        : string,
  title     : string,
  createdAt?: string,
  updatedAt?: string,
  row?      : number,
}

export type Payees = Payee[]

export type PayeeFields = {
  id?       : string,
  title     : string,
  createdAt?: string,
  updatedAt?: string,
}


export type Debt = {
  payeeId: string,
  debt: number,
}

export type DebtsById = {[key: string]: Debt}
