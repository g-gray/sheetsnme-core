export type * from '../flow-typed/npm/koa_v2.0.x'
export type * from '../flow-typed/npm/koa-router_v7.2.x'

export type Env = {
  SCHEMA: string,
  HOST: string,
  PORT: string,
  SPREADSHEET_ID: string,
}

export type AuthCredentials = {
  installed: {
    client_id: string,
    project_id: string,
    auth_uri: string,
    token_uri: string,
    auth_provider_x509_cert_url: string,
    client_secret: string,
    redirect_uris: Array<string>,
  }
}

export type AuthToken = {
  access_token: string,
  refresh_token: string,
  scope: string,
  token_type: string,
  expiry_date: number,
}

export type OAuth2Client = {
  _events: Array<any>,
  _eventsCount: number,
  _maxListeners: number,
  transporter: any,
  credentials: any,
  certificateCache: any,
  certificateExpiry: any,
  refreshTokenPromises: Map,
  _clientId: string,
  _clientSecret: string,
  redirectUri: string | void,
  authBaseUrl: string | void,
  tokenUrl: string | void,
  eagerRefreshThresholdMillis: number,
}
