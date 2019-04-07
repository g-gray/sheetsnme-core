// @flow
import * as f from 'fpx'
import xhttp from 'xhttp/node'
import * as t from './types'

export const SECOND: number = 1000
export const MINUTE: number = SECOND * 60
export const HOUR  : number = MINUTE * 60
export const DAY   : number = HOUR * 24

export function wait(time: number): Promise<void> {
  return new Promise((resolve: () => void): void => {
    setTimeout(resolve, time)
  })
}

export function dateIsoString(value: any): string {
  const date = f.isDate(value) ? value : new Date(value)
  return f.isValidDate(date) ? date.toISOString() : ''
}

export function formatDate(value: any): string {
  const match = dateIsoString(value).match(/(\d\d\d\d-\d\d-\d\d)/)
  return match ? match[1] : ''
}

export function formatDateTime(value: any): string {
  const match = dateIsoString(value).match(/(\d\d\d\d-\d\d-\d\d)T(\d\d:\d\d:\d\d)/)
  return match ? `${match[1]} ${match[2]}` : ''
}

export class PublicError extends Error {
  body: any

  constructor(message: string, body?: any) {
    super(...arguments)
    Error.captureStackTrace(this, this.constructor)
    this.message = message
    this.body = body
    this.name = 'PublicError'
  }
}

export function fetch(params: t.XHttpParams): Promise<t.XHttpResponse> {
  return new Promise((resolve, reject) => {
    xhttp.jsonRequest(params, (err, response) => {
      if (response.ok) resolve(response)
      else reject(response)
    })
  })
}
