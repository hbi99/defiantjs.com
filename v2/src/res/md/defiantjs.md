# Overview

Do you need to query large JSON structures? Do you end up coding loops to parse the JSON and identify the data that matches your query? Defiant offers a better way. Defiant extends the global JSON object with a "search" method that enables lightning-fast searches using XPath expressions. Try out the XPath Evaluator to get the idea.

```js
/* qure:active */

(async () => {
  // import 'defiant' and fetch 'data'
  var [defiant, data] = await Promise.all([
      import('/res/js/modules/defiant.js'),
      fetchJSON('/res/json/tiny.json')
    ]);
  
  var search = JSON.search(data, '//car[color="yellow"]/name');
  console.log(search);

})();

```

## Snapshot search
Defiant `v1.2.0` introduced a snapshot feature that improves search performance more than 100 times compared to a regular search. Defiant prepares the JSON structure before the search; this preparation is the time-consuming part. Using snapshot of the JSON structure, Defiant can find and return matches as fast as 4ms on 1.6MB large data

## Web workers
With really large JSON structures, avoiding to do the time-consuming preparation on each search has proven to be beneficial. Though it turned out that this preparation have a blocking effect on the UI-thread. Consequently in version `v1.2.6` a snapshot can be created utilizing web workers. This approach brings a smoother experience and applies especially when dealing with large data - larger than 1 MB of JSON data.

## Templating
Contemporary JavaScript templating libraries enable you to write simplistic templates. Problems arise when complex real-world requirements exceed the limits of the templating model, so you have to supplement the templates with helper functions, fragmenting the templating logic, which is bad practice.

With Defiant, you can write logical templates with powerful technologies such as XSLT & XPath, and apply them to JSON objects. Besides the fact that XSLT is a proven Turing-complete language, it is also standardized and supported by all major browsers.

## Usage
Using Defiant is pretty easy. Check out the examples below to get a hint of how it can be used; the first one is rather simple and the latter is more advanced and demonstrates calling templates from another template. It contains recursive template calling and renders a fictitious filesystem structure. When the "tree-walker" template calls itself, indentation is passed as an argument, thus indenting child elements of a folder. 

## XPath
A powerful tool when dealing with XML is the advantage of using XPath. XPath is a standardized language for addressing parts of an XML document and enables features such as analysis, transformation & refined data selection out of an XML structure. The lack of a similar feature for working with JSON has prompted initiatives such as JSONPath, which has not been standardized or widely accepted by the community. With Defiant, you can unleash the power of XPath on JSON objects, with no retooling or reschooling!

## Function reference
Besides smart templating with the ability to perform transformations using XSLT on XML, & JSON structures, Defiant is equiped with powerful methods for refined data selections and generic tools to analyze & manipulate these structures programmatically, implemented cross-browser.

##### Defiant.render(template, object)
Inline script-block(s) delivers XSLT templates to the browser and can contain multiple templates. Pass the name of the template that will be used on the JSON object - passed in as second argument. This function returns an HTML string of the transformation.

##### Defiant.xmlFromString(xml_string)
This function does exactly what its name indicates; it creates and returns an XML document from the string passed in as argument. This function is primarily used internally by Defiant.

##### Defiant.node.toJSON(json_data)
This function does exactly what its name indicates; transforms a node and its descending structure into JSON equivalent.

##### Defiant.node.selectNodes(xpath)
There are different ways of dealing with XPath in Internet Explorer & other browsers. This function is not supported by all browsers by default but the syntax is much clearner & simpler than xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE, null); and therefore implemented cross browser with Defiant.

##### Defiant.node.selectSingleNode(xpath) 
This function behaves almost the same way as selectNodes with the difference that it returns the first match of the XPath expression and exits the search algorithm as soon as the first match is found. It is a preferable alternative if a single node is known to be desired, hence better choice performance-wise.

##### Defiant.node.prettyPring(xml_node) 
This property is a good helper when writing & debugging XML centric code. It's a shorthand way to get the serialized representation of a node, as opposed to creating a new XMLSerializer and call its function serializeToString. This property outputs a human-readable version of the serialized XML string, i.e. with line breaks and tabbed rows. Lastly, this property is accessible from all element nodes, regardless of depth in the XML structure (the document node included).

##### JSON.toXML(json_data) 
With Defiant, it is trivial to convert your JSON object into XML structure. Just call this extended function of the global object JSON and pass in your object as argument & the function will return an XML document.

##### JSON.search(object, xpath, first) 
This function is the jewel of Defiant. Call this function whenever you want a collection of elements in a JSON object, matching the XPath query, given as second argument. The third argument is optional and is of boolean type; if set to true, the function exits the search algorithm, as soon as a matching element is found, based upon given XPath.

The function JSON.search returns an array with aggregate functions, populated with matching elements. Besides the ability to find elements with XPath, this function returns mutable objects (assuming that the matches are mutable) of the matching elements in the JSON structure. Put differently; the matched elements can be altered with a loop, thus altering the original JSON object. See the code below as example.



