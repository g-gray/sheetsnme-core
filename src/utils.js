// @flow

export const SECOND: number = 1000
export const MINUTE: number = SECOND * 60
export const HOUR  : number = MINUTE * 60
export const DAY   : number = HOUR * 24

export function wait(time: number): Promise<void> {
  return new Promise((resolve: () => void): void => {
    setTimeout(resolve, time)
  })
}
