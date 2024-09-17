// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.

	//to make it rotate with the mouse pointer
	rotationX = -rotationX;
	rotationY = -rotationY;

	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	// Define the rotation matrix around the X-axis
	var rotationXMatrix = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), -Math.sin(rotationX), 0,
		0, Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];

	// Define the rotation matrix around the Y-axis
	var rotationYMatrix = [
		Math.cos(rotationY), 0, Math.sin(rotationY), 0,
		0, 1, 0, 0,
		-Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];

	var rotationMatrix = MatrixMult(rotationYMatrix, rotationXMatrix);
	var ModelViewMatrix = MatrixMult(trans, rotationMatrix);
	var mvp = MatrixMult( projectionMatrix, ModelViewMatrix );
	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations

		this.prog = InitShaderProgram( meshVS, meshFS );

		//These locations are used to link JavaScript data with GLSL (shader) variables-->

		//Attributes pos for vertex positions and txc for texture coordinates
		this.pos = gl.getAttribLocation( this.prog, 'pos' );
		this.txc = gl.getAttribLocation( this.prog, 'txc' );

		//uniforms mvp for the model-view-projection matrix
		this.mvp = gl.getUniformLocation( this.prog, 'mvp' );

		//show for toggling texture display, and swap for axis swapping locations
		this.show = gl.getUniformLocation(this.prog, 'show');
		this.swap = gl.getUniformLocation(this.prog, 'swap');

		//create texture and the sampler for fragment shader
		this.mytex = gl.createTexture();
		this.sampler = gl.getUniformLocation( this.prog, 'tex' );

		this.showCheckBox = true;
		this.textureInserted = false;
		gl.useProgram(this.prog);
		gl.uniform1i(this.show, false);
		gl.uniform1i(this.swap, false);


		//initializing buffers
		this.vertBuffer = gl.createBuffer();
		this.txtBuffer=gl.createBuffer();


	}

	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;
		gl.useProgram( this.prog );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.txtBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW );


	}

	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox.
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader

		gl.useProgram(this.prog);
		gl.uniform1f(this.swap, swap);
	}

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		// [TO-DO] Complete the WebGL initializations before drawing

		//useProgram set the shader program just done to draw. Is linked in the constructor
		gl.useProgram(this.prog);

		//load the Model-View-Projection matrix to the mvp
		gl.uniformMatrix4fv(this.mvp, false, trans);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.pos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.txtBuffer);
		gl.vertexAttribPointer(this.txc, 2, gl.FLOAT, false, 0 ,0);
		gl.enableVertexAttribArray(this.txc);

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		//activate the Texture Unit 0
		gl.useProgram(this.prog);
		gl.activeTexture(gl.TEXTURE0);
		// Bind the previously created texture object to GL_TEXTURE_2D
		gl.bindTexture(gl.TEXTURE_2D, this.mytex);

		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		// Generate mipmap for the texture, which are smaller versions of the texture
		gl.generateMipmap(gl.TEXTURE_2D);

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

		// Retrieve and enable anisotropic filtering if supported
		var ext = gl.getExtension('EXT_texture_filter_anisotropic') ||
			gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
			gl.getExtension('MOZ_EXT_texture_filter_anisotropic');

		if (ext) {
			var maxAnisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
			gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, maxAnisotropy);
		}

		//associate the sampler to the Texture Unite I choose
		gl.useProgram(this.prog);
		gl.uniform1i(this.sampler,0);

		this.textureInserted = true;
		gl.uniform1i(this.show, this.showCheckBox && this.textureInserted);


	}

	// This method is called when the user changes the state of the
	// "Show Texture" checkbox.
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		this.showCheckBox = show;
		gl.useProgram(this.prog);
		gl.uniform1i(this.show, this.showCheckBox && this.textureInserted);
	}

}

/* uniforms are parameters that remain constant during execution of the shader for all vertices
* swap determines if the Y and Z axes should be swapped
* mvp is The matrix that transforms vertex positions from 3D space to 2D screen space
*
* attributes are for each vertex data passed into vertex shader
* pos is the position of the vertex
* txc are the coordinates of the vertex
*
* varying is used to pass data from the vertex shader to the fragment shader
* texCoordinates passes the texture coordinates
*
* boolean swap is used there to determines the final position of the vertex.
* If swap is false, it directly applies the mvp matrix*/

var meshVS = `
	
	uniform bool swap;
	uniform mat4 mvp;
	
	attribute vec3 pos;
	attribute vec2 txc;
	
	varying vec2 texCoordinates;
	
	void main() {
    if ( !swap )
        gl_Position = mvp * vec4(pos, 1);
    else {
        gl_Position = mvp * mat4(
            1.0, 0.0, 0.0, 0.0,
            0.0, 0.0, -1.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ) * vec4(pos, 1);
    }
    texCoordinates = txc;
}
`;

/* precision specifying the precision for floating-point calculation
*
* show determines whether to apply texture or not
* tex is the texture sampler that accesses the texture data
*
* texcoordinates receive the data from vertex shader
* gl_FragColor Decides the color of the pixel. If show is true,
* it colors the pixel based on the texture data at the given texture coordinates (texCoordinates).
* If false, it sets the pixel to a color decided by the project admin (vec4(0, 0, 1, 1))*/

var meshFS = `
precision mediump float;
uniform bool show;
uniform sampler2D tex;
varying vec2 texCoordinates;
void main() {
	if ( show )
		gl_FragColor = texture2D( tex, texCoordinates );
	else
		gl_FragColor = vec4(1,gl_FragCoord.z*gl_FragCoord.z,0,1);
}
`;