// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	//git trial
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
	var mv = MatrixMult(trans, rotationMatrix);
	return mv;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		// [TO-DO] initializations

		this.prog = InitShaderProgram( meshVS, meshFS );

		//These locations are used to link JavaScript data with GLSL (shader) variables-->

		//New attributes for this project
		//norm is for normal vertex position
		this.norm =gl.getAttribLocation(this.prog, 'norm');
		this.normalMatrix = gl.getUniformLocation(this.prog, 'normalMatrix');
		this.modelViewMatrix = gl.getUniformLocation(this.prog, 'modelViewMatrix');
		this.lightPos = gl.getUniformLocation(this.prog, 'lightPos');
		this.shininess = gl.getUniformLocation(this.prog, 'shininess');

		//initializing buffer for normals elements
		this.normBuffer = gl.createBuffer();

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
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;
		gl.useProgram( this.prog );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.txtBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW );

		//new project binding
		gl.bindBuffer( gl.ARRAY_BUFFER, this.normBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW );

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
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram(this.prog);

		// Set matrices
		gl.uniformMatrix4fv(this.mvp, false, matrixMVP);
		gl.uniformMatrix4fv(this.modelViewMatrix, false, matrixMV);
		gl.uniformMatrix3fv(this.normalMatrix, false, matrixNormal);

		// Enable and bind vertex position attribute
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.pos);

		// Enable and bind texture coordinate attribute
		gl.bindBuffer(gl.ARRAY_BUFFER, this.txtBuffer);
		gl.vertexAttribPointer(this.txc, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.txc);

		// Enable and bind normal attribute
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
		gl.vertexAttribPointer(this.norm, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.norm);


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
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.prog);
		gl.uniform3f(this.lightPos, x, y, z);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram(this.prog);
		gl.uniform1f(this.shininess, shininess);
	}
}


var meshVS = `


	
// Uniforms are global variables set from WebGL that don't change

uniform bool swap;  // Toggle Y-Z axis swapping
uniform mat4 mvp;  // Model-View-Projection matrix for vertex transformation
uniform mat4 modelViewMatrix;  // Model-View matrix for transforming vertices to view space
uniform mat3 normalMatrix;  // Used for transforming normals to view space

// Attributes are for each vertex variables read from vertex buffers

attribute vec3 pos;  // Vertex position
attribute vec2 txc;  // Texture coordinates
attribute vec3 norm;  // Normal vector

// Varyings are variables passed from vertex to fragment shader, interpolated across triangle

varying vec2 texCoordinates;  //  Texture coordinates for the fragment shader
varying vec3 normCoordinates;  //  Normals coordinates
varying vec3 vertPos;  //  Vertex position in view space 

	
	const mat4 swapMatrix = mat4(
            1.0, 0.0, 0.0, 0.0,
            0.0, 0.0, -1.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        );
	
	void main() {
    if ( !swap ){
        normCoordinates = normalize(normalMatrix * norm);
    	vertPos = vec3(modelViewMatrix * vec4(pos, 1.0));
    	gl_Position = mvp * vec4(pos, 1);}
    else {
    	normCoordinates = normalize(normalMatrix * mat3(swapMatrix) * norm);
    	vertPos = vec3(mvp * swapMatrix * vec4(pos, 1.0));
        gl_Position = mvp * swapMatrix * vec4(pos, 1.0);
    }
  
    texCoordinates = txc;
}
`;


var meshFS = `
precision mediump float;

uniform sampler2D tex;
uniform vec3 lightPos;  // Direction to the light source
uniform float shininess;      // Shininess factor for specular highlights
uniform bool show;     // Flag to determine if texture should affect diffuse color

// Varying values from vertex shader
varying vec2 texCoordinates;
varying vec3 normCoordinates; // Normalized normals from vertex shader
varying vec3 vertPos;         // Position of vertex in view space

void main() {
    vec3 N = normalize(normCoordinates); // Normalize the normals to ensure they are unit length after interpolation done by WebGL Pipeline
    vec3 L = normalize(lightPos);       // Light direction vector
    vec3 V = normalize(-vertPos);       // View direction (camera to vertex)

    float lambertian = max(dot(N, L), 0.0);  // Lambertian reflectance (cosine of angle between N and L)
    vec3 specular = vec3(0.0);

    if (lambertian > 0.0) {
        vec3 R = reflect(-L, N); // Reflected light direction
        float specAngle = max(dot(R, V), 0.0);
        specular = pow(specAngle, shininess) * vec3(1.0, 1.0, 1.0); // Specular highlight (using white specular color)
    }

    vec3 ambient = vec3(0.2, 0.3, 0.5);              // Cool light blue ambient light
    vec3 diffuse = lambertian * vec3(1.0, 1.0, 1.0); // Diffuse light (using white diffuse color)

    // Apply texture if showTexture is true
    if (show) {
        diffuse *= texture2D(tex, texCoordinates).rgb; // Modulate diffuse with texture color
    }

    vec3 color = ambient + diffuse + specular; // Combine ambient, diffuse, and specular components
    gl_FragColor = vec4(color, 1.0);           // Output final color
}
`;