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
	void main(void) {
		float saturation = 1.0 - distance(uMousePosition, vPosition);
		vec4 lastColor = texture2D(uSampler, vTexturePosition + vec2(0.01, 0.01));
		gl_FragColor = lastColor;
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
	gl.clearColor(0, 1, 0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	//Initial state
	const initialCanvas = document.createElement('canvas');
	initialCanvas.width = gl.canvas.width;
	initialCanvas.height = gl.canvas.height;
	const context = initialCanvas.getContext('2d');
	context.fillRect(0, 0, 64, 64);
	gl.bindTexture(gl.TEXTURE_2D, tTexture0);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, initialCanvas);
	gl.bindTexture(gl.TEXTURE_2D, null);

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
