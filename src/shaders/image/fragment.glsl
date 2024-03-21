uniform float uTime;
uniform vec2 uMouse;
uniform sampler2D uTexture;
uniform vec2 uResolution;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

#define PI 3.1415926535897932384626433832795

void main() {
	vec2 uv = vUv;

    // float waveY1 = sin(uv.x * 5.0 + uTime * 0.2 + uMouse.x * 10.2) * 0.05;
    // float waveY2 = sin(uv.y * 6.0 + uTime * 0.3 + uMouse.y * 10.2) * 0.05;
    // float waveX1 = cos(uv.x * 5.0 + uTime * 0.2 + uMouse.x * 10.2) * 0.05;
    // float waveX2 = cos(uv.y * 6.0 + uTime * 0.3 + uMouse.y * 10.2) * 0.05;

	// uv.y += waveY1 + waveY2;
	// uv.x += waveX1 + waveX2;

	// gl_FragColor = texture2D(uTexture, uv);


    gl_FragColor = vec4(texture2D(uTexture, uv));

}
