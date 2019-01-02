# Overview

Do you need to query large JSON structures? Do you end up coding loops to parse the JSON and identify the data that matches your query? Defiant offers a better way. Defiant extends the global JSON object with a "search" method that enables lightning-fast searches using XPath expressions. Try out the XPath Evaluator to get the idea.

```js
/* qure:active */

(async () => {
  // import 'defiant' and fetch 'data'
  var [defiant, data] = await Promise.all([
      fetchScript('/res/js/modules/defiant.js'),
      fetchJSON('/res/json/tiny.json')
    ]);
  
  var search = defiant.search(data, '//car[color="yellow"]/name');
  console.log(search);

})();

```

## Defiant in Node environment

As of `v2.0.0`, Defiant can be utilized in [Node.js](https://nodejs.org/) environment. Since there is no default support for XML technologies in Node, the library [puppeteer](https://github.com/GoogleChrome/puppeteer) is initiated to mimic browser environment, with Defiant running. All methods called from Node is piped via __puppeteer__. Even though, Defiant now can be used in Node environment - utilizing Defiant in the browser is recommended. It all boils down to whether you want your servers to run thousands of searches for your clients __or__ to let thousands of client computers to share the work load.

## Facet search

Facet search was introduced in `v2.1.3`. With this feature, Defiant can group and count your JSON data with a few lines of simple code. See the two example codes below - the latter one examplifies facet search using snapshots. Making facet searches on snapshots si highly recommended if you are intending to make multiple queries on the same data. You can make multiple grouped queries as shown below.

```js
/* qure:active */

(async () => {
  // import 'defiant' and fetch 'data'
  var [defiant, data] = await Promise.all([
      fetchScript('/res/js/modules/defiant.js'),
      fetchJSON('/res/json/medium.json')
    ]);

  var facets = defiant.getFacets(data, {
        'eyeColors':      {group: '*', key: 'eyeColor'},
        'favoriteFruits': {group: '*', key: 'favoriteFruit'}
      });
  
  console.table(facets.favoriteFruits);
  // facets will now contain grouped values from facet-search
  // the values of 'favoriteFruits' is listed as table

  // create snapshot if you intend to make multiple facet searches
  defiant.createSnapshot(data, function(snapshot) {
    var facets = defiant.getFacets(snapshot, {
        'eyeColors':      {group: '*', key: 'eyeColor'},
        'favoriteFruits': {group: '*', key: 'favoriteFruit'}
      });

    console.table(facets.eyeColors);
    // facets will now contain grouped values from facet-search
    // the values of 'eyeColors' is listed as table

  });

})();

```

## Snapshot search
Defiant `v1.2.0` introduced a snapshot feature that improves search performance more than 100 times compared to a regular search. Defiant prepares the JSON structure before the search; this preparation is the time-consuming part. Using snapshot of the JSON structure, Defiant can find and return matches as fast as 4ms on 1.6MB large data

With really large JSON structures, avoiding to do the time-consuming preparation on each search has proven to be beneficial. Though it turned out that this preparation have a blocking effect on the UI-thread. Consequently in version `v1.2.6` a snapshot can be created utilizing web workers. This approach brings a smoother experience and applies especially when dealing with large data - larger than 1 MB of JSON data.

```js
/* qure:active */

(async () => {
  var defiant = await fetchScript('/res/js/modules/defiant.js');
  var data = await fetchJSON('/res/json/store.json');
  var found;
  var snapshot;

  // regular search
  found = defiant.search(data, '//book');
  console.log(found);


  // create snapshot of the data
  snapshot = defiant.getSnapshot(data);

  // this is many times faster than 'regular search'
  found = defiant.search(snapshot, '//book');
  console.log(found);

})();

```


## Templating
Contemporary JavaScript templating libraries enable you to write simplistic templates. Problems arise when complex real-world requirements exceed the limits of the templating model, so you have to supplement the templates with helper functions, fragmenting the templating logic, which is bad practice.

With Defiant, you can write logical templates with powerful technologies such as XSLT & XPath, and apply them to JSON objects. Besides the fact that XSLT is a proven Turing-complete language, it is also standardized and supported by all major browsers.

Using Defiant is pretty easy. Check out the examples below to get a hint of how it can be used; the first one is rather simple and the latter is more advanced and demonstrates calling templates from another template. It contains recursive template calling and renders a fictitious filesystem structure. When the "tree-walker" template calls itself, indentation is passed as an argument, thus indenting child elements of a folder. 

```js
/* qure:active */

(async () => {
  var defiant = await fetchScript('/res/js/modules/defiant.js');
  
  var template_string = `<xsl:template name="books_template">
        <xsl:for-each select="//movie">
            <xsl:value-of select="title"/>,<br/>
        </xsl:for-each>
    </xsl:template>`;

  defiant.registerTemplate(template_string);

  var data = {
          "movie": [
              {"title": "The Usual Suspects"},
              {"title": "Pulp Fiction"},
              {"title": "Independence Day"}
          ]
      };

  var htm = defiant.render('books_template', data);
  console.log(htm);

})();

```

## Function reference
Besides smart templating with the ability to perform transformations using XSLT on XML, & JSON structures, Defiant is equiped with powerful methods for refined data selections and generic tools to analyze & manipulate these structures programmatically, implemented cross-browser.

##### defiant.render(template_name, object)
Inline script-block(s) delivers XSLT templates to the browser and can contain multiple templates. Pass the name of the template that will be used on the JSON object - passed in as second argument. This function returns an HTML string of the transformation.

##### defiant.xmlFromString(xml_string)
This function does exactly what its name indicates; it creates and returns an XML document from the string passed in as argument. This function is primarily used internally by Defiant.

##### defiant.getSnapshot(data, [callback])
Creates and returns a snapshot of JSON data. This is useful if you are intending to make multiple queries on the same data and improves performance severily. If a callback is specified, the snapshot is created asynchronously and in a seprate thread, that does not block the main UI thread.

##### defiant.createSnapshot(data, [callback])
This function does the same thing as `defiant.getSnapshot` but returns a uniq string that can be used to query a certain snapshot. This function is especially in Node environment since the returned snapshot contains data types that are foreign to that environment - a snapshot exposed to Node environment will disfigure the snapshot object.

##### defiant.registerTemplate(string)
Defiant will create a master XSL template and will use it as base when rendering. It is recommended that you defiant all of your templates in one call and identify which template to use as the name of the template, when calling the function `defiant.render`.

##### defiant.getFacets(data, groups)
Defiant is also capable to make faceted searches on your JSON data. To see this function in action, please the sample code above.

##### defiant.node.toJSON(json_data)
This function does exactly what its name indicates; transforms a node and its descending structure into JSON equivalent.

##### defiant.node.selectNodes(xpath)
There are different ways of dealing with XPath in Internet Explorer & other browsers. This function is not supported by all browsers by default but the syntax is much clearner & simpler than xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE, null); and therefore implemented cross browser with Defiant.

