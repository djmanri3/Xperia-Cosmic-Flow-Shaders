// GLSL Fragment Shader (Shadertoy format)
// Ondas luminosas en tonos púrpuras y violetas con antialiasing y velo de seda

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // ==========================================
    // CONFIGURACIÓN DE COLORES (Púrpuras y violetas personalizados)
    // ==========================================
    // Valores RGB en escala de 0.0 a 1.0
    vec3 u_bgColor     = vec3(0.015, 0.005, 0.025);  // Color base del fondo oscuro (con sutil tinte púrpura)
    vec3 u_bgGlowColor = vec3(0.12, 0.02, 0.22);     // Color del resplandor central del fondo (violeta profundo)
    
    vec3 u_waveColorA  = vec3(0.5, 0.15, 0.85);      // Primer tono de la onda (Púrpura vibrante base)
    vec3 u_waveColorB  = vec3(0.75, 0.4, 1.0);       // Segundo tono de la onda (Violeta claro / lavanda brillante)
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
        
        // Mezcla de colores púrpuras personalizados para las ondas
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