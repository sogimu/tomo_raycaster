/*
	Copyright 2011 Vicomtech

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

#ifdef GL_ES
precision highp float;
#endif

varying vec4 frontColor;
varying vec4 pos;

uniform sampler2D uBackCoord;
uniform sampler2D uVolData;
uniform sampler2D uTransferFunction;

uniform float uNumberOfSlices;
uniform float uMinGray;
uniform float uMaxGray;
uniform float uOpacityVal;
uniform float uColorVal;
uniform float uSlicesOverX;
uniform float uSlicesOverY;
uniform float uSteps;

// const float steps = 195.0;

float getVolumeValue(vec3 volpos)
{
	float s1,s2, s3;
	float dx1,dy1;
	float dx2,dy2;
	float dx3,dy3;

	vec2 texpos1,texpos2,texpos3,texpos4,texpos5,texpos6;

	s1 = floor(volpos.z*uNumberOfSlices);
	s2 = s1+1.0;
	// s3 = s1+2.0;

	dx1 = fract(s1/uSlicesOverX);
	dy1 = floor(s1/uSlicesOverY)/uSlicesOverY;

	dx2 = fract(s2/uSlicesOverX);
	dy2 = floor(s2/uSlicesOverY)/uSlicesOverY;

	// dx3 = fract(s3/uSlicesOverX);
	// dy3 = floor(s3/uSlicesOverY)/uSlicesOverY;
	
	texpos1.x = dx1+(volpos.x/uSlicesOverX);
	texpos1.y = dy1+(volpos.y/uSlicesOverY);

	const float one_pix_delata = 0.00390625; //1.0 / (4096.0 / uSlicesOverX)

	texpos2.x = texpos1.x - one_pix_delata;
	texpos2.y = texpos1.y;

	texpos3.x = texpos1.x  + one_pix_delata;
	texpos3.y = texpos1.y;

	texpos4.x = texpos1.x;
	texpos4.y = texpos1.y - one_pix_delata;

	texpos5.x = texpos1.x;
	texpos5.y = texpos1.y + one_pix_delata;

	texpos6.x = dx2+(volpos.x/uSlicesOverX);
	texpos6.y = dy2+(volpos.y/uSlicesOverY);

	// texpos2.x = dx2+(volpos.x/uSlicesOverX);
	// texpos2.y = dy2+(volpos.y/uSlicesOverY);

	// texpos3.x = dx3+(volpos.x/uSlicesOverX);
	// texpos3.y = dy3+(volpos.y/uSlicesOverY);

	float sx1 = texture2D(uVolData,texpos1).x;
	float sx2 = texture2D(uVolData,texpos2).x;
	float sx3 = texture2D(uVolData,texpos3).x;
	float sx4 = texture2D(uVolData,texpos4).x;
	float sx5 = texture2D(uVolData,texpos5).x;
	float sx6 = texture2D(uVolData,texpos6).x;

	float res = 0.0;

	res = mix(sx1, sx2, one_pix_delata);
	res = mix(res, sx3, one_pix_delata);
	res = mix(res, sx4, one_pix_delata);
	res = mix(res, sx5, one_pix_delata);
	res = mix(res, sx6, fract(volpos.z*uNumberOfSlices));

	// float sx2 = texture2D(uVolData,texpos2).x;
	// float sx3 = texture2D(uVolData,texpos3).x;

	// return mix( texture2D(uVolData,texpos1).x, texture2D(uVolData,texpos2).x, fract(volpos.z*uNumberOfSlices));
	return res;
}

void main(void)
{
	vec2 texC = ((pos.xy/pos.w) + 1.0) / 2.0;
	// texC.x = 0.5*texC.x + 0.5;
	// texC.y = 0.5*texC.y + 0.5;

	vec4 backColor = texture2D(uBackCoord,texC);

	vec3 dir = backColor.rgb - frontColor.rgb;
	vec4 vpos = frontColor;
  
  	float cont = 0.0;

	vec3 Step = dir/uSteps;

	vec4 accum = vec4(0, 0, 0, 0);
	vec4 sample = vec4(0.0, 0.0, 0.0, 0.0);
 	vec4 value = vec4(0, 0, 0, 0);

	// float opacityFactor = 70.0;
	float opacityFactor = uOpacityVal;
	float lightFactor = uColorVal;

	// const 999 - only how example big number
	// It because expression i < uSteps impossible
	for(float i = 0.0; i < 999.0; i+=1.0)
	{
	// It because expression i < uSteps impossible
		if(i == uSteps) {
			break;
		}

		vec2 tf_pos;

		tf_pos.x = getVolumeValue(vpos.xyz);
		tf_pos.y = 0.5;
		
		value = texture2D(uTransferFunction,tf_pos);
		// value = vec4(tf_pos.x);

		if(value.x < 0.1 || value.x > uMaxGray || value.a < 0.15) {
		    value = vec4(0.0);
		}

		// Process the volume sample
		// sample = value * opacityFactor;
		// sample.rgb = value.rgb * lightFactor;
		value.a *= opacityFactor;
		value.grb = value.grb * lightFactor;
		accum += value;
		// accum.a += sample.a;

		//advance the current position
		vpos.xyz += Step;

		//break if the position is greater than <1, 1, 1>
		if(accum.a>=0.95)
			break;


	}

	gl_FragColor = accum;

}

