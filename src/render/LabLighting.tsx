export const LAB_LIGHTING_BUDGET = Object.freeze({
  realTimeLights: 2,
  selfLitSurfaceDraws: 1,
})

export function LabLighting() {
  return (
    <>
      <hemisphereLight args={['#dceae6', '#263633', 1.08]} />
      <directionalLight
        color={'#ffedcf'}
        intensity={1.42}
        position={[-3.5, 4.8, 2.6]}
      />
    </>
  )
}
