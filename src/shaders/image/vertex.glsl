uniform float uTime;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
uniform vec2 uMouse;
uniform float uProgress;
uniform sampler2D uTexture;

void main() {
	vec3 vPosition = position;
	vNormal = normal;
	vUv = uv;

	// float waveX = position.x + sin(uv.x * 1.0 + uTime);
	// float waveY = position.y + sin(uv.y * 1.0 + uTime);
	float distanceX = length(vUv.x - vec2(0.5));
	float distanceY = length(vUv.y - vec2(0.5));

	// vPosition.z = sin(distanceX * 10.0 + 1.0 * uTime) * 0.1;
	// vPosition.x = (position.x) + exp(position.x * distanceX);
	// vPosition.y = sin(distanceY * 10.) * 0.1;

	vPosition.y = fract(vUv.y) +  1. / exp(vUv.x *  (8.1 * uProgress) + 2.9 * uProgress) - 0.5;
	// vPosition.y = fract(vUv.y) +  sin(vUv.x * 3.) - 1.0;
	vPosition.x = vUv.x * 1.5 - 2.5 / exp(vUv.y * (5.1 * uProgress) + 2.9 * uProgress);

	vec4 modelViewPosition = modelViewMatrix * vec4( vPosition, 1.0 );
	vec4 projectedPosition = projectionMatrix * modelViewPosition;
	gl_Position = projectedPosition;
}

// const videoVert = `#define GLSLIFY 1
// uniform vec3 u_position;
// uniform vec4 u_quaternion;
// uniform vec3 u_scale;
// uniform vec2 u_domXYFrom;
// uniform vec2 u_domWHFrom;
// uniform vec2 u_domXY;
// uniform vec2 u_domWH;
// uniform vec2 u_domPivot;
// uniform vec4 u_domPadding;
// uniform float u_showRatio;
// varying vec2 v_uv;
// varying vec2 v_domWH;
// varying float v_showRatio;
// varying float v_deltaRatio;
// vec3 qrotate(vec4 q,vec3 v){
// 	return v+2.*cross(q.xyz,cross(q.xyz,v)+q.w*v);
// }
// vec3 getBasePosition(in vec3 pos,in vec2 domWH){
// 	vec3 basePos=vec3((pos.xy)*domWH-u_domPivot,pos.z);
// 	basePos.xy+=mix(-u_domPadding.xz,u_domPadding.yw,pos.xy);
// 	return basePos;
// }
// float linearStep(float edge0,float edge1,float x){
// 	return clamp((x-edge0)/(edge1-edge0),0.0,1.0);
// }	
// vec3 getScreenPosition(in vec3 basePos,in vec2 domXY){
// 	vec3 screenPos=qrotate(u_quaternion,basePos*u_scale)+vec3(u_domPivot.xy,0.);
// 	screenPos=(screenPos+vec3(domXY,0.)+u_position)*vec3(1.,-1.,1.);
// 	return screenPos;
// }
// float cubicBezier(float p0,float p1,float p2,float p3,float t){
// 	float c=(p1-p0)*3.;
// 	float b=(p2-p1)*3.-c;
// 	float a=p3-p0-c-b;
// 	float t2=t*t;
// 	float t3=t2*t;
// 	return a*t3+b*t2+c*t+p0;
// }
// float easeOutBack(float t){
// 	return cubicBezier(0.,1.3,1.1,1.,t);
// }
// void main(){
// 	float placementWeight=1.-(pow(position.x*position.x,0.75)+pow(1.-position.y,1.5))/2.;
// 	v_showRatio=(smoothstep(placementWeight*0.3,0.7+placementWeight*0.3,u_showRatio));
// 	vec2 domXY=mix(u_domXYFrom,u_domXY,v_showRatio);
// 	vec2 domWH=mix(u_domWHFrom,u_domWH,v_showRatio);
// 	domXY.x+=mix(domWH.x,0.,cos(v_showRatio*3.1415926*2.)*0.5+0.5)*0.1;
// 	vec3 basePos=getBasePosition(position,domWH);
// 	float rot=(smoothstep(0.,1.,v_showRatio)-v_showRatio)*-0.5;
// 	vec3 rotBasePos=qrotate(vec4(0.,0.,sin(rot),cos(rot)),basePos);
// 	vec3 screenPos=getScreenPosition(rotBasePos,domXY);
// 	gl_Position=projectionMatrix*modelViewMatrix*vec4(screenPos,1.0);
// 	v_uv=vec2(uv.x,1.-uv.y);
// 	v_domWH=domWH;
// }`
// videoFrag = `#define GLSLIFY 1
// uniform sampler2D u_screenPaintTexture;
// uniform vec2 u_resolution;
// uniform vec3 u_color;
// uniform sampler2D u_texture;
// uniform vec2 u_textureSize;
// uniform float u_time;
// uniform vec2 u_radialCenter;
// uniform float u_showRatio;
// uniform float u_globalRadius;
// uniform float u_aspectScale;
// varying vec2 v_uv;
// varying vec2 v_domWH;
// varying float v_showRatio;
// #include <getBlueNoise>
// float linearStep(float edge0,float edge1,float x){
// 	return clamp((x-edge0)/(edge1-edge0),0.0,1.0);
// }
// float sdRoundedBox(in vec2 p,in vec2 b,in float r){
// 	vec2 q=abs(p)-b+r;
// 	return min(max(q.x,q.y),0.0)+length(max(q,0.0))-r;
// }
// float getRoundedCornerMask(vec2 uv,vec2 size,float radius,float ratio){
// 	vec2 halfSize=size*0.5;
// 	float maxDist=length(halfSize);
// 	float minSize=min(halfSize.x,halfSize.y);
// 	float maxSize=max(halfSize.x,halfSize.y);
// 	float t=ratio*maxDist;radius=mix(minSize*linearStep(0.,minSize,t),radius,linearStep(maxSize,maxDist,t));
// 	halfSize=min(halfSize,vec2(t));
// 	float d=sdRoundedBox((uv-.5)*v_domWH,halfSize,radius);
// 	return smoothstep(0.,0.-fwidth(d),d);
// }
// void main(){
// 	vec3 noise=getBlueNoise(gl_FragCoord.xy+vec2(6.,25.));
// 	float imageAlpha=getRoundedCornerMask(v_uv,v_domWH,u_globalRadius,1.0);
// 	vec2 baseUv=v_uv;
// 	float toRadialCenterDist=length((baseUv-u_radialCenter)*vec2(v_domWH.x/v_domWH.y,1.));
// 	baseUv.y=(baseUv.y-.5)*mix(1.,u_aspectScale,v_showRatio)+0.5;
// 	vec3 color=texture2D(u_texture,baseUv).rgb;
// 	vec3 tintedColor=max(u_color,vec3(dot(color,vec3(0.299,0.587,0.114))));
// 	gl_FragColor=vec4(mix(tintedColor,color,v_showRatio),imageAlpha);
// }
  