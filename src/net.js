// @flow
import {google} from 'googleapis'
import * as t from './types'

export function fetchValues(auth: t.OAuth2Client, options): Promise<any> {
  return new Promise(resolve => {
    google.sheets({version: 'v4', auth}).spreadsheets.values.get(options, (err, res) => {
      if (err) throw Error(err)
      resolve(res.data.values)
    })
  })
}

export function fetchGUserInfo(auth: t.OAuth2Client): Promise<t.GUser> {
  return new Promise(resolve => {
    google.oauth2({version: 'v2', auth}).userinfo.get((err, res) => {
      if (err) throw Error(err)
      resolve(res.data)
    })
  })
}
