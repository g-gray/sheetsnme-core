// @flow
import {google} from 'googleapis'
import * as t from './types'

export function fetchSheets(auth: t.OAuth2Client) {
  return google.sheets({version: 'v4', auth})
}

export function fetchValues(sh, options): Promise<any> {
  return new Promise(resolve => {
    sh.spreadsheets.values.get(options, (err, res) => {
      if (err) throw Error(err)
      resolve(res.data.values)
    })
  })
}
