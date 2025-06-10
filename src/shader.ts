// Simple fullscreen vertex shader (GLSL)
export const vertexShader = `
  precision highp float;
  // Attributes
  attribute vec3 position;
  attribute vec2 uv;
  // Uniforms
  uniform mat4 worldViewProjection;
  // Varyings
  varying vec2 vUV;
  void main(void) {
    vUV = uv;
    gl_Position = worldViewProjection * vec4(position, 1.0);
  }
`;

// Simple fullscreen fragment shader (GLSL)
export const fragmentShader = `
  precision highp float;
  varying vec2 vUV;
  uniform float iTime;
  void main(void) {
    vec2 uv = vUV;
    vec3 color = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    gl_FragColor = vec4(color,1.0);
  }
`;


export const fragmentShader2 = `
precision highp float;

varying vec2 vUV;

uniform vec2 iMouse;

uniform float uAlpha;
uniform float uBeta;
uniform float uGamma;
uniform float uAspect;

const int MAX_STEPS = 70;
const float MAX_DIST = 1000.0;
const float MIN_DIST = 0.0001;

const vec3 spPos = vec3(0, 0, 0);
const float spRad = 0.5;

float sensitivity = 3.;

float Scale = 1.5;
vec3 Offset = vec3(-1, -0.1, -0.5);

mat3 rot;

int uIters = 10;
float uRadius = 0.02;
float uZoom = 2.0;

vec4 getDist(vec3 z)
{
	float totalScale = 1.0;
	
	vec3 orbit = vec3(0);
	
	//z = abs(mod(z, 10.0) - 5.0);
	
	float d = 0.0;
	
	for (int i = 0; i < uIters; i++)
	{
		z = abs(z);
		z *= Scale;
		z += Offset;
		
		totalScale *= Scale;
		z = rot * z;
		
		orbit += z * 0.1;
		//orbit = max(z, orbit);
		//orbit = min(z, orbit);
	}
	
	
	//d = max(z.x, max(z.y, z.z));
	d = length(z);
	
	float dist = d / totalScale - uRadius;
	//float dist = length(z) / totalScale - uRadius;
	
	return vec4(dist, orbit);
}


vec4 getDist2(vec3 p) {
	
	p = abs(mod(p, 2.0) - 1.0);
	
	return vec4(max(p.x, max(p.y, p.z)) - 0.3, vec3(0.3));
}


vec4 rayMarch(vec3 ro, vec3 rd, int samples, out int it)
{
	float dO = 0.0;
	
	vec3 col;
	
	bool flag = false;
	for (int i = 0; i < samples; i++)
	{
		vec3 p = ro + rd * dO;
		vec4 d_col = getDist(p);
		col = d_col.yzw;
		float ds = d_col.x;
		dO += ds;
		if (dO > MAX_DIST || ds < MIN_DIST) {
			it = i;
			flag = true;
			break;
		}
	}
	if (!flag)
		it = samples;

	return vec4(dO, col);
}

//vec3 getNormal(vec3 p)
//{
//	const float e = 0.005;
//	float d = getDist(p);
//	vec3 v = d - vec3(
//		getDist(vec3(p.x - e,	p.y,		p.z)),
//		getDist(vec3(p.x,		p.y - e,	p.z)),
//		getDist(vec3(p.x,		p.y,		p.z - e))
//	);
//	return normalize(v);
//}
/*
float getLight(vec3 p)
{
	vec3 lightPos = vec3(0, 4, 5) + vec3(cos(iTime), 0, sin(iTime)) * 2.0;
	vec3 lv = normalize(vec3(-1, 1, -1));
	vec3 norm = getNormal(p);

	float res = max(0.0, dot(lv, norm));

	float d = 0;//rayMarch(p + norm * MIN_DIST * 2.0, lv, 500);
	float td = length(lightPos - p);
	if (d < td)
		res *= d/td;

	return res;
}*/

mat3 rotationY( in float angle ) {
	return mat3(	cos(angle),		0,		sin(angle),
							0,		1.0,			 0,
					-sin(angle),	0,		cos(angle));
}

mat3 rotationX( in float angle ) {
	return mat3(	1.0,		0,			0,
					0, 	cos(angle),	-sin(angle),
					0, 	sin(angle),	 cos(angle));
}


mat3 rotationZ( in float angle ) {
	return mat3(	cos(angle),		-sin(angle),	0,
			 		sin(angle),		cos(angle),		0,
							0,				0,		1);
}


// vec2 iResolution = vec2(800.0, 600.0);

vec4 color()
{
	vec2 uv = vUV * 2.0 - 1.0;
    uv.y /= uAspect;
	vec2 mpos = iMouse.xy;

	mat3 rotY = rotationY(-mpos.x * sensitivity);
	mat3 rotX = rotationX(mpos.y * sensitivity);

	vec3 ro = rotY * rotX * vec3(0, 0, -5.5);
	vec3 rd = rotY * rotX * normalize(vec3(uv.x, uv.y, uZoom));

	rot = mat3(1);
	rot = rotationX(uAlpha) * rot;
	rot = rotationY(uBeta) * rot;
	rot = rotationZ(uGamma) * rot;

	int it = 0;
	vec4 d_col = rayMarch(ro, rd, MAX_STEPS, it);
	float d = d_col.x;
	vec3 p = ro + rd * d;
	
	vec3 col = vec3(0.1);
	if (d < MAX_DIST)
		col = clamp(d_col.yzw, 0.0, 1.0);
	
	float c = 1.0 - float(it) / float(MAX_STEPS);
	if (it == 0)
		c = 0.0;
	
	col *= c;
//
//	vec3 col = vec3(c);
	//col = getNormal(p);
	return vec4(col, 1.0);
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    fragColor = color();
}

void main(void) {
    gl_FragColor = color();
}
`