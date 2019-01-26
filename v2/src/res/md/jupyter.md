# Overview
Markdown files are commonly used as a technical narrative text when describing code libraries. With markdown files, library authors explains their code with descriptions intermixed with static sample code, to exemplify the advantages of their libraries. It is fantastic. But as a reader, I missed the ability to test the code live - exactly on the spot, instead of the requirment to download the library, create a test-page in a local sandbox. Sure, I can try out the library at [JSFiddle](https://jsfiddle.net/), [Codepen](https://codepen.io/) or similar. But for me, changing context (i.e. site) results in tarnished focus.

A few years ago, I came in contact with [Jupyter Notebook](https://jupyter.org/), when coding machine learning and I thought that feature was amazing. Even though the code was primarily for [Python](https://www.python.org/) and serverside executed code - or more accurately, the code is piped to a kernel - I decided a few weeks ago to bring this feature to markdown files in the browser. In other words, an easily applicable version for anyone who utilises markdown files.

Implementing **jupyter.js** is quite simple; just add the `jupyter.min.js` and `jupyter.min.css` file to your HTML document. Once the **jupyter.js** is on a page, it will look for markdown rendered code blocks, with `/* jupyter:active */` as its first line. When encountering such blocks, it will activate those blocks and ignore any other blocks.

```html
<link type="text/css" href="jupyter.min.css" rel="stylesheet"/>
<script type="text/javascript" src="jupyter.min.js"></script>
```

```
/* jupyter:active */  <-- this will activate jupyter block

var color = 'red';

console.log(red);

```

### Example of jupyter code block
```js
/* jupyter:active */
var a = 5;

(function test() {
    console.log(a--);

    if (a) {
        setTimeout(test, 1000);
    }
})();
```


## Sidebar
When a jupyter code block is active, a "play" button is displayed in its upper right corner. When clicked, the code inside the editable area is executed and a sidebar is revealed on the right side of the code block. Using `console` related methods, the sidebar has the ability to give real-time feedback from the executed code. This is demonstrated in the sample code above. In `v1.0.2` of **jupyter.js** there is support for three console-methods; two of them are standard and the third one is added because I think it opens up for useful scenarios. The three methods are; `console.log`, `console.table` and `console.view`.

Below you can find a block that demonstrates 'console.log' and 'console.table' in jupyter code block. The second block shows an example of the `console.view`, where the view is used - a canvas element is added and sine curve is drawn. When the code block is in running mode, the button in the upper right corner is switched to a "pause" button - clicking on it will cause to stop all execution and the sidebar becomes hidden.

```js
/* jupyter:active */

console.log('hello world');

var data = {
    name: "James",
    drink: "Dry Martini",
    license: "Kill"
};

console.table(data);




```

### Example of console.view
```js
/* jupyter:active */
var view = console.view({ height: 180 }),
    cvs = document.createElement('canvas'),
    ctx = cvs.getContext('2d'),
    frequency = 1;

cvs.width = view.width;
cvs.height = view.height;
ctx.fillStyle = 'green';
// append child to DOM
view.el.appendChild(cvs);

(function draw() {
    var y = Math.sin(frequency++ * 0.035) * (cvs.height / 4),
        img = ctx.getImageData(0, 0, cvs.width, cvs.height);

    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.putImageData(img, -1, 0);
    ctx.fillRect(cvs.width - 3, y + (cvs.height / 2), 3, 3);

    requestAnimationFrame(draw);
})();
```


```js
/* jupyter:active */

(async () => {
  var defiant = await fetchScript('/res/js/modules/defiant.js');
  var data = await fetchJSON('/res/json/store.json');

  console.log(defiant.render);

  console.table(data.store.book[0]);




})();
```

### Example of console.view with three.js
```js
/* jupyter:active */

(async () => {
    var THREE = await fetchScript('/res/js/modules/three.js');
    var view = console.view({ height: 300 });

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene(),
        // create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000),
        // create a render and set the size
        webGLRenderer = new THREE.WebGLRenderer();

    webGLRenderer.setClearColor(new THREE.Color(0x000000, 1.0));
    webGLRenderer.setSize(view.width, view.height);
    webGLRenderer.shadowMapEnabled = true;

    // position and point the camera to the center of the scene
    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 50;
    camera.lookAt(new THREE.Vector3(10, 0, 0));

    // add the output of the renderer to the html element
    view.el.append(webGLRenderer.domElement);

    // call the render function
    var step = 0,
        knot;

    // setup the control gui
    var controls = new function () {
        // we need the first child, since it's a multimaterial
        this.radius = 40;
        this.tube = 28.2;
        this.radialSegments = 600;
        this.tubularSegments = 9;
        this.p = 5;
        this.q = 4;
        this.heightScale = 1;
        this.asParticles = true;
        this.rotate = true;
        this.redraw = function () {
            // remove the old plane
            if (knot) scene.remove(knot);
            // create a new one
            var geom = new THREE.TorusKnotGeometry(controls.radius, controls.tube,
                    Math.round(controls.radialSegments),
                    Math.round(controls.tubularSegments),
                    Math.round(controls.p),
                    Math.round(controls.q), controls.heightScale);

            if (controls.asParticles) {
                knot = createParticleSystem(geom);
            } else {
                knot = createMesh(geom);
            }
            // add it to the scene.
            scene.add(knot);
        };
    }

    controls.redraw();
    render();

    // from THREE.js examples
    function generateSprite() {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            gradient,
            texture;
        canvas.width = 16;
        canvas.height = 16;

        gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(0,255,255,1)');
        gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,1)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    function createParticleSystem(geom) {
        var material = new THREE.PointCloudMaterial({
                color: 0xffffff,
                size: 3,
                transparent: true,
                blending: THREE.AdditiveBlending,
                map: generateSprite()
            }),
            system = new THREE.PointCloud(geom, material);
        system.sortParticles = true;
        return system;
    }

    function createMesh(geom) {
        // assign two materials
        var meshMaterial = new THREE.MeshNormalMaterial({}),
            mesh;
        meshMaterial.side = THREE.DoubleSide;
        // create a multimaterial
        mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial]);
        return mesh;
    }

    function render() {
        if (controls.rotate) {
            knot.rotation.y = step += 0.01;
        }
        // render using requestAnimationFrame
        requestAnimationFrame(render);
        webGLRenderer.render(scene, camera);
    }

})();
```


## Keyboard shortcuts
As of version `v1.0.2` of **jupyter.js**, the shortcuts useful when editing code in jupyter code block is listed below.

| Shortcut    | Description  |
| ------------- | ------------ |
| Alt+Enter | Executes the code in current jupyter code block. |


## Function reference
The methods below is available as of `v1.0.2` of **jupyter.js**.

##### console.log(message)
This method will output whatever you want on the same line as it is executed on. This method will call the original `console.log` once done.

##### console.table(object)
This method outputs a data object as a table view. This method will call the original `console.table` once done.

##### console.view(object)
The object passed in should specify the height of the view. This method returns a reference to the DOM element appended to the sidebar and further operations can be made in the code.

##### fetchJSON(path_to_json_file)
This method should be caled in a asynchronous function. It is a shorthand method to get a JSON file - hence simplifies sample code when exemplifying code involving JSON files.

##### fetchScript(path_to_script_module)
This method should be caled in a asynchronous function. It is a shorthand method to get a javascript module.

## Roadmap
As in [Jupyter Notebook](https://jupyter.org/), my intention is that codeblocks in the same markdown file will be aware of, inherit and share data between the code blocks. In later versions, a code author should for instance narrate and exemplify a complex documentation such as machine learning with javascript from start to end. For instance, I made this page completely in markdown and a developer can read, follow, tweak and learn the complete steps with jupyter code blocks; [ConvNetJS MNIST demo](https://cs.stanford.edu/people/karpathy/convnetjs/demo/mnist.html).


