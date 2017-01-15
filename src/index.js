import createProgram from './webgl-wrapper';

console.log('🐭');

const vertexSource = `
	precision highp float;
	attribute vec3 aPosition;
	varying vec2 vTexturePosition;
	varying vec2 vPosition;
	void main(void) {
		vPosition = aPosition.xy;
		vTexturePosition = vec2(aPosition.x + 1.0, -1.0 + aPosition.y) * 0.5;
		gl_Position = vec4(aPosition, 1.0);
	}
`;

const fragmentSource = `
	precision highp float;
	uniform sampler2D uSampler;
	varying vec2 vTexturePosition;
	varying vec2 vPosition;
	uniform vec2 uMousePosition;
	uniform highp float uWidth;

	bool isLive(vec2 offset) {
			vec4 lastColor = texture2D(uSampler, vTexturePosition + offset);
			if (lastColor.r == 0.0) {
				return true;
			} else {
				return false;
			}
	}

	void main(void) {
		float saturation = 1.0 - distance(uMousePosition, vPosition);
		int liveCount = 0;
		float step = 1.0/uWidth;
		// step = 0.0;

		if (isLive(vec2(-step, -step))) {liveCount++;}
		if (isLive(vec2(-step, 0))) {liveCount++;}
		if (isLive(vec2(-step, step))) {liveCount++;}
		if (isLive(vec2(0, -step))) {liveCount++;}
		if (isLive(vec2(0, step))) {liveCount++;}
		if (isLive(vec2(step, -step))) {liveCount++;}
		if (isLive(vec2(step, 0))) {liveCount++;}
		if (isLive(vec2(step, step))) {liveCount++;}

		if (liveCount < 2) {
			gl_FragColor = vec4(1.0, 0, 0, 1.0);
		} else if (liveCount < 4) {
			gl_FragColor = vec4(0, 1.0, 0, 1.0);
		} else if (liveCount < 8) {
			gl_FragColor = vec4(0, 0, 1.0, 1.0);
		} else {
			gl_FragColor = vec4(1.0, 0, 1.0, 1.0);
		}
		// gl_FragColor = vec4(0, 0, 0, 1.0);
		bool selfIsLive = isLive(vec2(0,0));
		if (selfIsLive && (liveCount == 2 || liveCount == 3)) {
			gl_FragColor = vec4(0, 0, 0, 1.0);
		} else if (!selfIsLive && (liveCount == 3)) {
			gl_FragColor = vec4(0, 0, 0, 1.0);
		} else {
			gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
		}

		// gl_FragColor = texture2D(uSampler, vTexturePosition);
		// gl_FragColor = vec4(lastColor.r + saturation, lastColor.gba);
		// gl_FragColor = vec4(saturation, 0, 0, 1.0);
	}
`;

createProgram(vertexSource, fragmentSource, (gl, shaderProgram) => {
	console.log(gl.canvas);

	// INITIALIZE BUFFERS
	const vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	const vertices = [
		1, 1, 0,
		-1, 1, 0,
		1, -1, 0,
		-1, -1, 0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	// END INITIALIZE BUFFERS

	// POINTERS
	const aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
	gl.enableVertexAttribArray(aPosition);
	//gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
	gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

	const uSampler = gl.getUniformLocation(shaderProgram, "uSampler");
	const uWidth = gl.getUniformLocation(shaderProgram, "uWidth");
	const uMousePosition = gl.getUniformLocation(shaderProgram, "uMousePosition");
	const tTexture0 = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tTexture0);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

	const tTexture1 = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tTexture1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

	const frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	frameBuffer.width = gl.canvas.width;
	frameBuffer.height = gl.canvas.height;
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, frameBuffer.width, frameBuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	var renderBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, frameBuffer.width, frameBuffer.height);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);


	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);



	// END POINTERS

	// INTERACTION HANDLER
	var mousePosition = [];
	gl.canvas.addEventListener('mousemove', evt => {
	  mousePosition = [
	    (evt.clientX/gl.canvas.width - 0.5) * 2.0,
	    (1.0 - evt.clientY/gl.canvas.height - 0.5) * 2.0
	  ];
		// draw();
	});
	// END INTERACTION HANDLER

	// DRAW LOOP
	gl.clearColor(0, 0, 0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	//Initial state
	const initialCanvas = document.createElement('canvas');
	initialCanvas.width = gl.canvas.width;
	initialCanvas.height = gl.canvas.height;
	const context = initialCanvas.getContext('2d');
	context.globalAlpha = 1.0;
	for (var i = 0; i < gl.canvas.width; i++) {
		for (var j = 0; j < gl.canvas.width; j++) {
			if (Math.random() < 0.35) {
				context.fillStyle = 'black';
				context.fillRect(i, j, 1, 1);
			} else {
				context.fillStyle = 'white';
				context.fillRect(i, j, 1, 1);
			}
		}
	}
	gl.bindTexture(gl.TEXTURE_2D, tTexture0);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, initialCanvas);
	gl.bindTexture(gl.TEXTURE_2D, null);

	gl.uniform1f(uWidth, gl.canvas.width);

	let flip = 0;

	function draw() {
	  // Clear pixels and depth
		// console.log('Draw');

		// gl.bindTexture(gl.TEXTURE_2D, tTexture);
		// gl.generateMipmap(gl.TEXTURE_2D);

		gl.uniform2f(uMousePosition, mousePosition[0], mousePosition[1]);

		//Draw to frame buffer
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
		if (flip == 0) {
			gl.bindTexture(gl.TEXTURE_2D, tTexture0);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tTexture1, 0);
		} else {
			gl.bindTexture(gl.TEXTURE_2D, tTexture1);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tTexture0, 0);
		}

	  gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / 3);

		//Draw to canvas
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	  gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / 3);

		flip = (flip + 1) % 2;
		gl.bindTexture(gl.TEXTURE_2D, null);

		// setTimeout(draw, 1000);
	  requestAnimationFrame(draw);
	}
	requestAnimationFrame(draw);
	// END DRAW LOOP
});
