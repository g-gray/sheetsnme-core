import * as t from '../types'

import uuid from 'uuid/v4'

import * as u from '../utils'
import * as tr from '../translations'

export const TRANSACTIONS_SHEET_ID = 0
export const ACCOUNTS_SHEET_ID     = 1
export const CATEGORIES_SHEET_ID   = 2
export const PAYEES_SHEET_ID       = 3
export const VERSIONS_SHEET_ID     = 4

export const DEBT_ACCOUNT_ID    = '00000000-0000-0000-0001-000000000000'
export const CARD_ACCOUNT_ID    = '00000000-0000-0000-0001-000000000001'

export const SALARY_CATEGORY_ID = '00000000-0000-0000-0002-000000000001'

export const EMPLOYER_PAYEE_ID  = '00000000-0000-0000-0003-000000000001'

export function createTransactionsSheet(lang: t.Lang): t.GSheet {
  const date: Date = new Date()
  return {
    properties: {
      sheetId: TRANSACTIONS_SHEET_ID,
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
              {userEnteredValue: {formulaValue: '=ARRAYFORMULA(IF($A$1:$A <> "", ROW($A$1:$A), ""))'}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: u.formatDate(date)}},
              {userEnteredValue: {stringValue: SALARY_CATEGORY_ID}},
              {userEnteredValue: {stringValue: EMPLOYER_PAYEE_ID}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.THIS_IS_YOUR_INITIAL_TRANSACTION)}},
              {userEnteredValue: {stringValue: ''}},
              {userEnteredValue: {numberValue: 0}},
              {userEnteredValue: {stringValue: CARD_ACCOUNT_ID}},
              {userEnteredValue: {numberValue: 10000}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
        ],
      },
    ],
  }
}

export function createAccountsSheet(lang: t.Lang): t.GSheet {
  const date: Date = new Date()
  return {
    properties: {
      sheetId: ACCOUNTS_SHEET_ID,
      title: 'Accounts',
      gridProperties: {
        rowCount: 5,
        columnCount: 6,
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
              {userEnteredValue: {stringValue: 'createdAt'}},
              {userEnteredValue: {stringValue: 'updatedAt'}},
              {userEnteredValue: {formulaValue: '=ARRAYFORMULA(IF($A$1:$A <> "", ROW($A$1:$A), ""))'}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: DEBT_ACCOUNT_ID}},
              {userEnteredValue: {stringValue: 'Debt'}},
              {userEnteredValue: {stringValue: 'RUB'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: CARD_ACCOUNT_ID}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.CARD)}},
              {userEnteredValue: {stringValue: 'RUB'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.CASH)}},
              {userEnteredValue: {stringValue: 'RUB'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.DEPOSIT)}},
              {userEnteredValue: {stringValue: 'RUB'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
        ],
      },
    ],
  }
}

export function createCategoriesSheet(lang: t.Lang): t.GSheet {
  const date: Date = new Date()
  return {
    properties: {
      sheetId: CATEGORIES_SHEET_ID,
      title: 'Categories',
      gridProperties: {
        rowCount: 10,
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
              {userEnteredValue: {formulaValue: '=ARRAYFORMULA(IF($A$1:$A <> "", ROW($A$1:$A), ""))'}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: SALARY_CATEGORY_ID}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.SALARY)}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.HOUSEHOLD)}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.HEALTHCARE)}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.APPEARANCE)}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.EDUCATION)}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.TAXES_AND_CHARGES)}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.FOOD)}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.ENTERTAINMENT)}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.TRANSPORT)}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
        ],
      },
    ],
  }
}

export function createPayeesSheet(lang: t.Lang): t.GSheet {
  const date: Date = new Date()
  return {
    properties: {
      sheetId: PAYEES_SHEET_ID,
      title: 'Payees',
      gridProperties: {
        rowCount: 4,
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
              {userEnteredValue: {formulaValue: '=ARRAYFORMULA(IF($A$1:$A <> "", ROW($A$1:$A), ""))'}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: EMPLOYER_PAYEE_ID}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.EMPLOYER)}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.PETER)}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: u.xln(lang, tr.ALEXANDRA)}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
        ],
      },
    ],
  }
}

export function createVersionsSheet(): t.GSheet {
  const date: Date = new Date()
  return {
    properties: {
      sheetId: VERSIONS_SHEET_ID,
      title: 'Versions',
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
              {userEnteredValue: {stringValue: 'version'}},
              {userEnteredValue: {stringValue: 'comment'}},
              {userEnteredValue: {stringValue: 'createdAt'}},
              {userEnteredValue: {stringValue: 'updatedAt'}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {numberValue: 0}},
              {userEnteredValue: {stringValue: 'Initial version'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
        ],
      },
    ],
  }
}
