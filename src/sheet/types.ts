import {drive_v3, sheets_v4} from 'googleapis'

export type Spreadsheet = {
  id        : string,
  userId    : string,
  externalId: string,
  createdAt : Date,
  updatedAt : Date,
}

export type Spreadsheets = Spreadsheet[]



export type GPermissionsCreateReq = drive_v3.Params$Resource$Permissions$Create
export type GPermissionsRes = drive_v3.Schema$Permission


export type GSheet = sheets_v4.Schema$Sheet

export type GSpreadsheetRes = sheets_v4.Schema$Spreadsheet

export type GSpreadsheetsGetReq = sheets_v4.Params$Resource$Spreadsheets$Get
export type GSpreadsheetsCreateReq = sheets_v4.Params$Resource$Spreadsheets$Create

export type GSpreadsheetsBatchUpdateReq = sheets_v4.Params$Resource$Spreadsheets$Batchupdate
export type GSpreadsheetsBatchUpdateRes = sheets_v4.Schema$BatchUpdateSpreadsheetResponse

export type GRowData = sheets_v4.Schema$RowData



export type GQueryCol = {
  id     : string,
  label  : string,
  type   : string,
  pattern: string,
}

export type GQueryCell = {
  v: string | number,
  f?: string,
}

export type GQueryRow = {
  c: (GQueryCell| null)[]
}

export type GQueryTable = {
  cols: GQueryCol[],
  rows: GQueryRow[],
  parsedNumHeaders: number,
}

export type GQueryRes = {
  table: GQueryTable,
}
