// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.


function GetTransform( positionX, positionY, rotation, scale )
{

	//angle in radians
	var angle = rotation * Math.PI/180;

	var scale_matrix = Array(scale, 0, 0, 0, scale, 0, 0, 0, 1);
	var rotation_matrix = Array(Math.cos(angle), Math.sin(angle), 0, -Math.sin(angle), Math.cos(angle), 0, 0, 0, 1);
	var translation_matrix = Array(1, 0, 0, 0, 1, 0, positionX, positionY, 1);

	var t;

	t = ApplyTransform(scale_matrix, rotation_matrix);
	t = ApplyTransform(t, translation_matrix);
	return t;

}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	var ATMatrix = [];
	for (var i = 0; i < 3; i++) { // Iterate over the rows of the resulting matrix
		for (var j = 0; j < 3; j++) { // Iterate over the columns of the resulting matrix
			var sum = 0; // Initialize the sum of the element
			for (var k = 0; k < 3; k++) { // Iterate for the sum of products
				sum += trans1[i * 3 + k] * trans2[k * 3 + j];
			}
			ATMatrix[i * 3 + j] = sum; // Calculate the value
		}
	}
	return ATMatrix;
}