// @flow
import uuid from 'uuid/v4'
import * as t from './types'

export function createTransactionsSheet(): t.GSheet {
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
        ],
      },
    ],
  }
}

export const DEBT_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000'

export function createAccountsSheet(): t.GSheet {
  const date: string = new Date().toJSON()
  return {
    properties: {
      sheetId: 1,
      title: 'Accounts',
      gridProperties: {
        rowCount: 5,
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
          {
            values: [
              {userEnteredValue: {stringValue: DEBT_ACCOUNT_ID}},
              {userEnteredValue: {stringValue: 'Debt'}},
              {userEnteredValue: {stringValue: 'RUB'}},
              {userEnteredValue: {numberValue: 0}},
              {userEnteredValue: {stringValue: date}},
              {userEnteredValue: {stringValue: date}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Карта'}},
              {userEnteredValue: {stringValue: 'RUB'}},
              {userEnteredValue: {numberValue: 0}},
              {userEnteredValue: {stringValue: date}},
              {userEnteredValue: {stringValue: date}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Наличные'}},
              {userEnteredValue: {stringValue: 'RUB'}},
              {userEnteredValue: {numberValue: 0}},
              {userEnteredValue: {stringValue: date}},
              {userEnteredValue: {stringValue: date}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Вклад'}},
              {userEnteredValue: {stringValue: 'RUB'}},
              {userEnteredValue: {numberValue: 0}},
              {userEnteredValue: {stringValue: date}},
              {userEnteredValue: {stringValue: date}},
            ],
          },
        ],
      },
    ],
  }
}

export function createCategoriesSheet(): t.GSheet {
  const date: string = new Date().toJSON()
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
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Жилье'}},
              {userEnteredValue: {stringValue: date}},
              {userEnteredValue: {stringValue: date}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Здоровье'}},
              {userEnteredValue: {stringValue: date}},
              {userEnteredValue: {stringValue: date}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Внешний вид'}},
              {userEnteredValue: {stringValue: date}},
              {userEnteredValue: {stringValue: date}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Образование'}},
              {userEnteredValue: {stringValue: date}},
              {userEnteredValue: {stringValue: date}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Комиссии, налоги, пошлины'}},
              {userEnteredValue: {stringValue: date}},
              {userEnteredValue: {stringValue: date}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Продукты и питание'}},
              {userEnteredValue: {stringValue: date}},
              {userEnteredValue: {stringValue: date}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Отдых и развлечения'}},
              {userEnteredValue: {stringValue: date}},
              {userEnteredValue: {stringValue: date}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Транспорт'}},
              {userEnteredValue: {stringValue: date}},
              {userEnteredValue: {stringValue: date}},
            ],
          },
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Зарплата'}},
              {userEnteredValue: {stringValue: date}},
              {userEnteredValue: {stringValue: date}},
            ],
          },
        ],
      },
    ],
  }
}

export function createPayeesSheet(): t.GSheet {
  const date: string = new Date().toJSON()
  return {
    properties: {
      sheetId: 3,
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
          {
            values: [
              {userEnteredValue: {stringValue: uuid()}},
              {userEnteredValue: {stringValue: 'Государство'}},
              {userEnteredValue: {stringValue: date}},
              {userEnteredValue: {stringValue: date}},
            ],
          },
        ],
      },
    ],
  }
}
