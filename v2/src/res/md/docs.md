# Overview

DefiantJS provides the ability for you to build smart templates applicable on JSON structures, based upon proven &amp; standardized technologies such as XSLT and XPath.
DefiantJS also extends the global object __JSON__ with the method "__search__", which enables searches on JSON structures with XPath expressions and returns matches as an array-like object.
For detailed information, please visit [defiantjs.com](http://defiantjs.com) and try out the [XPath Evaluator](http://www.defiantjs.com/#xpath_evaluator)

### Installation from __npmjs.com__
Notice that installation requires "defiant.js" and not "defiant". This is due to the account of "kstngroup" has published it on __npmjs.com__. Making your project dependant to "defiant" might result in security issues in the future since I do not control the namespace of "defiant".


## Example of active code

```js
/* qure:active */
var a = 5;

console.log( Object.keys(window) );

(function test() {
    console.log(a--);

    if (a) {
        setTimeout(test, 1000);
    }
})();
```


## Example of import
```js
/* qure:active */

(async function() {
    var math = await import('/res/js/modules/math.js');
    console.log(math.add(5, 4));

    fetch('/res/json/tiny-data.json')
        .then(resp => resp.json())
        .then(data => console.log(data));
})();
```


## Example of console.view
```js
/* qure:active */
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


## Example of passive code

```js

(async () => {
    var file = await fetch('/res/json/tiny-data.json');
    console.log(file.body);
})();

var data = [
        { "x": 2, "y": 0 },
        { "x": 3, "y": 1 },
        { "x": 4, "y": 1 },
        { "x": 2, "y": 1 }
    ],
    res = JSON.search( data, '//*[ y > 0 ]' );

console.log( res );
// [{ x=3, y=1}, { x=4, y=1}, { x=2, y=1}]
```

