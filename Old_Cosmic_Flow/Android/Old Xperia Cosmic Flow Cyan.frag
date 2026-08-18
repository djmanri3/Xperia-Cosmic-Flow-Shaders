#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

// Uniforms estándar que provee Shader Editor de Android
uniform vec2 resolution; // Reemplaza a iResolution
uniform float time;      // Reemplaza a iTime

void main() {
    // Normalizar coordenadas centradas en pantalla (adaptado a Shader Editor)
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
    
    // Control de tiempo para la animación
    float t = time * 0.4;
    
    // Fondo oscuro con un resplandor central turquesa más marcado
    vec3 color = vec3(0.005, 0.02, 0.03);
    color += vec3(0.0, 0.12, 0.15) * smoothstep(1.0, 0.0, length(uv));
    
    // Superposición de capas de ondas luminosas y velos de seda intensos
    for (float i = 1.0; i <= 4.0; i++) {
        // Movimiento ondulatorio orgánico
        float waveY = sin(uv.x * 5.5 + t * i * 0.4 + i) * 0.15 
                    + cos(uv.x * 3.8 - t * 0.3 + i * 2.0) * 0.1;
                    
        float diff = uv.y - waveY;
        float dist = abs(diff);
        
        // Núcleo brillante y de alta intensidad
        float core = 0.0012 / (dist + 0.0018);
        
        // Velo de seda hacia abajo
        float downwardDist = max(0.0, -diff);
        float silkBody = smoothstep(0.2, 0.0, downwardDist) * step(diff, 0.0);
        
        // Textura interna para los pliegues de la tela
        float silkTexture = sin(uv.x * 12.0 + diff * 25.0 - t * 1.5) * 0.5 + 0.5;
        silkBody *= (0.4 + 0.6 * silkTexture);
        
        // --- PALETA DE COLORES MÁS INTENSA ---
        vec3 waveColor = mix(
            vec3(0.0, 0.75, 0.68), 
            vec3(0.2, 1.0, 0.95), 
            sin(i + t * 0.5) * 0.5 + 0.5
        );
        
        // Acumulación con multiplicadores de brillo más altos
        color += waveColor * (core * 0.85 + silkBody * 0.3) / i;
    }
    
    // Limitar valores de color finales
    color = clamp(color, 0.0, 1.0);
    
    // Salida final obligatoria en OpenGL ES
    gl_FragColor = vec4(color, 1.0);
}
