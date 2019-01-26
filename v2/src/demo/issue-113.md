## Github issue #113
Multiple callback calls on async getSnapshot and the details of the issue can be found here [github link](https://github.com/hbi99/defiant.js/issues/113)

The live code block below is activated with [Jupyter.js](https://github.com/hbi99/jupyter.js) and the markdown contents can be found [here](https://github.com/hbi99/defiantjs.com/blob/master/v2/src/demo/issue-113.md).

```js
/* jupyter:active */

(async () => {
  // import 'defiant'
  var defiant = await fetchScript('/res/js/modules/defiant.js');

  var data = [
    {
      "hierarchyId": 21,
      "id": 0,
      "name": "Region",
      "items": {},
      "children": [
        {
          "hierarchyId": 21,
          "id": 71,
          "name": "Alps",
          "items": {},
          "children": []
        }
      ]
    }
  ];

  defiant.getSnapshot(data, function(snapshot) {
    console.log(snapshot);
  });

})();

```

