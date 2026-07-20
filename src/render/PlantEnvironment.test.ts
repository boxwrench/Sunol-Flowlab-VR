import { describe, expect, it } from 'vitest'

import { PLANT_ENVIRONMENT_RENDER_BUDGET } from './PlantEnvironment'

describe('plant environment render budget', () => {
  it('stays within the approved sparse foreground budget', () => {
    expect(PLANT_ENVIRONMENT_RENDER_BUDGET).toEqual({
      sourceDrawCalls: 5,
      materialCount: 5,
      triangles: 1114,
      externalTextureBytes: 3_947_484,
      decodedPanoramaBytes: 55_332_856,
      generatedLabelTextureBytes: 1_638_400,
    })
  })
})
