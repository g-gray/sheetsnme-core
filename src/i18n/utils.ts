import * as t from '../types'

export const AVAILABLE_LANGS: t.Lang[] = ['en', 'ru']

export function xln(
  lang: t.Lang,
  translations: t.Translations,
  args: any[] = []
): string {
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
