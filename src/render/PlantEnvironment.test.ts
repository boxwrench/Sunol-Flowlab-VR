import { describe, expect, it } from 'vitest'

import {
  PLANT_ENVIRONMENT_RENDER_BUDGET,
  PLANT_ENVIRONMENT_SURFACE_TEXTURE,
  PLANT_ENVIRONMENT_SURFACE_JOINS,
  PLANT_ENVIRONMENT_VERTICAL_SEAMS,
} from './PlantEnvironment'

describe('plant environment render budget', () => {
  it('stays within the approved sparse foreground budget', () => {
    expect(PLANT_ENVIRONMENT_RENDER_BUDGET).toEqual({
      sourceDrawCalls: 6,
      materialCount: 6,
      triangles: 1114,
      externalTextureBytes: 3_947_484,
      decodedPanoramaBytes: 55_332_856,
      generatedLabelTextureBytes: 1_638_400,
      generatedSurfaceTextureBytes: 16_384,
    })
  })

  it('uses one bounded generated surface texture', () => {
    expect(PLANT_ENVIRONMENT_SURFACE_TEXTURE).toEqual({
      size: 64,
      repeat: 5,
      generatedBytes: 16_384,
    })
  })

  it('terminates walls and window pillars at the ceiling underside', () => {
    expect(PLANT_ENVIRONMENT_VERTICAL_SEAMS).toEqual({
      ceilingUndersideY: 3.17,
      frontWallTopY: 3.17,
      windowHeaderTopY: 3.17,
      windowPillarTopY: 3.17,
    })
  })

  it('attaches window trim without coplanar wall faces', () => {
    expect(PLANT_ENVIRONMENT_SURFACE_JOINS.rearTrimAttachmentZ).toBeCloseTo(
      PLANT_ENVIRONMENT_SURFACE_JOINS.rearWallInteriorZ,
      10,
    )
    expect(PLANT_ENVIRONMENT_SURFACE_JOINS.leftTrimAttachmentX).toBeCloseTo(
      PLANT_ENVIRONMENT_SURFACE_JOINS.leftWallInteriorX,
      10,
    )
    expect(PLANT_ENVIRONMENT_SURFACE_JOINS.rightTrimAttachmentX).toBeCloseTo(
      PLANT_ENVIRONMENT_SURFACE_JOINS.rightWallInteriorX,
      10,
    )
  })
})
