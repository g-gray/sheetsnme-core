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



export enum PAYEE_ERROR {
  ID_REQUIRED                = 'PAYEE_ID_REQUIRED',
  NOT_FOUND                  = 'PAYEE_NOT_FOUND',
  THERE_ARE_RELATED_ENTITIES = 'CAN_NOT_DELETE_THIS_PAYEE_THERE_ARE_RELATED_TRANSACTIONS',
}
