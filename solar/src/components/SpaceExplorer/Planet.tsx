import { Billboard, MeshWobbleMaterial, Outlines, Ring, Text, useTexture } from "@react-three/drei";
import { Vector3 } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from 'three';
import React, {  Reference, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPlanetRef, updateSelectedPlanet } from "../../app/store/solarSystemSlice";


interface PlanetProps {
    name: string,
    velocity: number,
    distance: number,
    size: number,
    textureURL?: string,
    color: string,
    orbitingAround?: Vector3 //TODO: later: THREE.Object3D? -> NO make it a  string that later finds it in an array that stores our 
    isHovered: boolean;
  }
  
// USEFUL FUNCTIONS
// -> useHelper function from drei
// TODO: use Leva to change speed and stuff -> animation control -> https://youtu.be/vTfMjI4rVSI?si=GhXC8vnDlvnhjLi_&t=3756
// TODO get textures from https://planetpixelemporium.com/earth.html OR https://www.solarsystemscope.com/textures/ and make planets look like planets :)
// TODO create earth: https://matiasgf.dev/experiments/earth
// TODO https://github.com/matiasngf/portfolio/tree/main/packages/experiments/earth
// TODO use Detailed from drei to render according to distance

// --------------------------------
// RENDER PLANET LABEL
// --------------------------------
interface PlanetLabelProps {
  planetRef: Reference;
  labelText: string;
  position: Vector3;
  fontSize?: number;
}

const PlanetLabel = ({planetRef, 
                      labelText, 
                      fontSize = 0.8,
                      position}:PlanetLabelProps) => {  
return (
    <mesh>
      <Billboard>
        <Text 
          position={position} // show the label below the planet
          color="darkgrey" 
          fontSize={fontSize}  
          anchorX="center"
        >
          {labelText}
        </Text> 
      </Billboard>
    </mesh>
  )
}



// --------------------------------
// RENDER ONE PLANET / CELESTIAL OBJECT
// --------------------------------
const Planet = ({name, textureURL, velocity, size, distance, orbitingAround, isHovered}:PlanetProps) => {
  
    const scaledDiameter = size / 100000; // scale the planet to a smaller size
  
    // Add the redux dispatcher
    const dispatch = useDispatch();
    
    // create a planetRef 
    const planetRef = useRef<THREE.Mesh>(); 
    const planetRefs = useSelector(state => state.solarSystem.planetRefs);

    // refactor to have the planetRef in the context
    


    // store the ref on creation of the planet mesh
    useEffect(() => {
      if (planetRef.current) { // will only be run after the ref has been created
          dispatch(addPlanetRef({  // add the planet ref to later use in the animation updater
              name: name, 
              ref: planetRef
          }));
      }
  }, [planetRef, name, dispatch]);                                
    
    // LEVA CONTROLS FOR LABEL RENDERING
    const { showLabels } = useControls({ showLabels: true })
    const { labelFontSize } = useControls({ labelFontSize: {
      value: 0.8,
      min:  0.2,
      max: 10,
      step: 0.2,
    }});
    
   
    // set the position it is circling around according to the orbitingAround-prop
    // if no orbitingAround is defined set center to be the sun.
    
    // TODO: replace the absolute position with a function that retrieves the current position of the 
    // planet passed in the orbitingAround property. planet should be a THREE.Object3D object
    
    let position = new THREE.Vector3(0, 0, 0);
    // if (!orbitingAround ) position = new THREE.Vector3(0, distance * systemScale, 0)

     /* TODO REPOSITION THE CAMERA AND FACE THE OBJECT WHEN CLICKED */

     // TODO: add more shaders for halos and stuff
      const texturePath = 'textures/' + textureURL
      const colorMap = useTexture(texturePath)
  
    return (<>
        <mesh 
          ref={planetRef} // reference for the animation 
          onClick={() => (dispatch(updateSelectedPlanet(name)))} 
          onPointerEnter={() => (isHovered = true)}
          onPointerLeave={() => (isHovered = false)}
        > 

        {/* event.stopPropagation() means that the event is contained only to the mesh and no other element in the application cares about this event. */} 
          {/* A icosahedronGeometry might be more apt performance wise -> less polygons */}
          <icosahedronGeometry 
              args={[scaledDiameter , 12]} 
          />
                   
                   
          {/*------------------------------------------------ 
             IF IT IS THE SUN -> MAKE IT WOBBLE 
          ------------------------------------------------ */}

          { name.toLowerCase() === 'sun' ? 
                <MeshWobbleMaterial 
                  speed={isHovered? 0.5 : 0.4} 
                  factor={isHovered? 0.2 : 0.1} 
                  map={colorMap} 
                  // color={isHovered ? 'orangered' : 'yellow'}
                  emissive={'orange'} // make it shine
                  emissiveIntensity={isHovered ? 0.6 : 0.6}
                  opacity={0.3}
                /> 
                : 
                <meshStandardMaterial 
                  // color={isHovered ? 'orange' : 'lightblue'}
                  map={colorMap} 
                  emissive={'white'} 
                  emissiveIntensity={0.3}
                />
          } 
          
          {/*------------------------------------------------ 
             GLOW EFFECT
             TODO FIX THAT THE GLOW IS APPLIED TO EVERYTHING IN THE MESH -> UNTANGLE THE MESH
          ------------------------------------------------ */
          /* <EffectComposer>
            <Bloom 
              intensity={1} 
              luminanceThreshold={0} 
              luminanceSmoothing={1} 
              height={300}
            />
          </EffectComposer> */}
  
          {/*------------------------------------------------ 
             PLANET LABEL with conditional rendering (when the Leva control is clicked)
          ------------------------------------------------ */}
          {showLabels ? 
              <PlanetLabel
                planetRef={planetRef}
                labelText={name} 
                fontSize={labelFontSize}
                position={position.add(new THREE.Vector3(0,-(scaledDiameter / 2) - 0.5,0))} // new position of the label
              /> 
              : null
          }
  
        {/*------------------------------------------------ 
          A RING THAT ACTS AS A BOUNDING BOX 
          TODO give it a transparent material and make it the clickable bounding box 
          TODO {give it the DREI Outline effect} 
          TODO MAKE IT A SEPARATE COMPONENT
          ------------------------------------------------*/}
        {
        name.toLowerCase() !== 'sun' ? 
            <mesh>
              <Billboard> {/* MAKE IT FACE THE CAM ALWAYS*/}
                {/* WHITE RING FOR VISUAL INDICATION */}
                <Ring
                  args={[scaledDiameter, scaledDiameter+3, 32]} 
                > 
                <meshStandardMaterial opacity={0} transparent/>
                <Outlines thickness={0.1} color="white" />
                </Ring>

                <Ring
                  args={[scaledDiameter+2.8, scaledDiameter+3, 32]} 
                /> 
                  <meshStandardMaterial color={'white'}/>
              </Billboard>
            </mesh>
          : 
            <Outlines thickness={0.1} color="red" />
        }     
        </mesh>
        </>
    );
  }

  export default React.memo(Planet);