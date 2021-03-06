import * as t from './types'
// @ts-ignore
import * as fpx from 'fpx'
// @ts-ignore
import xhttp from 'xhttp/node'
import crypto from 'crypto'

export const SECOND: number = 1000
export const MINUTE: number = SECOND * 60
export const HOUR  : number = MINUTE * 60
export const DAY   : number = HOUR * 24
export const WEEK  : number = DAY * 7

export const DEFAULT_LIMIT: number = 25

/**
 * Format
 */

export function dateIsoString(value: any): string {
  const date = fpx.isDate(value) ? value : new Date(value)
  return fpx.isValidDate(date) ? date.toISOString() : ''
}

export function formatDate(value: any): string {
  const match = dateIsoString(value).match(/(\d\d\d\d-\d\d-\d\d)/)
  return match ? match[1] : ''
}

export function formatDateTime(value: any): string {
  const match = dateIsoString(value).match(/(\d\d\d\d-\d\d-\d\d)T(\d\d:\d\d:\d\d)/)
  return match ? `${match[1]} ${match[2]}` : ''
}

/**
 * TODO Probably we have to use libs like Bignumber: https://github.com/MikeMcl/bignumber.js/
 * to solve problem related to floating numbers and precisions instead of
 * Math.round(value * 100) / 100,
 */
export function round(num: number, decimals: number = 0): number {
  return Math.round(num * (decimals * 10)) / (decimals * 10)
}



/**
 * Net
 */

export function fetch(params: t.XHttpParams): Promise<t.XHttpResponse> {
  return new Promise((
      resolve: (response: t.XHttpResponse) => void,
      reject: (reject: t.XHttpResponse) => void
    ) => {
      xhttp.jsonRequest(params, (err: any, response: t.XHttpResponse) => {
        if (response.ok) resolve(response)
        else reject(response)
    })
  })
}



/**
 * Crypto
 */

// TODO Fix types according to crypto library
export function encrypt(
  algorythm: string,
  password : string,
  salt     : string,
  keyLength: number,
  text     : string,
): string {
  // Use the async `crypto.scrypt()` instead.
  const key: Buffer = crypto.scryptSync(password, salt, keyLength)
  // Initialization vector. Use `crypto.randomBytes` to generate a random iv
  // instead of the static iv shown here.
  const iv: Buffer = Buffer.alloc(16, 0)
  const cipher = crypto.createCipheriv(algorythm, key, iv)
  let encrypted: string = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return encrypted
}

// TODO Fix types according to crypto library
export function decrypt(
  algorythm: string,
  password : string,
  salt     : string,
  keyLength: number,
  cipher   : string
): string {
  // Use the async `crypto.scrypt()` instead.
  const key: Buffer = crypto.scryptSync(password, salt, keyLength)
  // Initialization vector. Use `crypto.randomBytes` to generate a random iv
  // instead of the static iv shown here.
  const iv: Buffer = Buffer.alloc(16, 0)
  // Encrypted using same algorithm, key and iv.
  const decipher = crypto.createDecipheriv(algorythm, key, iv)
  let decrypted: string = decipher.update(cipher, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}



/**
 * Misc
 */

export function wait(time: number): Promise<void> {
  return new Promise((resolve: () => void): void => {
    setTimeout(resolve, time)
  })
}
