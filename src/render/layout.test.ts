import { describe, expect, it } from 'vitest'

import {
  APPARATUS_WORLD_POSITION,
  DESKTOP_CAMERA_POSITION,
  DESKTOP_CAMERA_TARGET,
  HERO_TANK_DEPTH_METERS,
  HERO_TANK_LOCAL_POSITION,
  JAR_TEST_RACK_BASE_HEIGHT_METERS,
  JAR_TEST_TABLETOP_HEIGHT_METERS,
  XR_MIN_START_CLEARANCE_METERS,
} from './layout'

describe('shared desktop and XR apparatus layout', () => {
  it('keeps the hero tank clear of the WebXR floor origin', () => {
    const tankCenterZ =
      APPARATUS_WORLD_POSITION[2] + HERO_TANK_LOCAL_POSITION[2]
    const nearestTankZ = tankCenterZ + HERO_TANK_DEPTH_METERS / 2

    expect(nearestTankZ).toBeLessThanOrEqual(-XR_MIN_START_CLEARANCE_METERS)
  })

  it('preserves the accepted desktop camera-to-apparatus offset', () => {
    expect(
      DESKTOP_CAMERA_POSITION.map(
        (coordinate, index) => coordinate - DESKTOP_CAMERA_TARGET[index],
      ),
    ).toEqual([3.1, 1.75, 4.6])
  })

  it('places the jar-test rack on a waist-height table', () => {
    expect(JAR_TEST_TABLETOP_HEIGHT_METERS).toBeGreaterThanOrEqual(0.7)
    expect(JAR_TEST_TABLETOP_HEIGHT_METERS).toBeLessThanOrEqual(0.9)
    expect(JAR_TEST_RACK_BASE_HEIGHT_METERS).toBeGreaterThan(
      JAR_TEST_TABLETOP_HEIGHT_METERS,
    )
  })
})
