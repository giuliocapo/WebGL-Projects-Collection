var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

bool IntersectRay( inout HitInfo hit, Ray ray );

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0); //default black color for shadow
	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		// TO-DO: Check for shadows
		// TO-DO: If not shadowed, perform shading using the Blinn model
		HitInfo hit;
        // Compute direction from surface point to light source
        vec3 lightDir = normalize(lights[i].position - position); 
        
        //  check if the path from the point on the surface to the light source is not blocked by something
        if (!IntersectRay(hit, Ray(position, lightDir))) {
            // Calculate the cosine of the angle between the normal and light direction (called also lambertian)
            float c = dot(lightDir, normal);
            
            // Only add light if it is hitting the front of the surface
            if (c > 0.0) {
                // Calculate diffuse light component
                vec3 clr = mtl.k_d * c; // Diffuse color = Material diffuse color * cosine angle
                // Calculate direction for specular reflection
                vec3 halfwayDir = normalize(view + lightDir);
                // Compute the specular reflection strength
                float teta = dot(halfwayDir, normal);
                // Add specular component
                if (teta > 0.0) {
                    clr += mtl.k_s * pow(teta, mtl.n); // Specular color = Material specular color * (cosine of reflected angle)^shininess
                }
                // Add light contribution
                color += clr * lights[i].intensity;
            } 
        }
    }
    return color; // Return the computed color
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;
	
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		// TO-DO: Test for ray-sphere intersection
		// TO-DO: If intersection is found, update the given HitInfo
		
		// Calculate the coefficients for the second grade equation (Ax^2 + Bx + C = 0)
        float a = dot(ray.dir, ray.dir);
        float b = 2.0 * dot(ray.dir, ray.pos - spheres[i].center);  
        float c = dot(ray.pos - spheres[i].center, ray.pos - spheres[i].center) - spheres[i].radius * spheres[i].radius;  // Calculate the constant term of the quadratic equation.

        // Calculate the discriminant to determine if there is an intersection.
        float delta = b * b - 4.0 * a * c;  // Discriminant of the quadratic equation

        // Check if the discriminant is positive, which indicates two real intersection points thanks to the second grade equation.
        if (delta > 0.0) {
            // Calculate the smallest positive t that is the nearest intersection point that is the one we want it.
            float t = (-b - sqrt(delta)) / (2.0 * a);  
            if (t > 0.00001 && t < hit.t) {  // Ensure t is positive and less than any previously found intersection.
                foundHit = true;  // Update flag to true as an intersection is found.
                hit.t = t;  // Update the nearest intersection distance.
                hit.position = ray.pos + t * ray.dir;  // Calculate the exact intersection point.
                hit.normal = normalize(hit.position - spheres[i].center);  // Compute the normal at the intersection.
                hit.mtl = spheres[i].mtl;  // Assign the material of the sphere to the hit info.
            }
        }
    }
    return foundHit;  // Return whether any intersection was found.
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			// TO-DO: Initialize the reflection ray
			r.pos = hit.position;
			r.dir = normalize(reflect(-view, hit.normal)); // incident vector ray.dir and surface normal hit.normal reflect returns the reflection direction
			
			if ( IntersectRay( h, r ) ) {
				// TO-DO: Hit found, so shade the hit point
				// TO-DO: Update the loop variables for tracing the next reflection ray
				view = normalize(-r.dir); //checks if the ray r intersects any object in the scene
				clr += k_s * Shade(h.mtl, h.position, h.normal, view); // shading function is scaled by this specular coefficient and added to clr.
				k_s = k_s * h.mtl.k_s; // updates the specular coefficient k_s for subsequent reflections. Obviously each reflection need to be scaled up more!.
				hit = h;
			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;