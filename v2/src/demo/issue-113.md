## Github issue #113
Multiple callback calls on async getSnapshot
[Github link](https://github.com/hbi99/defiant.js/issues/113)

```js
/* jupyter:active */
(async () => {
  // import 'defiant'
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