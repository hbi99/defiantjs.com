# Overview
Markdown files are commonly used as a technical narrative text when describing code libraries. With markdown files, library authors explains their code with descriptions intermixed with static example of code, to exemplify the advantages of their libraries. It is fantastic. But as a reader, I missed the ability to test the code live - exactly on the spot, instead of the requirment to download the library, create a test-page in a local sandbox. Sure, I can try out the library at [JSFiddle](https://jsfiddle.net/), [Codepen](https://codepen.io/) or similar. But for me, changing context (i.e. site) results in tarnished focus.

A few years ago, I came in contact with [Jupyter Notebook](https://jupyter.org/), when coding machine learning and I thought that feature was amazing. Even though the code was primarily for [Python](https://www.python.org/) and serverside executed code - or more accurately, the code is piped to a kernel - I decided a few weeks ago to bring this feature to markdown files in the browser. In other words, an easily appliable version for anyone who utilises markdown files.

Implementing **jupyter.js** is quite simple; just add the `jupyter.min.js` and `jupyter.min.css` file to your HTML document. Once the **jupyter.js** is on a page, it will look for markdown rendered code blocks, with `/* jupyter:active */` as its first line. When encountering such blocks, it will activate those blocks and ignore any other blocks.

```html
<link type="text/css" href="../dist/jupyter.min.css" rel="stylesheet"/>
<script type="text/javascript" src="../dist/jupyter.min.js"></script>
```

```js
// ...and add the line below as the first row in the code block you wish to be live code-block
/* jupyter:active */

// ...here goes the code you want to be executable

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
When a jupyter code block is active, a "play" button is displayed in its upper right corner. When clicked, the code inside the editable area is executed and a sidebar is revealed on the right side of the code block. Using `console` related methods, the sidebar has the ability to give real-time feedback from the executed code. This is demonstrated in the sample code above. In `v1.0.1` of **jupyter.js** there is support for three console-methods; two of them are standard and the third one is added because I think it opens up for useful scenarios. The three methods are; `console.log`, `console.table` and `console.view`.

 Below you can find a block that demonstrates 'console.log' and 'console.table' in jupyter code block. The third block shows an example of the `console.view`, where the view is used - a canvas element is added and sine curve is drawn.

When the code block is in running mode, the button in the upper right corner is switched to a "pause" button - clicking on it will cause to stop all execution and the sidebar will become hidden.

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


## Function reference
The methods below is available as of `v1.0.1` of **jupyter.js**.

##### console.log(string)
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


