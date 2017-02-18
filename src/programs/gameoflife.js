const GameOfLife = {
	vertexSource: `
		precision highp float;
		attribute vec3 aPosition;
		varying vec2 vTexturePosition;
		varying vec2 vPosition;
		void main(void) {
			vPosition = aPosition.xy;
			vTexturePosition = vec2(aPosition.x + 1.0, -1.0 + aPosition.y) * 0.5;
			gl_Position = vec4(aPosition, 1.0);
		}
	`,

	fragmentSource: `
		precision highp float;
		uniform sampler2D uSampler;
		varying vec2 vTexturePosition;
		varying vec2 vPosition;
		uniform vec2 uMousePosition;
		uniform highp float uWidth;
		uniform int uShouldUpdate;

		bool isLive(vec2 offset) {
				vec4 lastColor = texture2D(uSampler, vTexturePosition + offset);
				if (lastColor.r == 1.0) {
					return true;
				} else {
					return false;
				}
		}

		void main(void) {
			vec4 lastColor = texture2D(uSampler, vTexturePosition);

			if (uShouldUpdate == 0) {
				gl_FragColor = lastColor;
				return;
			}

			float d = distance(uMousePosition, vPosition);
			if (d < 2.0/uWidth) {
				gl_FragColor = vec4(1.0, 0, 0, 1.0);
				return;
			}

			int liveCount = 0;
			float step = 1.0/uWidth;

			if (isLive(vec2(-step, -step))) {liveCount++;}
			if (isLive(vec2(-step, 0))) {liveCount++;}
			if (isLive(vec2(-step, step))) {liveCount++;}
			if (isLive(vec2(0, -step))) {liveCount++;}
			if (isLive(vec2(0, step))) {liveCount++;}
			if (isLive(vec2(step, -step))) {liveCount++;}
			if (isLive(vec2(step, 0))) {liveCount++;}
			if (isLive(vec2(step, step))) {liveCount++;}

			// if (liveCount < 2) {
			// 	gl_FragColor = vec4(1.0, 0, 0, 1.0);
			// } else if (liveCount < 4) {
			// 	gl_FragColor = vec4(0, 1.0, 0, 1.0);
			// } else if (liveCount < 8) {
			// 	gl_FragColor = vec4(0, 0, 1.0, 1.0);
			// } else {
			// 	gl_FragColor = vec4(1.0, 0, 1.0, 1.0);
			// }

			bool selfIsLive = isLive(vec2(0,0));
			if (selfIsLive && (liveCount == 2 || liveCount == 3)) {
				if (lastColor.g < 1.0) {
					gl_FragColor = lastColor + vec4(1.0, 0.01, 0.0, 1.0);
				} else {
					gl_FragColor = lastColor + vec4(1.0, 0.0, 0.01, 1.0);
				}
			} else if (!selfIsLive && (liveCount == 3)) {
				gl_FragColor = vec4(1.0, 0, 0, 1.0);
			} else {
				gl_FragColor = vec4(0.0, 0.0, 0.0, 0.8);
			}
		}
	`
};
export default GameOfLife;
