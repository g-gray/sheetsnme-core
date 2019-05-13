// @flow
import * as f from 'fpx'
import xhttp from 'xhttp/node'
import crypto from 'crypto'
import * as t from './types'

export const SECOND: number = 1000
export const MINUTE: number = SECOND * 60
export const HOUR  : number = MINUTE * 60
export const DAY   : number = HOUR * 24
export const WEEK  : number = DAY * 7

/**
 * Format
 */

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
    xhttp.jsonRequest(params, (err, response) => {
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
  // $FlowFixMe
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
  // $FlowFixMe
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

export const AVAILABLE_LANGS: Array<string> = ['en', 'ru']

export function xln(lang: string, translations: t.Translations, args?: Array<mixed>): string {

  if (translations == null) return ''

  let translation: void | string | (...Array<mixed>) => string
  if (translations[lang]) {
    translation = translations[lang]
  }
  else {
    for (const lang: string in translations) {
      if (translations[lang]) {
        translation = translations[lang]
        break
      }
    }
  }

  if (typeof translation === 'function') {
    return translation.apply(undefined, args)
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
