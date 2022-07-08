  precision highp float;
  precision highp sampler3D;
  varying vec3 vPosition;
  varying vec3 vOrigin;
  varying vec3 vDirection;
  varying vec2 vUv;
    varying vec3 vNormal;
  uniform sampler3D map;
  uniform sampler3D noise;
  uniform float time;
  uniform float cut;
  uniform float range;
  uniform float opacity;
  uniform float steps;
  uniform bool accumulate;
  uniform vec3 color;
  uniform float uDummy;

  vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, -s, s, c);
    return m * v;
  }

  float sample1( vec3 p ) {
    vec3 pr = p - 0.5;
    pr.xy = rotate(pr.xy, time/2.);
    pr += 0.5;
    float s = texture(map, pr).r * 1.;
    
    pr = p - 0.5;
    pr.xy = rotate(pr.xy, time/3.);
    pr += 0.5;
    float n = texture(noise, pr).r;
    // return n;
    return min(s,  n);
  }

  void main(){
    float le = length(vDirection);
    vec3 rayDir = normalize(vDirection);
    vec3 p = vPosition;
    float delta = 1. / steps;
    
    vec4 lines = vec4(0.);
    
    vec3 l = normalize(vec3(1.,1.,0.));
    float light = 0.;
    for (float t = 0.; t < steps; t++) {
      float d = sample1(p + 0.5);

       if ( d > 0. ) {
      vec3 n = vNormal;
      float diffuse = .5 + .5 * dot(l, n);
      vec3 e = normalize(-p);
      vec3 h = normalize(l + e);
      float f = d-0.;
      float specular = pow(max(dot(n, h), 0.), 10.);
      lines.rgb += color * (diffuse + specular)/10. * f;
      lines.a += .01 * f;
    }

      float e = uDummy*length(vec2(dFdx(d), dFdy(d)));// + 0.01;
      e = step(e, 0.1) * e;
      float f = abs(d-0.5);
      if(f<e) {
        lines.rgb += vec3(1.);
        lines.a += .1;
      }
    //   if(lines.a>=1.) {
    //   t+=100.;
    // }

      p += rayDir * delta * le;

      // lines *= d * 0.5 + 0.5;
    }
    light /= steps;
    gl_FragColor = lines;
    gl_FragColor.rgb *= color;
    gl_FragColor.a += light;
    gl_FragColor *= length(vPosition) * 1.;
  }