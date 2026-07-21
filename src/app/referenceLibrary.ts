export const REFERENCE_BOOK_IDS = [
  'coagulation',
  'jar-testing',
  'reading-results',
  'enhanced-coagulation',
] as const

export type ReferenceBookId = (typeof REFERENCE_BOOK_IDS)[number]

export interface ReferencePage {
  readonly heading: string
  readonly body: string
}

export interface ReferenceBook {
  readonly id: ReferenceBookId
  readonly shortTitle: string
  readonly title: string
  readonly color: string
  readonly source: {
    readonly label: string
    readonly url: string
  }
  readonly pages: readonly ReferencePage[]
}

export const REFERENCE_BOOKS: readonly ReferenceBook[] = Object.freeze([
  {
    id: 'coagulation',
    shortTitle: 'COAGULATION',
    title: 'Coagulation & Flocculation',
    color: '#2f6f73',
    source: {
      label: 'California Water Boards — Safe Drinking Water Plan',
      url: 'https://www.waterboards.ca.gov/drinking_water/safedrinkingwaterplan/',
    },
    pages: [
      {
        heading: 'Why coagulate?',
        body: 'Very small suspended and colloidal particles can remain in water instead of settling. Coagulant chemistry destabilizes those particles so they can begin joining together. This prepares the water for later physical removal; it is one part of a multi-barrier treatment process.',
      },
      {
        heading: 'Coagulation and flocculation',
        body: 'Coagulation begins with chemical addition and rapid mixing. Flocculation follows with gentler mixing that encourages destabilized particles to collide and form larger, visible floc. Sedimentation and filtration can then remove material that would otherwise stay suspended.',
      },
      {
        heading: 'Conditions matter',
        body: 'Performance depends on the source water, coagulant, dose, pH, alkalinity, temperature, mixing energy, and contact time. A useful dose for one water or season may not transfer unchanged to another. Plant decisions require representative testing and qualified operational judgment.',
      },
    ],
  },
  {
    id: 'jar-testing',
    shortTitle: 'JAR\nTESTING',
    title: 'How Jar Testing Works',
    color: '#8c6636',
    source: {
      label: 'California Water Boards — Jar Testing Resources',
      url: 'https://www.waterboards.ca.gov/drinking_water/programs/districts/mendocino_district.html',
    },
    pages: [
      {
        heading: 'A controlled comparison',
        body: 'A jar test places representative raw water into several jars. Each jar receives a different treatment condition while the test keeps other conditions as consistent as practical. Running the jars together makes the treatment response easier to compare.',
      },
      {
        heading: 'Reproduce the process',
        body: 'The sequence commonly represents rapid mix, flocculation, settling, and sample collection. Mixing energy and duration should reflect the process being studied. Doses are prepared carefully and added consistently so differences between jars have a meaningful cause.',
      },
      {
        heading: 'Measure, do not only look',
        body: 'Visible floc and settled-water clarity are useful observations, but a strong test also records relevant measurements. California guidance emphasizes procedures that produce meaningful and transferable evidence, including filterability when predicting full-scale filtration performance.',
      },
    ],
  },
  {
    id: 'reading-results',
    shortTitle: 'READING\nRESULTS',
    title: 'Interpreting Jar-Test Results',
    color: '#546d3a',
    source: {
      label: 'California Water Boards — Jar Testing Resources',
      url: 'https://www.waterboards.ca.gov/drinking_water/programs/districts/mendocino_district.html',
    },
    pages: [
      {
        heading: 'Look for a useful range',
        body: 'Compare floc formation, settling behavior, supernatant clarity, and measured results across the jars. The goal is not automatically the largest dose. A useful treatment range balances the selected water-quality objectives with stable downstream performance.',
      },
      {
        heading: 'Underdose and overdose',
        body: 'Too little coagulant may leave many particles insufficiently destabilized. Excess dose can also produce poorer results under some conditions. A dose-response series helps reveal the region between these outcomes instead of assuming that more chemical always gives clearer water.',
      },
      {
        heading: 'Transfer cautiously',
        body: 'Jar-test conditions must represent the plant closely enough for the comparison to be useful. Source-water changes, chemical preparation, pH, mixing, settling, sampling, and filtration behavior can all affect interpretation. This simulation demonstrates the comparison concept; it does not prescribe a plant dose.',
      },
    ],
  },
  {
    id: 'enhanced-coagulation',
    shortTitle: 'ENHANCED\nCOAGULATION',
    title: 'Enhanced Coagulation',
    color: '#65518c',
    source: {
      label: 'U.S. EPA — Surface Water Guidance Manuals',
      url: 'https://www.epa.gov/dwreginfo/guidance-manuals-surface-water-treatment-rules',
    },
    pages: [
      {
        heading: 'A different objective',
        body: 'Conventional coagulation often emphasizes particle and turbidity removal. Enhanced coagulation increases removal of natural organic matter, commonly tracked through total organic carbon, to reduce material that can contribute to disinfection byproduct formation.',
      },
      {
        heading: 'Water chemistry controls response',
        body: 'EPA guidance relates required organic-carbon removal to source-water TOC and alkalinity. Coagulant dose and pH strongly influence removal, while higher alkalinity can make pH depression more difficult. Enhanced coagulation is therefore not simply “add more coagulant.”',
      },
      {
        heading: 'Jar testing and diminishing returns',
        body: 'EPA’s Step 2 procedure uses controlled testing to establish an alternative TOC removal requirement for qualifying systems. It evaluates incremental removal and a point of diminishing return. This reference is educational; current rules, state approval, and site-specific professional evaluation govern real compliance decisions.',
      },
    ],
  },
])

