// @flow
import * as t from './types'

export const transactions: t.GSheet = {
  properties: {
    title: 'Transactions',
    gridProperties: {
      rowCount: 2,
      columnCount: 12,
      frozenRowCount: 1,
    },
  },
  data: [
    {
      startRow: 0,
      startColumn: 0,
      rowData: [
        {
          values: [
            {userEnteredValue: {stringValue: 'id'}},
            {userEnteredValue: {stringValue: 'date'}},
            {userEnteredValue: {stringValue: 'categoryId'}},
            {userEnteredValue: {stringValue: 'payeeId'}},
            {userEnteredValue: {stringValue: 'comment'}},
            {userEnteredValue: {stringValue: 'outcomeAccountId'}},
            {userEnteredValue: {stringValue: 'outcomeAmount'}},
            {userEnteredValue: {stringValue: 'incomeAccountId'}},
            {userEnteredValue: {stringValue: 'incomeAmount'}},
            {userEnteredValue: {stringValue: 'createdAt'}},
            {userEnteredValue: {stringValue: 'updatedAt'}},
            {userEnteredValue: {formulaValue: '=ARRAYFORMULA(IF($A$1:$A <> "", ROW($A$1:$A) - 1, ""))'}},
          ],
        },
      ],
    },
  ],
}

export const accounts: t.GSheet = {
  properties: {
    title: 'Accounts',
    gridProperties: {
      rowCount: 2,
      columnCount: 7,
      frozenRowCount: 1,
    },
  },
  data: [
    {
      startRow: 0,
      startColumn: 0,
      rowData: [
        {
          values: [
            {userEnteredValue: {stringValue: 'id'}},
            {userEnteredValue: {stringValue: 'title'}},
            {userEnteredValue: {stringValue: 'currencyCode'}},
            {userEnteredValue: {stringValue: 'initial'}},
            {userEnteredValue: {stringValue: 'createdAt'}},
            {userEnteredValue: {stringValue: 'updatedAt'}},
            {userEnteredValue: {formulaValue: '=ARRAYFORMULA(IF($A$1:$A <> "", ROW($A$1:$A) - 1, ""))'}},
          ],
        },
      ],
    },
  ],
}

export const categories: t.GSheet = {
  properties: {
    title: 'Categories',
    gridProperties: {
      rowCount: 2,
      columnCount: 5,
      frozenRowCount: 1,
    },
  },
  data: [
    {
      startRow: 0,
      startColumn: 0,
      rowData: [
        {
          values: [
            {userEnteredValue: {stringValue: 'id'}},
            {userEnteredValue: {stringValue: 'title'}},
            {userEnteredValue: {stringValue: 'createdAt'}},
            {userEnteredValue: {stringValue: 'updatedAt'}},
            {userEnteredValue: {formulaValue: '=ARRAYFORMULA(IF($A$1:$A <> "", ROW($A$1:$A) - 1, ""))'}},
          ],
        },
      ],
    },
  ],
}

export const payees: t.GSheet = {
  properties: {
    title: 'Payees',
    gridProperties: {
      rowCount: 2,
      columnCount: 5,
      frozenRowCount: 1,
    },
  },
  data: [
    {
      startRow: 0,
      startColumn: 0,
      rowData: [
        {
          values: [
            {userEnteredValue: {stringValue: 'id'}},
            {userEnteredValue: {stringValue: 'title'}},
            {userEnteredValue: {stringValue: 'createdAt'}},
            {userEnteredValue: {stringValue: 'updatedAt'}},
            {userEnteredValue: {formulaValue: '=ARRAYFORMULA(IF($A$1:$A <> "", ROW($A$1:$A) - 1, ""))'}},
          ],
        },
      ],
    },
  ],
}
