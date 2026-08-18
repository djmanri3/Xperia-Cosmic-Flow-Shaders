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
    // CONTROL DE TIEMPO Y TRANSICIÓN DE COLORES
    // ==========================================
    float cycleTime = time / 30.0;
    
    // Índices de paletas actuales (0 al 5)
    int id1 = int(mod(floor(cycleTime), 6.0));
    int id2 = int(mod(float(id1) + 1.0, 6.0));
    
    // Progreso dentro del bloque de 30 segundos
    float progress = mod(time, 30.0);
    // Transición suave durante los últimos 5 segundos de cada bloque
    float mixFactor = smoothstep(25.0, 30.0, progress);
    
    // Arrays de colores estructurados para compatibilidad móvil (OpenGL ES)
    vec3 bg[6];
    vec3 glow[6];
    vec3 wa[6];
    vec3 wb[6];
    
    // 0: Turquesa
    bg[0] = vec3(0.005, 0.02, 0.03); glow[0] = vec3(0.0, 0.12, 0.15); wa[0] = vec3(0.0, 0.75, 0.68); wb[0] = vec3(0.2, 1.0, 0.95);
    // 1: Verde
    bg[1] = vec3(0.01, 0.02, 0.01);  glow[1] = vec3(0.0, 0.15, 0.08); wa[1] = vec3(0.1, 0.75, 0.3);  wb[1] = vec3(0.4, 1.0, 0.55);
    // 2: Azul
    bg[2] = vec3(0.01, 0.01, 0.03);  glow[2] = vec3(0.0, 0.08, 0.2);  wa[2] = vec3(0.1, 0.5, 0.9);   wb[2] = vec3(0.3, 0.85, 1.0);
    // 3: Amarillo
    bg[3] = vec3(0.02, 0.015, 0.005);glow[3] = vec3(0.18, 0.12, 0.02); wa[3] = vec3(0.9, 0.65, 0.1);  wb[3] = vec3(1.0, 0.9, 0.3);
    // 4: Rosa
    bg[4] = vec3(0.02, 0.005, 0.015);glow[4] = vec3(0.15, 0.02, 0.08); wa[4] = vec3(0.8, 0.15, 0.5);  wb[4] = vec3(1.0, 0.4, 0.75);
    // 5: Púrpura
    bg[5] = vec3(0.015, 0.005, 0.025);glow[5] = vec3(0.12, 0.02, 0.22); wa[5] = vec3(0.5, 0.15, 0.85); wb[5] = vec3(0.75, 0.4, 1.0);
    
    // Extracción de los colores correspondientes de forma segura
    vec3 bg1 = bg[id1]; vec3 glow1 = glow[id1]; vec3 wa1 = wa[id1]; vec3 wb1 = wb[id1];
    vec3 bg2 = bg[id2]; vec3 glow2 = glow[id2]; vec3 wa2 = wa[id2]; vec3 wb2 = wb[id2];
    
    // Colores finales interpolados automáticamente
    vec3 u_bgColor     = mix(bg1, bg2, mixFactor);
    vec3 u_bgGlowColor = mix(glow1, glow2, mixFactor);
    vec3 u_waveColorA  = mix(wa1, wa2, mixFactor);
    vec3 u_waveColorB  = mix(wb1, wb2, mixFactor);
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
        
        // Mezcla de colores de la onda activa
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
