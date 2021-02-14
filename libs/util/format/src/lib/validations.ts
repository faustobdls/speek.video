export const notNull = (val: any) => val !== null
export const isDefined = (val: any) => val !== undefined
export const isValidUUID = (val: string) =>
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(
    val
  )
