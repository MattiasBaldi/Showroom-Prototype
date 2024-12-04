import { Vector3 } from 'three'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { SpotLight, useDepthBuffer } from '@react-three/drei'

function MovingSpot({ vec = new Vector3(), ...props }) {
  const light = useRef()
  const viewport = useThree((state) => state.viewport)
  useFrame((state) => {
    light.current.target.position.lerp(vec.set((state.mouse.x * viewport.width) / 2, (state.mouse.y * viewport.height) / 2, 0), 0.1)
    light.current.target.updateMatrixWorld()
  })
  return <SpotLight castShadow ref={light} penumbra={1} distance={6} angle={0.35} attenuation={5} anglePower={4} intensity={2} {...props} />
}

export default MovingSpot


import React from 'react'
import { Canvas } from '@react-three/fiber'
import MovingSpot from './MovingSpot' // Adjust the import path as necessary

function MyScene() {
  return (
    <Canvas>
      <MovingSpot color="#0c8cbf" position={[3, 3, 2]} />
      <MovingSpot color="#b00c3f" position={[1, 3, 0]} />
      {/* Add your other scene components here */}
    </Canvas>
  )
}

export default MyScene