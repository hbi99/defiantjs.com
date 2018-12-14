# DefiantJS Overview

DefiantJS provides the ability for you to build smart templates applicable on JSON structures, based upon proven &amp; standardized technologies such as XSLT and XPath.
DefiantJS also extends the global object __JSON__ with the method "__search__", which enables searches on JSON structures with XPath expressions and returns matches as an array-like object.
For detailed information, please visit [defiantjs.com](http://defiantjs.com) and try out the [XPath Evaluator](http://www.defiantjs.com/#xpath_evaluator)

### Installation from __npmjs.com__
Notice that installation requires "defiant.js" and not "defiant". This is due to the account of "kstngroup" has published it on __npmjs.com__. Making your project dependant to "defiant" might result in secuirty issues in the future since I do not control the namespace of "defiant".


## Example of active code

```js
/* qure:active */
var a = 5;

function test() {
    console.log(a--);

    if (a) {
        setTimeout(test, 1000);
    }
}

test();
```


## Example of play / pause
```js
/* qure:active */
var a = 10;

function test() {
    console.log(a--);

    if (a) {
        setTimeout(test, 1000);
    }
}

test();
```


## Example of fetch

```js
/* qure:active */
var tmp = [{a: 1}, {b: 1}];
console.log(tmp);
console.log(1);
console.log({c: 2});
console.log({c: 2}, tmp);
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

