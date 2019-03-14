// @flow

import fs from 'fs'
import pt from 'path'
import {google} from 'googleapis'
import * as t from './types'
import * as e from './env'
import * as u from './utils'

const SCOPES: Array<string> = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
]
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const CREDENTIALS_PATH: string = pt.resolve('credentials.json')
const {SCHEMA, HOST, PORT} = e.properties
const REDIRECT_URL    : string = `${SCHEMA}://${HOST}:${PORT}/auth/code/`

export function generateAuthUrl(redirectTo: string): string {
  const oAuth2Client: t.OAuth2Client = createOAuth2Client()
  return oAuth2Client.generateAuthUrl({access_type: 'offline', scope: SCOPES, state: redirectTo})
}

export async function exchangeCodeForToken(code: string): Promise<t.AuthToken> {
  const oAuth2Client: t.OAuth2Client = createOAuth2Client()
  return await oAuth2Client.getToken(code).then(({tokens}) => tokens)
}

export function createOAuth2Client(token: t.AuthToken | void): t.OAuth2Client {
  const credentials: t.AuthCredentials = readCredentilas()
  const {client_id, client_secret} = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, REDIRECT_URL)
  if (token) {
    oAuth2Client.setCredentials(token)
  }
  return oAuth2Client
}

function readCredentilas(): t.AuthCredentials {
  const data: Buffer = fs.readFileSync(CREDENTIALS_PATH)
  return JSON.parse(data.toString())
}

export function setCookie(ctx: t.Context, name: string, value: string) {
  ctx.cookies.set(name, value, {
    httpOnly: true,
    maxAge: u.DAY, // Expires in a day
  })
}

export function getCookie(ctx: t.Context, name: string): string {
  return String(ctx.cookies.get(name))
}
