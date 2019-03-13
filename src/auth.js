// @flow
import fs from 'fs'
import pt from 'path'
import {google} from 'googleapis'
import * as t from './types'

// If modifying these scopes, delete token.json.
const SCOPES: Array<string> = ['https://www.googleapis.com/auth/spreadsheets.readonly']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH      : string = pt.resolve('token.json')
const CREDENTIALS_PATH: string = pt.resolve('credentials.json')

export function isAuthorized(): boolean {
  return Boolean(readToken())
}

export function authWithToken(): t.OAuth2Client {
  const oAuth2Client = createOAuth2Client()
  const token: t.AuthToken = readToken()
  oAuth2Client.setCredentials(token)
  return oAuth2Client
}

export function login(ctx: t.Context): void {
  const {redirectTo} = ctx.query
  const oAuth2Client: t.OAuth2Client = createOAuth2Client(redirectUri(redirectTo))
  const authUrl: string = oAuth2Client.generateAuthUrl({access_type: 'offline', scope: SCOPES})
  ctx.redirect(authUrl)
}

export async function exchangeCodeForToken(ctx: t.Context): Promise<void> {
  const {code, redirectTo} = ctx.query
  const oAuth2Client: t.OAuth2Client = createOAuth2Client(redirectUri(redirectTo))
  const token: t.AuthToken = await getToken(oAuth2Client, code)
  writeToken(token)
}

function createOAuth2Client(redirectUri: string | void): t.OAuth2Client {
  const credentials: t.AuthCredentials = readCredentilas()
  const {client_id, client_secret, redirect_uris} = credentials.installed
  return new google.auth.OAuth2(
    client_id,
    client_secret,
    redirectUri ? redirectUri : redirect_uris[0]
  )
}

function readCredentilas(): t.AuthCredentials | void {
  try {
    const data: Buffer = fs.readFileSync(CREDENTIALS_PATH)
    return JSON.parse(data.toString())
  }
  catch (err) {
    if (err.code === 'ENOENT') return undefined
    return undefined
  }
}

function readToken(): t.AuthToken | void {
  try {
    const data: Buffer = fs.readFileSync(TOKEN_PATH)
    return JSON.parse(data.toString())
  }
  catch (err) {
    if (err.code === 'ENOENT') return undefined
    return undefined
  }
}

function writeToken(token: t.AuthToken): void {
  return fs.writeFileSync(TOKEN_PATH, JSON.stringify(token))
}

function getToken(oAuth2Client: t.OAuth2Client, code: string): Promise<t.AuthToken> {
  return new Promise(resolve => {
    oAuth2Client.getToken(code, (err, token) => {
      if (err) throw Error(err.toString())
      resolve(token)
    })
  })
}

function redirectUri(redirectTo: string | void): string {
  const {SCHEMA, HOST, PORT} = global.env
  return redirectTo
    ? `${SCHEMA}://${HOST}:${PORT}/auth/code/?redirectTo=${encodeURIComponent(redirectTo)}`
    : `${SCHEMA}://${HOST}:${PORT}/auth/code/`
}
