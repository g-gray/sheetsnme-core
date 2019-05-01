// @flow
import {google} from 'googleapis'
import * as t from './types'
import * as e from './env'
import * as u from './utils'

const SCOPES: Array<string> = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/drive.file',
]

const {REDIRECT_URL, CLIENT_ID, CLIENT_SECRET} = e.properties

export function generateAuthUrl(state: string | void): string {
  const oAuth2Client: t.GOAuth2Client = createOAuth2Client()
  return oAuth2Client.generateAuthUrl({access_type: 'offline', prompt: 'consent', scope: SCOPES, state})
}

export async function exchangeCodeForToken(code: string): Promise<t.GAuthToken> {
  const oAuth2Client: t.GOAuth2Client = createOAuth2Client()
  const token: t.GAuthToken = await oAuth2Client.getToken(code).then(({tokens}) => tokens)
  return token
}

export async function refreshToken(token: t.GAuthToken): Promise<t.GAuthToken> {
  const oAuth2Client: t.GOAuth2Client = createOAuth2Client(token)
  const newToken: t.GAuthToken = await oAuth2Client.refreshAccessToken().then(({credentials}) => credentials)
  return newToken
}

export function createOAuth2Client(token: t.GAuthToken | void): t.GOAuth2Client {
  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
  if (token) {
    oAuth2Client.setCredentials(token)
  }
  return oAuth2Client
}

export function setCookie(ctx: t.Context, name: string, value: string) {
  ctx.cookies.set(name, value, {
    httpOnly: true,
    // sameSite: 'strict',
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
