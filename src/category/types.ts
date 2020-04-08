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
