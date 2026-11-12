const GL_VERSION = "#version 300 es"

// Get canvas and GL context
const canvas = document.querySelector("#renderCanvas")
const gl = canvas.getContext("webgl2") || canvas.getContext("webgl")
if(!gl) {
  alert("WebGL is not supported on your device!")
  location.href = "index.html"
}

// Load vertices that were stored
const code = localStorage.getItem('code')

let backgroundColor = { r: 0.7, g: 0.7, b: 1.0}
let vertices = new Float32Array([
  -0.5, -0.5, 0.0,
  0.5, -0.5, 0.0,
  0.0, 0.5, 0.0
]);
let colors = new Float32Array([
  0.5, 0.5, 0.0,
  0.5, 0.5, 1.0,
  0.0, 0.5, 0.0
]);
let rotateByMouse = false

eval(code)

if(vertices.length != colors.length){
  alert("Vertices and colors must have the same amount of elements!")
  location.href = "index.html"
}

function compileShader(source, type){
  const shader = gl.createShader(type)
  if(!shader) alert("Failed to create shader!")

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
    alert(`Failed to compile shader! [${gl.getShaderInfoLog(shader)}]`)

  return shader;
}

function CreateFBuffer(data){
  const buffer = gl.createBuffer()
  if(!buffer) alert("Failed to create buffer!")

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  return buffer
}
function SetBufferAtribute(program, name, buffer){
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

  const attr = gl.getAttribLocation(program, name)
  gl.enableVertexAttribArray(attr)
  gl.vertexAttribPointer(attr, 3, gl.FLOAT, false, 0, 0)
}

function MakeMatrixFromRotation(x, y, z){
  const cosX = Math.cos(x)
  const sinX = Math.sin(x)
  const cosY = Math.cos(y)
  const sinY = Math.sin(y)
  const cosZ = Math.cos(z)
  const sinZ = Math.sin(z)

  return new Float32Array([
    cosZ * cosY,                      sinZ * cosY,                      -sinY,        0,
    cosZ * sinY * sinX - sinZ * cosX, sinZ * sinY * sinX + cosZ * cosX, cosY * sinX,  0,
    cosZ * sinY * cosX + sinZ * sinX, sinZ * sinY * cosX - cosZ * sinX, cosY * cosX,  0,
    0,                                0,                                0,            1,
  ])
}
function SetRotation(program, matrix){
  const uRotation = gl.getUniformLocation(program, "uRotation")
  gl.uniformMatrix4fv(uRotation, false, matrix);
}

// Vertex shader code
const vertexShaderSrc = `${GL_VERSION}
in vec3 aPosition;
in vec3 aColor;

uniform mat4 uRotation;

out vec3 vColor;

void main(){
  vColor = aColor;
  gl_Position = uRotation * vec4(aPosition, 1.0);
}
`

// Fragment shader code
const fragmentShaderSrc = `${GL_VERSION}
precision mediump float;
out vec4 fragColor;

in vec3 vColor;

void main(){
  fragColor = vec4(vColor, 1.0);
}
`

// Create buffer for vertices
const vertexBuffer = CreateFBuffer(vertices)
const colorBuffer  = CreateFBuffer(colors)

// Compile shaders into program
const shaderProgram = gl.createProgram()
console.log("Compiling vertex shader")
gl.attachShader(shaderProgram, compileShader(vertexShaderSrc, gl.VERTEX_SHADER))
console.log("Compiling fragment shader")
gl.attachShader(shaderProgram, compileShader(fragmentShaderSrc, gl.FRAGMENT_SHADER))
gl.linkProgram(shaderProgram)
gl.useProgram(shaderProgram)

SetBufferAtribute(shaderProgram, "aPosition", vertexBuffer)
SetBufferAtribute(shaderProgram, "aColor", colorBuffer)

gl.clearColor(backgroundColor.r, backgroundColor.g, backgroundColor.b, 1.0)
gl.enable(gl.DEPTH_TEST)

let lastTime = performance.now()
let x = 0, y = 0, z = 0
let rotationSpeed = 1.0
function main(time){
  const deltaTime = time - lastTime
  lastTime = time

  if(!rotateByMouse){
    x += deltaTime / 3000 * rotationSpeed
    y += deltaTime / 800  * rotationSpeed
    z += deltaTime / 2300 * rotationSpeed
  }

  rMatrix = MakeMatrixFromRotation(x, y, z)
  SetRotation(shaderProgram, rMatrix)

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length/3)

  requestAnimationFrame(main)
}

function OnMouseEvent(event){
  if(!rotateByMouse) return

  y += event.movementX / 700 * rotationSpeed
  x += event.movementY / 700 * rotationSpeed
}
window.addEventListener("mousemove", OnMouseEvent)

function ChangeDepthTesting(){
  const dtCheckBox = document.querySelector("#depthTesting")
  if(dtCheckBox.checked)
    gl.enable(gl.DEPTH_TEST)
  else
    gl.disable(gl.DEPTH_TEST)
}

function ChangeRotationSpeed(){
  const rsRange = document.querySelector("#rotationSpeed")
  rotationSpeed = rsRange.value
}

requestAnimationFrame(main)