// @flow
import uuid from 'uuid/v4'
import * as t from './types'
import * as u from './utils'

export const DEBT_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000'
const CARD_ACCOUNT_ID        = '00000000-0000-0000-0000-000000000001'

const SALARY_CATEGORY_ID     = '00000000-0000-0000-0001-000000000001'

const EMPLOYER_PAYEE_ID      = '00000000-0000-0000-0002-000000000001'

export function createTransactionsSheet(): t.GSheet {
  const date: Date = new Date()
  return {
    properties: {
      sheetId: 0,
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
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: u.formatDate(date)}},
              {userEnteredValue: {stringValue: SALARY_CATEGORY_ID}},
              {userEnteredValue: {stringValue: EMPLOYER_PAYEE_ID}},
              {userEnteredValue: {stringValue: 'It is an initial transaction. Feel free to edit or delete it.'}},
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

export function createAccountsSheet(): t.GSheet {
  const date: Date = new Date()
  return {
    properties: {
      sheetId: 1,
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
              {userEnteredValue: {formulaValue: '=ARRAYFORMULA(IF($A$1:$A <> "", ROW($A$1:$A) - 1, ""))'}},
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
              {userEnteredValue: {stringValue: 'Card'}},
              {userEnteredValue: {stringValue: 'RUB'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Cash'}},
              {userEnteredValue: {stringValue: 'RUB'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Deposit'}},
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

export function createCategoriesSheet(): t.GSheet {
  const date: Date = new Date()
  return {
    properties: {
      sheetId: 2,
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
              {userEnteredValue: {formulaValue: '=ARRAYFORMULA(IF($A$1:$A <> "", ROW($A$1:$A) - 1, ""))'}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: SALARY_CATEGORY_ID}},
              {userEnteredValue: {stringValue: 'Salary'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Household'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Healthcare'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Appearance'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Education'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Taxes & Charges'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Food'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Entertainment'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Transport'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
        ],
      },
    ],
  }
}

export function createPayeesSheet(): t.GSheet {
  const date: Date = new Date()
  return {
    properties: {
      sheetId: 3,
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
              {userEnteredValue: {formulaValue: '=ARRAYFORMULA(IF($A$1:$A <> "", ROW($A$1:$A) - 1, ""))'}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: EMPLOYER_PAYEE_ID}},
              {userEnteredValue: {stringValue: 'Employer'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Jack'}},
              {userEnteredValue: {stringValue: date.toJSON()}},
              {userEnteredValue: {stringValue: date.toJSON()}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Sarah'}},
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
      sheetId: 4,
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
