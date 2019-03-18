// @flow
import {google} from 'googleapis'
import * as t from './types'
import * as e from './env'
import * as u from './utils'

const SCOPES: Array<string> = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
]

const {SCHEMA, HOST, PORT, CLIENT_ID, CLIENT_SECRET} = e.properties
const REDIRECT_URL: string = `${SCHEMA}://${HOST}:${PORT}/auth/code/`

export function generateAuthUrl(state: string | void): string {
  const oAuth2Client: t.OAuth2Client = createOAuth2Client()
  return oAuth2Client.generateAuthUrl({access_type: 'offline', scope: SCOPES, state})
}

export async function exchangeCodeForToken(code: string): Promise<t.AuthToken> {
  const oAuth2Client: t.OAuth2Client = createOAuth2Client()
  return await oAuth2Client.getToken(code).then(({tokens}) => tokens)
}

export function createOAuth2Client(token: t.AuthToken | void): t.OAuth2Client {
  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
  if (token) {
    oAuth2Client.setCredentials(token)
  }
  return oAuth2Client
}

export function setCookie(ctx: t.Context, name: string, value: string) {
  ctx.cookies.set(name, value, {
    httpOnly: true,
    maxAge: u.DAY, // Expires in a day
  })
}

export function setCookieExpired(ctx: t.Context, name: string) {
  ctx.cookies.set(name, '', {
    httpOnly: true,
    maxAge: -1,
  })
}

export function getCookie(ctx: t.Context, name: string): string | void {
  return ctx.cookies.get(name)
}
