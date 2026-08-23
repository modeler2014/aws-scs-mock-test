import { describe, it, expect } from 'vitest'
import { shuffle, pickRandom, filterByDomains } from './shuffle'

describe('shuffle', () => {
  it('returns an array with the same elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)
    expect(result).toHaveLength(5)
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('does not mutate the input array', () => {
    const input = [1, 2, 3]
    shuffle(input)
    expect(input).toEqual([1, 2, 3])
  })
})

describe('pickRandom', () => {
  it('returns the requested count when enough items exist', () => {
    const result = pickRandom([1, 2, 3, 4, 5], 3)
    expect(result).toHaveLength(3)
  })

  it('caps the result at the available item count', () => {
    const result = pickRandom([1, 2], 5)
    expect(result).toHaveLength(2)
  })
})

describe('filterByDomains', () => {
  const items = [
    { id: 'a', domain: 'X' },
    { id: 'b', domain: 'Y' },
    { id: 'c', domain: 'X' },
  ]

  it('returns all items when no domains are given', () => {
    expect(filterByDomains(items, [])).toEqual(items)
  })

  it('returns only items matching the given domains', () => {
    expect(filterByDomains(items, ['Y'])).toEqual([{ id: 'b', domain: 'Y' }])
  })
})
