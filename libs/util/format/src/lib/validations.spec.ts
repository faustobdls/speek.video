import { utilFormat } from './util-format'
import { isDefined, notNull, isValidUUID } from './validations'

describe('utilFormat', () => {
  it('should work', () => {
    expect(utilFormat()).toEqual('util-format')
  })

  it('undefined should be falsy', () => {
    expect(isDefined(undefined)).toBeFalsy()
  })

  it('null should be true', () => {
    expect(isDefined(null)).toBeTruthy()
  })

  it('empty should be true', () => {
    expect(isDefined('')).toBeTruthy()
  })

  it('object should be true', () => {
    expect(isDefined({})).toBeTruthy()
  })

  it('undefined should be truthy', () => {
    expect(notNull(undefined)).toBeTruthy()
  })

  it('null should be falsy', () => {
    expect(notNull(null)).toBeFalsy()
  })

  it('empty should be true', () => {
    expect(notNull('')).toBeTruthy()
  })

  it('object should be true', () => {
    expect(notNull({})).toBeTruthy()
  })

  it('should work', () => {
    expect(utilFormat()).toEqual('util-format')
  })
})
