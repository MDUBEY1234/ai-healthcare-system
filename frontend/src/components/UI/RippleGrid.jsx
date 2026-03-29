// src/components/UI/RippleGrid.jsx
import { useRef, useEffect, useState } from "react";
import { Renderer, Program, Triangle, Mesh } from "ogl";
import "./RippleGrid.css";

const RippleGrid = ({
  enableRainbow = false,
  gridColor = "#ffffff",
  rippleIntensity = 0.05,
  gridSize = 10.0,
  gridThickness = 15.0,
  fadeDistance = 1.5,
  vignetteStrength = 2.0,
  glowIntensity = 0.1,
  opacity = 1.0,
  gridRotation = 0,
  mouseInteraction = true,
  mouseInteractionRadius = 1,
}) => {
  const containerRef = useRef(null);
  const mousePositionRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseInfluenceRef = useRef(0);
  const uniformsRef = useRef(null);
  const rendererRef = useRef(null);
  const meshRef = useRef(null);
  const isInitializedRef = useRef(false);
  const animationFrameRef = useRef(null);
  
  // Loading state to prevent white flash
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let cleanup = false;

    const initializeWebGL = async () => {
      try {
        const hexToRgb = (hex) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? [ parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255 ] : [1, 1, 1];
        };

        // Wait a tick to ensure DOM is ready
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        if (cleanup) return;

        const renderer = new Renderer({
          dpr: Math.min(window.devicePixelRatio, 2),
          alpha: true,
          premultipliedAlpha: false,
          antialias: true,
          powerPreference: "high-performance"
        });
        
        rendererRef.current = renderer;
        const gl = renderer.gl;
        
        // Important: Set canvas to transparent black initially
        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        // Style the canvas immediately
        gl.canvas.style.cssText = `
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: transparent !important;
          display: block !important;
        `;
        
        // Append canvas
        if (containerRef.current && !cleanup) {
          containerRef.current.appendChild(gl.canvas);
        }

        const vert = `
          attribute vec2 position;
          varying vec2 vUv;
          void main() { 
            vUv = position * 0.5 + 0.5; 
            gl_Position = vec4(position, 0.0, 1.0); 
          }`;

        const frag = `
          precision highp float;
          uniform float iTime; 
          uniform vec2 iResolution; 
          uniform bool enableRainbow; 
          uniform vec3 gridColor;
          uniform float rippleIntensity; 
          uniform float gridSize; 
          uniform float gridThickness; 
          uniform float fadeDistance;
          uniform float vignetteStrength; 
          uniform float glowIntensity; 
          uniform float opacity; 
          uniform float gridRotation;
          uniform bool mouseInteraction; 
          uniform vec2 mousePosition; 
          uniform float mouseInfluence; 
          uniform float mouseInteractionRadius;
          varying vec2 vUv;
          
          const float pi = 3.141592653589793;
          
          mat2 rotate(float angle) { 
            float s = sin(angle); 
            float c = cos(angle); 
            return mat2(c, -s, s, c); 
          }
          
          void main() {
              vec2 uv = vUv * 2.0 - 1.0; 
              uv.x *= iResolution.x / iResolution.y;
              
              if (gridRotation != 0.0) { 
                uv = rotate(gridRotation * pi / 180.0) * uv; 
              }
              
              float dist = length(uv);
              float func = sin(pi * (iTime - dist));
              vec2 rippleUv = uv + uv * func * rippleIntensity;
              
              if (mouseInteraction && mouseInfluence > 0.0) {
                  vec2 mouseUv = (mousePosition * 2.0 - 1.0);
                  mouseUv.x *= iResolution.x / iResolution.y;
                  float mouseDist = length(uv - mouseUv);
                  float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));
                  float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
                  rippleUv += normalize(uv - mouseUv) * mouseWave * rippleIntensity * 0.3;
              }
              
              vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
              vec2 b = abs(a);
              vec2 smoothB = smoothstep(0.0, 0.5, b);
              
              vec3 color = vec3(0.0);
              color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime)));
              color += exp(-gridThickness * smoothB.y);
              color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));
              color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);
              
              if (glowIntensity > 0.0) {
                  color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);
                  color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);
              }
              
              float ddd = exp(-2.0 * clamp(pow(dist, fadeDistance), 0.0, 1.0));
              vec2 vignetteCoords = vUv - 0.5;
              float vignette = 1.0 - pow(length(vignetteCoords) * 2.0, vignetteStrength);
              vignette = clamp(vignette, 0.0, 1.0);
              
              vec3 t = enableRainbow ? 
                vec3(uv.x * 0.5 + 0.5 * sin(iTime), uv.y * 0.5 + 0.5 * cos(iTime), pow(cos(iTime), 4.0)) + 0.5 : 
                gridColor;
              
              float finalFade = ddd * vignette;
              // Ensure we always have some alpha to prevent white flash
              float alpha = max(length(color) * finalFade * opacity, 0.02);
              
              gl_FragColor = vec4(color * t * finalFade * opacity, alpha);
          }`;

        const uniforms = {
          iTime: { value: 0 }, 
          iResolution: { value: [1, 1] }, 
          enableRainbow: { value: enableRainbow },
          gridColor: { value: hexToRgb(gridColor) }, 
          rippleIntensity: { value: rippleIntensity }, 
          gridSize: { value: gridSize },
          gridThickness: { value: gridThickness }, 
          fadeDistance: { value: fadeDistance }, 
          vignetteStrength: { value: vignetteStrength },
          glowIntensity: { value: glowIntensity }, 
          opacity: { value: opacity }, 
          gridRotation: { value: gridRotation },
          mouseInteraction: { value: mouseInteraction }, 
          mousePosition: { value: [0.5, 0.5] }, 
          mouseInfluence: { value: 0 },
          mouseInteractionRadius: { value: mouseInteractionRadius },
        };
        uniformsRef.current = uniforms;

        const geometry = new Triangle(gl);
        const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
        const mesh = new Mesh(gl, { geometry, program });
        meshRef.current = mesh;

        // Wait for shaders to compile
        await new Promise(resolve => {
          const checkShader = () => {
            if (program.uniformLocations || cleanup) {
              resolve();
            } else {
              requestAnimationFrame(checkShader);
            }
          };
          checkShader();
        });

        if (cleanup) return;

        const resize = () => {
          if (!containerRef.current || !renderer) return;
          const { clientWidth: w, clientHeight: h } = containerRef.current;
          renderer.setSize(w, h);
          uniforms.iResolution.value = [w, h];
        };

        const handleMouseMove = (e) => {
          if (!mouseInteraction || !containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = 1.0 - (e.clientY - rect.top) / rect.height;
          targetMouseRef.current = { x, y };
        };

        const handleMouseEnter = () => { 
          if (!mouseInteraction) return; 
          mouseInfluenceRef.current = 1.0; 
        };
        
        const handleMouseLeave = () => { 
          if (!mouseInteraction) return; 
          mouseInfluenceRef.current = 0.0; 
        };

        window.addEventListener("resize", resize);
        if (mouseInteraction && containerRef.current) {
          containerRef.current.addEventListener("mousemove", handleMouseMove);
          containerRef.current.addEventListener("mouseenter", handleMouseEnter);
          containerRef.current.addEventListener("mouseleave", handleMouseLeave);
        }
        
        resize();
        
        // Render first frame immediately to prevent white flash
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderer.render({ scene: mesh });

        let startTime = performance.now();
        const render = (currentTime) => {
          if (cleanup || !uniformsRef.current || !rendererRef.current || !meshRef.current) return;
          
          // Use relative time from start to avoid jumps
          const relativeTime = currentTime - startTime;
          uniforms.iTime.value = relativeTime * 0.001;

          const lerpFactor = 0.1; 
          mousePositionRef.current.x += (targetMouseRef.current.x - mousePositionRef.current.x) * lerpFactor;
          mousePositionRef.current.y += (targetMouseRef.current.y - mousePositionRef.current.y) * lerpFactor;

          const currentInfluence = uniforms.mouseInfluence.value;
          const targetInfluence = mouseInfluenceRef.current;
          uniforms.mouseInfluence.value += (targetInfluence - currentInfluence) * 0.05;
          uniforms.mousePosition.value = [ mousePositionRef.current.x, mousePositionRef.current.y ];

          gl.clear(gl.COLOR_BUFFER_BIT);
          renderer.render({ scene: mesh });
          
          animationFrameRef.current = requestAnimationFrame(render);
        };

        // Start render loop
        animationFrameRef.current = requestAnimationFrame(render);
        isInitializedRef.current = true;
        
        // Set ready after first few frames to ensure smooth transition
        setTimeout(() => {
          if (!cleanup) {
            setIsReady(true);
          }
        }, 100);

        return () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          window.removeEventListener("resize", resize);
          if (mouseInteraction && containerRef.current) {
            const current = containerRef.current;
            current.removeEventListener("mousemove", handleMouseMove);
            current.removeEventListener("mouseenter", handleMouseEnter);
            current.removeEventListener("mouseleave", handleMouseLeave);
          }
        };

      } catch (error) {
        console.error("WebGL initialization error:", error);
        setIsReady(true); // Show content even if WebGL fails
      }
    };

    initializeWebGL();

    return () => {
      cleanup = true;
      isInitializedRef.current = false;
      setIsReady(false);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Clean up WebGL context
      if (rendererRef.current && rendererRef.current.gl) {
        const loseContext = rendererRef.current.gl.getExtension("WEBGL_lose_context");
        if (loseContext) {
          loseContext.loseContext();
        }
      }
      
      // Clean up DOM
      if (containerRef.current && rendererRef.current && rendererRef.current.gl.canvas) {
        try { 
          if (containerRef.current.contains(rendererRef.current.gl.canvas)) {
            containerRef.current.removeChild(rendererRef.current.gl.canvas);
          }
        } catch (e) { 
          console.warn("Canvas cleanup error:", e);
        }
      }
      
      // Clear refs
      rendererRef.current = null;
      meshRef.current = null;
      uniformsRef.current = null;
    };
  }, []); // Only run once on mount

  useEffect(() => {
    if (!uniformsRef.current || !isInitializedRef.current) return;
    
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [ parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255 ] : [1, 1, 1];
    };
    
    uniformsRef.current.enableRainbow.value = enableRainbow;
    uniformsRef.current.gridColor.value = hexToRgb(gridColor);
    uniformsRef.current.rippleIntensity.value = rippleIntensity;
    uniformsRef.current.gridSize.value = gridSize;
    uniformsRef.current.gridThickness.value = gridThickness;
    uniformsRef.current.fadeDistance.value = fadeDistance;
    uniformsRef.current.vignetteStrength.value = vignetteStrength;
    uniformsRef.current.glowIntensity.value = glowIntensity;
    uniformsRef.current.opacity.value = opacity;
    uniformsRef.current.gridRotation.value = gridRotation;
    uniformsRef.current.mouseInteraction.value = mouseInteraction;
    uniformsRef.current.mouseInteractionRadius.value = mouseInteractionRadius;
  }, [
    enableRainbow, gridColor, rippleIntensity, gridSize, gridThickness,
    fadeDistance, vignetteStrength, glowIntensity, opacity, gridRotation,
    mouseInteraction, mouseInteractionRadius,
  ]);

  return (
    <div 
      ref={containerRef} 
      className="ripple-grid-container"
      style={{
        opacity: isReady ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
};

export default RippleGrid;