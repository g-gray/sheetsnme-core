import * as t from './types'

import * as fpx from 'fpx'
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
 * Errors
 */

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



/**
 * Net
 */

export function fetch(params: t.XHttpParams): Promise<t.XHttpResponse> {
  return new Promise((resolve, reject) => {
    xhttp.jsonRequest(params, (err: any, response: t.XHttpResponse) => {
      if (response.ok) resolve(response)
      else reject(response)
    })
  })
}



/**
 * Crypto
 */

export function encrypt(
  algorythm: string,
  password : string,
  salt     : string,
  keyLength: number,
  text     : string,
): string {
  const key: Buffer = crypto.scryptSync(password, salt, keyLength) // Use the async `crypto.scrypt()` instead.
  const iv: Buffer = Buffer.alloc(16, 0) // Initialization vector. Use `crypto.randomBytes` to generate a random iv instead of the static iv shown here.
  const cipher = crypto.createCipheriv(algorythm, key, iv)
  let encrypted: string = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return encrypted
}

export function decrypt(
  algorythm: string,
  password : string,
  salt     : string,
  keyLength: number,
  cipher   : string
): string {
  const key: Buffer = crypto.scryptSync(password, salt, keyLength) // Use the async `crypto.scrypt()` instead.
  const iv: Buffer = Buffer.alloc(16, 0) // Initialization vector. Use `crypto.randomBytes` to generate a random iv instead of the static iv shown here.
  const decipher = crypto.createDecipheriv(algorythm, key, iv) // Encrypted using same algorithm, key and iv.
  let decrypted: string = decipher.update(cipher, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}



/**
 * i18n
 */

export const AVAILABLE_LANGS: t.Lang[] = ['en', 'ru']

export function xln(lang: t.Lang, translations: t.Translations, args: any[] = []): string {

  if (translations == null) return ''

  let translation: void | string | ((...args: any[]) => string)
  if (translations[lang]) {
    translation = translations[lang]
  }
  else {
    let _lang: t.Lang
    for (_lang in translations) {
      if (translations[_lang]) {
        translation = translations[_lang]
        break
      }
    }
  }

  if (typeof translation === 'function') {
    return translation(...args) || ''
  }

  return (translation || '')
}



/**
 * Misc
 */

export function wait(time: number): Promise<void> {
  return new Promise((resolve: () => void): void => {
    setTimeout(resolve, time)
  })
}
