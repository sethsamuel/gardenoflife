const Identity2D = {
	vertexSource: `#version 300 es
		precision highp float;
		in vec3 aPosition;
		out vec2 vTexturePosition;
		out vec2 vPosition;
		void main(void) {
			vPosition = aPosition.xy;
			vTexturePosition = vec2(aPosition.x + 1.0, -1.0 + aPosition.y) * 0.5;
			gl_Position = vec4(aPosition, 1.0);
		}
	`
};

export default Identity2D;
