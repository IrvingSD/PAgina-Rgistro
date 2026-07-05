/**
 * Fondo Animado WebGL2 - Opción 1: Perspectiva Interactiva (Mouse/Touch)
 * Shader original por Matthias Hurrle (@atzedent)
 */
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.createElement("canvas");
  canvas.classList.add("shader-background");
  document.body.appendChild(canvas);

  // 1. Fragment Shader adaptado para usar la coordenada 'touch'
  const shaderSource = `#version 300 es
  precision highp float;
  out vec4 O;
  uniform float time;
  uniform vec2 resolution;
  uniform vec2 touch; // Recibe la posición suavizada del mouse/dedo
  
  #define FC gl_FragCoord.xy
  #define R resolution
  #define T time
  
  #define hue(a) (cos(6.3*(a)) > .65 ? vec3(1.0, 0.0, 0.9) : vec3(0.0, .35 + .35 * cos(6.3 * (a)), .7 + .3 * cos(6.3 * (a))))
  
  float rnd(float a) {
      vec2 p=fract(a*vec2(12.9898,78.233)); p+=dot(p,p*345.);
      return fract(p.x*p.y);
  }
  
  vec3 pattern(vec2 uv) {
      vec3 col=vec3(0);
      for (float i=.0; i++<20.;) {
          float a=rnd(i);
          vec2 n=vec2(a,fract(a*34.56)), p=sin(n*(T+7.)+T*.5);
          float d=dot(uv-p,uv-p);
          col+=.00125/d*hue(dot(uv,uv)+i*.125+T);
      }
      return col;
  }
  
  void main(void) {
      // Centramos las coordenadas de la pantalla
      vec2 uv=(FC-.5*R)/min(R.x,R.y);
      
      // DESPLAZAMIENTO INTERACTIVO: Movemos el centro del túnel según 'touch'
      uv -= touch * 0.3; 
      
      vec3 col=vec3(0);
      float s=2.4,
      a=atan(uv.x,uv.y),
      b=length(uv);
      
      uv=vec2(a*5./6.28318,.05/tan(b)+T);
      uv=fract(uv)-.5;
      col+=pattern(uv*s);
      O=vec4(col,1);
  }`;

  // 2. Lógica de WebGL y captura de coordenadas
  const dpr = Math.max(1, .5 * window.devicePixelRatio);
  
  // Variables para suavizar el movimiento (Efecto muelle/amortiguación)
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    if (renderer) renderer.updateScale(dpr);
  };

  // --- ESCUCHAR MOVIMIENTOS DEL MOUSE Y TOQUES ---
  const updateCoordinates = (x, y) => {
    // Convertimos los píxeles de la pantalla a un rango de -1.0 a 1.0
    targetX = (x / window.innerWidth) * 2 - 1;
    targetY = -(y / window.innerHeight) * 2 + 1; // Invertir eje Y para WebGL
  };

  window.addEventListener('mousemove', (e) => {
    updateCoordinates(e.clientX, e.clientY);
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      updateCoordinates(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // Si el mouse sale de la pantalla, el túnel regresa lentamente al centro
  window.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  class Renderer {
    #vertexSrc = "#version 300 es\nprecision highp float;\nin vec4 position;\nvoid main(){gl_Position=position;}";
    #vertices = [-1, 1, -1, -1, 1, 1, 1, -1];
    
    constructor(canvas, scale) {
      this.canvas = canvas;
      this.scale = scale;
      this.gl = canvas.getContext("webgl2");
      this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
    }
    
    setup() {
      const gl = this.gl;
      this.vs = gl.createShader(gl.VERTEX_SHADER);
      this.fs = gl.createShader(gl.FRAGMENT_SHADER);
      
      gl.shaderSource(this.vs, this.#vertexSrc);
      gl.compileShader(this.vs);
      
      gl.shaderSource(this.fs, shaderSource);
      gl.compileShader(this.fs);
      
      this.program = gl.createProgram();
      gl.attachShader(this.program, this.vs);
      gl.attachShader(this.program, this.fs);
      gl.linkProgram(this.program);
    }
    
    init() {
      const { gl, program } = this;
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#vertices), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      program.resolution = gl.getUniformLocation(program, "resolution");
      program.time = gl.getUniformLocation(program, "time");
      program.touch = gl.getUniformLocation(program, "touch"); // Enlazamos el uniform touch
    }
    
    updateScale(scale) {
      this.scale = scale;
      this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
    }
    
    render(timeValue, touchX, touchY) {
      const { gl, program, buffer, canvas } = this;
      if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      
      gl.uniform2f(program.resolution, canvas.width, canvas.height);
      gl.uniform1f(program.time, timeValue);
      gl.uniform2f(program.touch, touchX, touchY); // Enviamos la posición actual al Shader
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  const renderer = new Renderer(canvas, dpr);
  renderer.setup();
  renderer.init();
  resize();

  window.addEventListener('resize', resize);

  const loop = (now) => {
    // Animación lenta y constante como querías (now / 2000)
    const timeValue = now / 2000;

    // Interpolación lineal (Lerp) para que el seguimiento no sea rígido, sino suave y elegante
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    renderer.render(timeValue, currentX, currentY);
    requestAnimationFrame(loop);
  };
  loop(0);
});