import * as t from '../types'

import {google} from 'googleapis'
import qs from 'query-string'

import * as e from '../env'
import * as u from '../utils'

import * as s from './sheets'

const {SPREADSHEET_NAME} = e.properties

export async function createAppSpreadsheet(
  client: t.GOAuth2Client,
  lang: t.Lang
): Promise<t.GSpreadsheetRes> {
  const spreadsheet: t.GSpreadsheetRes = await createSpreadsheet(client, {
    requestBody: {
      properties: {
        title: SPREADSHEET_NAME,
      },
      sheets: [
        s.createTransactionsSheet(lang),
        s.createAccountsSheet(lang),
        s.createCategoriesSheet(lang),
        s.createPayeesSheet(lang),
        s.createVersionsSheet(),
      ],
    },
  })

  // TODO Check return value
  await addPermissions(client, {
    fileId: spreadsheet.spreadsheetId || undefined,
    requestBody: {
      type: 'anyone',
      role: 'reader',
    },
  })

  return spreadsheet
}

function addPermissions(
  client: t.GOAuth2Client,
  options: t.GPermissionsCreateReq
): Promise<t.GPermissionsRes> {
  return google
    .drive({version: 'v3', auth: client})
    .permissions
    .create(options)
    .then(({data}) => data)
}

export async function appendRow(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  row          : t.GRowData,
): Promise<void> {
  await batchUpdateSpreadsheet(client, {
    spreadsheetId,
    requestBody: {
      requests: [{
        appendCells: {
          sheetId,
          rows: [row],
          fields: '*',
        },
      }],
    },
  })
}

export async function updateRow(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  rowNumber    : number,
  row          : t.GRowData,
): Promise<t.GRowData> {
  const result: t.GSpreadsheetsBatchUpdateRes = await batchUpdateSpreadsheet(
    client,
    {
      spreadsheetId,
      requestBody: {
        includeSpreadsheetInResponse: true,
        responseIncludeGridData: true,
        responseRanges: [`${rowNumber}:${rowNumber}`],
        requests: [{
          updateCells: {
            rows: [row],
            start: {
              sheetId,
              rowIndex: rowNumber - 1,
              columnIndex: 0,
            },
            fields: '*',
          },
        }],
      },
    }
  )

  // @ts-ignore
  const updatedRow: t.GRowData = result
    .updatedSpreadsheet
    .sheets[0]
    .data[0]
    .rowData[0]
    .values

  return updatedRow
}

export async function deleteRow(
  client       : t.GOAuth2Client,
  spreadsheetId: string,
  sheetId      : number,
  rowNumber    : number,
): Promise<void> {
  await batchUpdateSpreadsheet(client, {
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowNumber - 1,
            endIndex: rowNumber,
          },
        },
      }],
    },
  })
}

export function fetchSpreadsheet(
  client: t.GOAuth2Client,
  options: t.GSpreadsheetsGetReq
): Promise<void | t.GSpreadsheetRes> {
  return google
    .sheets({version: 'v4', auth: client})
    .spreadsheets
    .get(options)
    .then(({data}) => data)
    .catch(error => {
      if (error.code === 404) {
        return undefined
      }
      throw error
    })
}

export function createSpreadsheet(
  client: t.GOAuth2Client,
  options: t.GSpreadsheetsCreateReq
): Promise<t.GSpreadsheetRes> {
  return google
    .sheets({version: 'v4', auth: client})
    .spreadsheets
    .create(options)
    .then(({data}) => data)
}

export function batchUpdateSpreadsheet(
  client: t.GOAuth2Client,
  options: t.GSpreadsheetsBatchUpdateReq
): Promise<t.GSpreadsheetsBatchUpdateRes> {
  return google
    .sheets({version: 'v4', auth: client})
    .spreadsheets
    .batchUpdate(options)
    .then(({data}) => data)
}

export async function querySheet(
  spreadsheetId: string,
  sheetId: number,
  query?: string
): Promise<void | t.GQueryTable> {
  const queryString: string = qs.stringify({tq: query, gid: sheetId})
  const url: string = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?${queryString}`

  // TODO Find a better solution to query sheets
  return await u.fetch({url}).then(({body}) => {
    const stringified = body && String(body)
    const matches = stringified.match(/google\.visualization\.Query\.setResponse\((.*)\);$/)
    const match: string | null = matches && matches[1]
    if (!match) {
      return undefined
    }

    const data: t.GQueryRes = JSON.parse(match)
    if (!data) {
      return undefined
    }

    return data.table
  })
}