export interface ReferenceLibraryState {
  readonly selectedBookId: ReferenceBookId | null
  readonly pageIndex: number
}

export type ReferenceLibraryCommand =
  | { readonly type: 'OPEN_REFERENCE'; readonly bookId: ReferenceBookId }
  | { readonly type: 'NEXT_REFERENCE_PAGE' }
  | { readonly type: 'PREVIOUS_REFERENCE_PAGE' }
  | { readonly type: 'CLOSE_REFERENCE' }

export const INITIAL_REFERENCE_LIBRARY_STATE: ReferenceLibraryState =
  Object.freeze({ selectedBookId: null, pageIndex: 0 })

export function isReferenceBookId(value: unknown): value is ReferenceBookId {
  return REFERENCE_BOOK_IDS.some((id) => id === value)
}

export function isReferenceLibraryCommand(
  value: unknown,
): value is ReferenceLibraryCommand {
  if (typeof value !== 'object' || value === null || !('type' in value))
    return false
  const command = value as {
    readonly type?: unknown
    readonly bookId?: unknown
  }
  if (command.type === 'OPEN_REFERENCE')
    return isReferenceBookId(command.bookId)
  return (
    command.type === 'NEXT_REFERENCE_PAGE' ||
    command.type === 'PREVIOUS_REFERENCE_PAGE' ||
    command.type === 'CLOSE_REFERENCE'
  )
}

export function referenceBookById(id: ReferenceBookId): ReferenceBook {
  const book = REFERENCE_BOOKS.find((candidate) => candidate.id === id)
  if (book === undefined) throw new Error(`Unknown reference book: ${id}`)
  return book
}

export function reduceReferenceLibraryState(
  state: ReferenceLibraryState,
  command: ReferenceLibraryCommand,
): ReferenceLibraryState {
  if (command.type === 'OPEN_REFERENCE')
    return { selectedBookId: command.bookId, pageIndex: 0 }
  if (command.type === 'CLOSE_REFERENCE') return INITIAL_REFERENCE_LIBRARY_STATE
  if (state.selectedBookId === null) return state

  const pageCount = referenceBookById(state.selectedBookId).pages.length
  const pageIndex =
    command.type === 'NEXT_REFERENCE_PAGE'
      ? Math.min(pageCount - 1, state.pageIndex + 1)
      : Math.max(0, state.pageIndex - 1)
  return pageIndex === state.pageIndex ? state : { ...state, pageIndex }
}
