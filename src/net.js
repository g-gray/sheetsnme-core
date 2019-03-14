// @flow
import {google} from 'googleapis'
import * as t from './types'

export function fetchGUserInfo(auth: t.OAuth2Client): Promise<t.GUser> {
  return new Promise(resolve => {
    google.oauth2({version: 'v2', auth}).userinfo.get((err, res) => {
      if (err) throw Error(err)
      resolve(res.data)
    })
  })
}

export function fetchValues(auth: t.OAuth2Client, options: Object): Promise<any> {
  return new Promise(resolve => {
    google.sheets({version: 'v4', auth}).spreadsheets.values.get(options, (err, res) => {
      if (err) throw Error(err)
      resolve(res.data.values)
    })
  })
}

export function clearValues(auth: t.OAuth2Client, options: Object): Promise<any> {
  return new Promise(resolve => {
    google.sheets({version: 'v4', auth}).spreadsheets.values.clear(options, (err, res) => {
      if (err) if (err) throw Error(err)
      resolve(res.data.clearedRange)
    })
  })
}

export function appendValues(auth: t.OAuth2Client, options: Object): Promise<any> {
  return new Promise(resolve => {
    google.sheets({version: 'v4', auth}).spreadsheets.values.append(options, (err, res) => {
      if (err) if (err) throw Error(err)
      resolve(res.data.updates.updatedData)
    })
  })
}

export function updateValues(auth: t.OAuth2Client, options: Object): Promise<any> {
  return new Promise(resolve => {
    google.sheets({version: 'v4', auth}).spreadsheets.values.update(options, (err, res) => {
      if (err) if (err) throw Error(err)
      resolve(res.data.updatedData)
    })
  })
}
