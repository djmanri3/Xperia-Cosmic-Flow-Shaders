#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

// Uniforms estándar que provee Shader Editor de Android
uniform vec2 resolution; // Reemplaza a iResolution
uniform float time;      // Reemplaza a iTime

void main() {
    // ==========================================
    // CONFIGURACIÓN DE COLORES (Amarillos y dorados personalizados)
    // ==========================================
    // Valores RGB en escala de 0.0 a 1.0
    vec3 u_bgColor     = vec3(0.02, 0.015, 0.005);   // Color base del fondo oscuro (con sutil tinte cálido)
    vec3 u_bgGlowColor = vec3(0.18, 0.12, 0.02);     // Color del resplandor central del fondo (ámbar/dorado)
    
    vec3 u_waveColorA  = vec3(0.9, 0.65, 0.1);       // Primer tono de la onda (Amarillo dorado base)
    vec3 u_waveColorB  = vec3(1.0, 0.9, 0.3);        // Segundo tono de la onda (Amarillo brillante/blanco cálido)
    // ==========================================

    // Normalizar coordenadas centradas en pantalla (adaptado a Shader Editor)
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
    
    // Control de tiempo para la animación
    float t = time * 0.4;
    
    // Aplicar colores del fondo
    vec3 color = u_bgColor;
    color += u_bgGlowColor * smoothstep(1.0, 0.0, length(uv));
    
    // Factor de resolución para el antialiasing
    float px = 1.0 / resolution.y;
    
    // Superposición de capas de ondas luminosas y velos de seda intensos
    for (float i = 1.0; i <= 4.0; i++) {
        // Movimiento ondulatorio orgánico original
        float waveY = sin(uv.x * 5.5 + t * i * 0.4 + i) * 0.15 
                    + cos(uv.x * 3.8 - t * 0.3 + i * 2.0) * 0.1;
                    
        float diff = uv.y - waveY;
        float dist = abs(diff);
        
        // Núcleo brillante con protección anti-aliasing
        float core = 0.0012 / (dist + 0.0018 + px * 0.5);
        
        // Velo de seda hacia abajo
        float downwardDist = max(0.0, -diff);
        float silkBody = smoothstep(0.2, 0.0, downwardDist) * smoothstep(px, -px, diff);
        
        // Textura interna original para los pliegues de la tela
        float silkTexture = sin(uv.x * 12.0 + diff * 25.0 - t * 1.5) * 0.5 + 0.5;
        silkBody *= (0.4 + 0.6 * silkTexture);
        
        // Mezcla de colores amarillos personalizados para las ondas
        vec3 waveColor = mix(
            u_waveColorA, 
            u_waveColorB, 
            sin(i + t * 0.5) * 0.5 + 0.5
        );
        
        // Acumulación con multiplicadores de brillo
        color += waveColor * (core * 0.85 + silkBody * 0.3) / i;
    }
    
    // Limitar valores de color finales
    color = clamp(color, 0.0, 1.0);
    
    // Salida final obligatoria en OpenGL ES
    gl_FragColor = vec4(color, 1.0);
}