##### defiant.node.selectSingleNode(xpath) 
This function behaves almost the same way as selectNodes with the difference that it returns the first match of the XPath expression and exits the search algorithm as soon as the first match is found. It is a preferable alternative if a single node is known to be desired, hence better choice performance-wise.

##### defiant.node.prettyPring(xml_node) 
This property is a good helper when writing & debugging XML centric code. It's a shorthand way to get the serialized representation of a node, as opposed to creating a new XMLSerializer and call its function serializeToString. This property outputs a human-readable version of the serialized XML string, i.e. with line breaks and tabbed rows. Lastly, this property is accessible from all element nodes, regardless of depth in the XML structure (the document node included).

##### defiant.json.toXML(json_data) 
With Defiant, it is trivial to convert your JSON object into XML structure. Just call this extended function of the global object JSON and pass in your object as argument & the function will return an XML document.

##### defiant.json.search(object, xpath, first) 
This function is the jewel of Defiant. Call this function whenever you want a collection of elements in a JSON object, matching the XPath query, given as second argument. The third argument is optional and is of boolean type; if set to true, the function exits the search algorithm, as soon as a matching element is found, based upon given XPath.

The function `defiant.json.search` returns an array with aggregate functions, populated with matching elements. Besides the ability to find elements with XPath, this function returns mutable objects (assuming that the matches are mutable) of the matching elements in the JSON structure. Put differently; the matched elements can be altered with a loop, ~~thus altering the original JSON object~~.

**Important to notice**, defiant will stop extending the JSON object. In a transition period, there will be support for this as a means to be compatible but using the methods `JSON.search` or `JSON.toXML` will cause a warning from now on. Instead, you should these methods; `defiant.json.search` or `defiant.json.toXML`.



