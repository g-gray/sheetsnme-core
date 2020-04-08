import * as t from '../types'

import {google} from 'googleapis'

export function fetchUserInfo(
  client: t.GOAuth2Client
): Promise<t.GUserRes> {
  return google
    .oauth2({version: 'v2', auth: client})
    .userinfo
    .get()
    .then(({data}) => data)
}
