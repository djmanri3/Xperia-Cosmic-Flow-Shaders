// GLSL Fragment Shader (Shadertoy format)
// Ondas luminosas con cambio automático de color cada 30 segundos

// Función para obtener la paleta de colores según el índice
void getColorSet(int id, out vec3 bg, out vec3 glow, out vec3 wa, out vec3 wb) {
    if(id == 0) { // Turquesa (Original)
        bg   = vec3(0.005, 0.02, 0.03);
        glow = vec3(0.0, 0.12, 0.15);
        wa   = vec3(0.0, 0.75, 0.68);
        wb   = vec3(0.2, 1.0, 0.95);
    } else if(id == 1) { // Verde
        bg   = vec3(0.01, 0.02, 0.01);
        glow = vec3(0.0, 0.15, 0.08);
        wa   = vec3(0.1, 0.75, 0.3);
        wb   = vec3(0.4, 1.0, 0.55);
    } else if(id == 2) { // Azul
        bg   = vec3(0.01, 0.01, 0.03);
        glow = vec3(0.0, 0.08, 0.2);
        wa   = vec3(0.1, 0.5, 0.9);
        wb   = vec3(0.3, 0.85, 1.0);
    } else if(id == 3) { // Amarillo
        bg   = vec3(0.02, 0.015, 0.005);
        glow = vec3(0.18, 0.12, 0.02);
        wa   = vec3(0.9, 0.65, 0.1);
        wb   = vec3(1.0, 0.9, 0.3);
    } else if(id == 4) { // Rosa
        bg   = vec3(0.02, 0.005, 0.015);
        glow = vec3(0.15, 0.02, 0.08);
        wa   = vec3(0.8, 0.15, 0.5);
        wb   = vec3(1.0, 0.4, 0.75);
    } else { // Púrpura (5)
        bg   = vec3(0.015, 0.005, 0.025);
        glow = vec3(0.12, 0.02, 0.22);
        wa   = vec3(0.5, 0.15, 0.85);
        wb   = vec3(0.75, 0.4, 1.0);
    }
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // ==========================================
    // CONTROL DE TIEMPO Y TRANSICIÓN DE COLORES
    // ==========================================
    float cycleTime = iTime / 30.0;
    int id1 = int(mod(floor(cycleTime), 6.0));
    int id2 = int(mod(float(id1) + 1.0, 6.0));
    
    // Progreso dentro del bloque de 30 segundos
    float progress = mod(iTime, 30.0);
    // Transición suave durante los últimos 5 segundos de cada bloque
    float mixFactor = smoothstep(25.0, 30.0, progress);
    
    vec3 bg1, glow1, wa1, wb1;
    vec3 bg2, glow2, wa2, wb2;
    
    getColorSet(id1, bg1, glow1, wa1, wb1);
    getColorSet(id2, bg2, glow2, wa2, wb2);
    
    // Colores finales interpolados automáticamente
    vec3 u_bgColor     = mix(bg1, bg2, mixFactor);
    vec3 u_bgGlowColor = mix(glow1, glow2, mixFactor);
    vec3 u_waveColorA  = mix(wa1, wa2, mixFactor);
    vec3 u_waveColorB  = mix(wb1, wb2, mixFactor);
    // ==========================================

    // Normalizar coordenadas centradas en pantalla
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    
    // Control de tiempo para la animación
    float t = iTime * 0.4;
    
    // Aplicar colores del fondo
    vec3 color = u_bgColor;
    color += u_bgGlowColor * smoothstep(1.0, 0.0, length(uv));
    
    // Factor de resolución para el antialiasing
    float px = 1.0 / iResolution.y;
    
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
    
    fragColor = vec4(color, 1.0);
}