import { describe, expect, it } from 'vitest'

import {
  INITIAL_REFERENCE_LIBRARY_STATE,
  isReferenceLibraryCommand,
  reduceReferenceLibraryState,
  REFERENCE_BOOKS,
} from './referenceLibrary'

describe('reference library', () => {
  it('provides the approved four-book California-first collection', () => {
    expect(REFERENCE_BOOKS.map(({ id }) => id)).toEqual([
      'coagulation',
      'jar-testing',
      'reading-results',
      'enhanced-coagulation',
    ])
    expect(REFERENCE_BOOKS.every(({ pages }) => pages.length === 3)).toBe(true)
    expect(REFERENCE_BOOKS[1].source.label).toContain('California')
    expect(REFERENCE_BOOKS[2].source.label).toContain('California')
    expect(REFERENCE_BOOKS[3].source.label).toContain('EPA')
    expect(
      REFERENCE_BOOKS.every(
        ({ source }) => !new URL(source.url).pathname.endsWith('.pdf'),
      ),
    ).toBe(true)
  })

  it('opens, pages within bounds, and closes without continuous state', () => {
    let state = reduceReferenceLibraryState(INITIAL_REFERENCE_LIBRARY_STATE, {
      type: 'OPEN_REFERENCE',
      bookId: 'jar-testing',
    })
    expect(state).toEqual({ selectedBookId: 'jar-testing', pageIndex: 0 })

    for (let index = 0; index < 5; index += 1)
      state = reduceReferenceLibraryState(state, {
        type: 'NEXT_REFERENCE_PAGE',
      })
    expect(state.pageIndex).toBe(2)

    for (let index = 0; index < 5; index += 1)
      state = reduceReferenceLibraryState(state, {
        type: 'PREVIOUS_REFERENCE_PAGE',
      })
    expect(state.pageIndex).toBe(0)
    expect(
      reduceReferenceLibraryState(state, { type: 'CLOSE_REFERENCE' }),
    ).toBe(INITIAL_REFERENCE_LIBRARY_STATE)
  })

  it('rejects malformed external commands', () => {
    expect(
      isReferenceLibraryCommand({
        type: 'OPEN_REFERENCE',
        bookId: 'model-limitations',
      }),
    ).toBe(false)
    expect(isReferenceLibraryCommand({ type: 'NEXT_REFERENCE_PAGE' })).toBe(
      true,
    )
  })
})
