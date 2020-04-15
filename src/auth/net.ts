import * as t from '../types'

import {google} from 'googleapis'

import * as e from '../env'
import * as u from '../utils'

export const SCOPES: string[] = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/drive.file',
]

const {
  REDIRECT_URL,
  CLIENT_ID,
  CLIENT_SECRET,
} = e.properties

export function generateAuthUrl(state?: string): string {
  const oAuth2Client: t.GOAuth2Client = createOAuth2Client()
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    // prompt: 'consent',
    scope: SCOPES,
    state,
  })
}

export async function exchangeCodeForToken(code: string): Promise<t.IGAuthToken> {
  const oAuth2Client: t.GOAuth2Client = createOAuth2Client()
  return await oAuth2Client
    .getToken(code)
    .then(({tokens}) => tokens)
}

export async function refreshToken(token: t.IGAuthToken): Promise<t.IGAuthToken> {
  const oAuth2Client: t.GOAuth2Client = createOAuth2Client(token)
  return await oAuth2Client
    .refreshAccessToken()
    .then(({credentials}) => credentials)
}

export function createOAuth2Client(token?: t.IGAuthToken): t.GOAuth2Client {
  const oAuth2Client: t.GOAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  )

  if (token) {
    oAuth2Client.setCredentials(token)
  }

  return oAuth2Client
}

export function setCookie(ctx: t.KContext, name: string, value: string) {
  ctx.cookies.set(name, value, {
    httpOnly: true,
    // sameSite: 'strict',
    maxAge: u.WEEK, // Expires in a week
  })
}

export function setCookieExpired(ctx: t.KContext, name: string) {
  ctx.cookies.set(name, '', {
    httpOnly: true,
    maxAge: -1,
  })
}

export function getCookie(ctx: t.KContext, name: string): string | void {
  return ctx.cookies.get(name)
}
