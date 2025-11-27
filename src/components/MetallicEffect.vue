<template>
  <canvas ref="canvasRef" class="metallic-canvas" />
</template>

<script>
export default {
  name: 'MetallicEffect',
  props: {
    params: {
      type: Object,
      default: () => ({
        patternScale: 1.8, // Un poco más de patrón
        refraction: 0.01, // Un poco más de refracción
        edge: 0.9, // Más definición
        patternBlur: 0.002, // Menos desenfoque para más definición
        liquid: 0.04, // Un poco más de efecto líquido
        speed: 0.25, // Velocidad media
      }),
    },
  },
  data() {
    return {
      gl: null,
      uniforms: {},
      totalAnimationTime: 0,
      lastRenderTime: 0,
      animationId: null,
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initShader()
      this.updateUniforms()
      this.resizeCanvas()
      this.startAnimation()

      window.addEventListener('resize', this.resizeCanvas)
    })
  },
  beforeUnmount() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    window.removeEventListener('resize', this.resizeCanvas)
  },
  methods: {
    initShader() {
      const canvas = this.$refs.canvasRef
      const glContext = canvas?.getContext('webgl2', {
        antialias: true,
        alpha: true,
      })
      if (!canvas || !glContext) {
        return
      }

      const vertexShaderSource = `#version 300 es
      precision mediump float;
      in vec2 a_position;
      out vec2 vUv;
      void main() {
          vUv = .5 * (a_position + 1.);
          gl_Position = vec4(a_position, 0.0, 1.0);
      }`

      const liquidFragSource = `#version 300 es
      precision mediump float;
      in vec2 vUv;
      out vec4 fragColor;
      uniform float u_time;
      uniform float u_ratio;
      uniform float u_patternScale;
      uniform float u_refraction;
      uniform float u_edge;
      uniform float u_patternBlur;
      uniform float u_liquid;

      #define TWO_PI 6.28318530718
      #define PI 3.14159265358979323846

      vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
      vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
      vec3 permute(vec3 x) { return mod289(((x*34.)+1.)*x); }

      float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
          vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
          m = m*m;
          m = m*m;
          vec3 x = 2. * fract(p * C.www) - 1.;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x = a0.x * x0.x + h.x * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130. * dot(m, g);
      }

      vec2 rotate(vec2 uv, float th) {
          return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
      }

      float get_color_channel(float c1, float c2, float stripe_p, vec3 w, float extra_blur, float b) {
          float ch = c2;
          float border = 0.;
          float blur = u_patternBlur + extra_blur;
          ch = mix(ch, c1, smoothstep(.0, blur, stripe_p));
          border = w[0];
          ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
          b = smoothstep(.2, .8, b);
          border = w[0] + .4 * (1. - b) * w[1];
          ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
          border = w[0] + .5 * (1. - b) * w[1];
          ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
          border = w[0] + w[1];
          ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
          float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
          float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
          ch = mix(ch, gradient, smoothstep(border - blur, border + blur, stripe_p));
          return ch;
      }

      // Función para crear bordes redondeados
      float roundedBox(vec2 uv, vec2 size, float radius) {
          vec2 q = abs(uv) - size + radius;
          return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
      }

      void main() {
          vec2 uv = vUv;
          uv.y = 1. - uv.y;
          uv.x *= u_ratio;

          // Crear bordes redondeados
          vec2 center = vec2(0.5 * u_ratio, 0.5);
          vec2 pos = uv - center;
          float radius = 0.45;
          float border = roundedBox(pos, vec2(0.45 * u_ratio, 0.45), 0.1);
          float alpha = 1.0 - smoothstep(0.0, 0.02, border);

          if (alpha < 0.01) {
              discard;
          }

          float diagonal = uv.x - uv.y;
          float t = .001 * u_time;

          vec3 color = vec3(0.);
          // Colores gris metálico SATURADO - más contrastados y definidos
          vec3 color1 = vec3(0.4, 0.3, 0.8);   // Gris metálico muy claro saturado
          vec3 color2 = vec3(0.2, 0.65, 0.45);    // Gris metálico oscuro saturado

          vec2 grad_uv = uv;
          grad_uv -= .5;
          float dist = length(grad_uv + vec2(0., .15 * diagonal));
          grad_uv = rotate(grad_uv, (.2 - .15 * diagonal) * PI);

          // Efectos más definidos para mayor saturación
          float bulge = pow(1.6 * dist, 1.15);
          bulge = 1. - bulge;
          bulge *= pow(uv.y, .25);

          float cycle_width = u_patternScale;
          float thin_strip_1_ratio = .1 / cycle_width * (1. - .3 * bulge);
          float thin_strip_2_ratio = .06 / cycle_width * (1. + .3 * bulge);
          float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);
          float thin_strip_1_width = cycle_width * thin_strip_1_ratio;
          float thin_strip_2_width = cycle_width * thin_strip_2_ratio;

          float noise = snoise(uv * 0.9 - t * 0.6);
          float refr = 0.;
          refr += (0.85 - bulge);
          refr = clamp(refr, 0., 0.6);

          float dir = grad_uv.x;
          dir += diagonal * 0.6;
          dir -= 1.2 * noise * diagonal;
          bulge *= clamp(pow(uv.y, .08), .6, 1.);
          dir *= (.08 + bulge);
          dir += .12 * (smoothstep(.1, .2, uv.y) * smoothstep(.4, .2, uv.y));
          dir += .03 * (smoothstep(.1, .2, 1. - uv.y) * smoothstep(.4, .2, 1. - uv.y));
          dir *= (.75 + .25 * pow(uv.y, 2.));
          dir *= cycle_width;
          dir -= t * 0.9;

          float refr_r = refr * 0.4;
          refr_r += .015 * bulge * noise;
          float refr_b = refr * 0.5;

          vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
          w[1] -= .015;

          float stripe_r = mod(dir + refr_r, 1.);
          float r = get_color_channel(color1.r, color2.r, stripe_r, w, 0.008, bulge);
          float stripe_g = mod(dir, 1.);
          float g = get_color_channel(color1.g, color2.g, stripe_g, w, 0.006, bulge);
          float stripe_b = mod(dir - refr_b, 1.);
          float b = get_color_channel(color1.b, color2.b, stripe_b, w, 0.006, bulge);

          color = vec3(r, g, b);

          // Añadir contraste y saturación extra
          float contrast = 1.2;
          color = (color - 0.5) * contrast + 0.5;

          // Brillos más definidos
          float shine1 = smoothstep(0.2, 0.7, uv.y) * 0.15;
          float shine2 = smoothstep(0.6, 0.9, uv.x) * 0.1;
          color += (shine1 + shine2) * vec3(0.9, 0.9, 1.0);

          // Saturación final
          vec3 gray = vec3(0.5);
          float saturation = 1.3;
          color = mix(gray, color, saturation);

          color *= alpha;

          fragColor = vec4(color, alpha);
      }`

      const vertexShader = this.createShader(glContext, vertexShaderSource, glContext.VERTEX_SHADER)
      const fragmentShader = this.createShader(
        glContext,
        liquidFragSource,
        glContext.FRAGMENT_SHADER,
      )
      const program = glContext.createProgram()
      if (!program || !vertexShader || !fragmentShader) {
        return
      }

      glContext.attachShader(program, vertexShader)
      glContext.attachShader(program, fragmentShader)
      glContext.linkProgram(program)

      if (!glContext.getProgramParameter(program, glContext.LINK_STATUS)) {
        console.error(
          'Unable to initialize the shader program: ' + glContext.getProgramInfoLog(program),
        )
        return null
      }

      this.uniforms = this.getUniforms(program, glContext)

      const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
      const vertexBuffer = glContext.createBuffer()
      glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer)
      glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW)

      glContext.useProgram(program)

      const positionLocation = glContext.getAttribLocation(program, 'a_position')
      glContext.enableVertexAttribArray(positionLocation)

      glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer)
      glContext.vertexAttribPointer(positionLocation, 2, glContext.FLOAT, false, 0, 0)

      this.gl = glContext
    },

    createShader(gl, sourceCode, type) {
      const shader = gl.createShader(type)
      if (!shader) {
        return null
      }

      gl.shaderSource(shader, sourceCode)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }

      return shader
    },

    getUniforms(program, gl) {
      const uniformsObj = {}
      const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
      for (let i = 0; i < uniformCount; i++) {
        const uniformName = gl.getActiveUniform(program, i)?.name
        if (!uniformName) continue
        uniformsObj[uniformName] = gl.getUniformLocation(program, uniformName)
      }
      return uniformsObj
    },

    updateUniforms() {
      if (!this.gl || !this.uniforms) return
      this.gl.uniform1f(this.uniforms.u_edge, this.params.edge)
      this.gl.uniform1f(this.uniforms.u_patternBlur, this.params.patternBlur)
      this.gl.uniform1f(this.uniforms.u_time, 0)
      this.gl.uniform1f(this.uniforms.u_patternScale, this.params.patternScale)
      this.gl.uniform1f(this.uniforms.u_refraction, this.params.refraction)
      this.gl.uniform1f(this.uniforms.u_liquid, this.params.liquid)
    },

    resizeCanvas() {
      if (!this.$refs.canvasRef || !this.gl || !this.uniforms) return

      const container = this.$el.parentElement
      if (container) {
        const rect = container.getBoundingClientRect()
        this.$refs.canvasRef.width = rect.width * devicePixelRatio
        this.$refs.canvasRef.height = rect.height * devicePixelRatio
        this.gl.viewport(0, 0, this.$refs.canvasRef.width, this.$refs.canvasRef.height)
        this.gl.uniform1f(this.uniforms.u_ratio, rect.width / rect.height)
      }
    },

    render(currentTime) {
      if (!this.gl || !this.uniforms) return

      const deltaTime = currentTime - this.lastRenderTime
      this.lastRenderTime = currentTime

      this.totalAnimationTime += deltaTime * this.params.speed
      this.gl.uniform1f(this.uniforms.u_time, this.totalAnimationTime)
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
      this.animationId = requestAnimationFrame(this.render)
    },

    startAnimation() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
      }
      this.lastRenderTime = performance.now()
      this.animationId = requestAnimationFrame(this.render)
    },
  },
  watch: {
    params: {
      handler() {
        this.updateUniforms()
      },
      deep: true,
    },
  },
}
</script>

<style scoped>
.metallic-canvas {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 15px;
}
</style>
