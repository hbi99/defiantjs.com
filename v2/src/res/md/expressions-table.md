## XPath
A powerful tool when dealing with XML is the advantage of using XPath. XPath is a standardized language for addressing parts of an XML document and enables features such as analysis, transformation & refined data selection out of an XML structure. The lack of a similar feature for working with JSON has prompted initiatives such as JSONPath, which has not been standardized or widely accepted by the community. With Defiant, you can unleash the power of XPath on JSON objects, with no retooling or reschooling!

## Expressions Table
The syntax table below offers a glimpse of the power that XPath brings. XPath has a lot more to offer. An important advantage of implementing XPath, as contrasted with JSONPath, is that this language has been documented a great deal on the web and information and how-to's can easily be found and digested.

| Expression    | Description  |
| ------------- | ------------ |
| / | Child operator; selects immediate children of the left-side collection. When this path operator appears at the start of the pattern, it indicates that children should be selected from the root node. |
| // | Recursive descent; searches for the specified element at any depth. When this path operator appears at the start of the pattern, it indicates recursive descent from the root node. |
| . | Indicates the current context. |
| .. | The parent of the current context. |
| * | Wildcard; selects all elements regardless of the element name. |
| @ | Attribute; prefix for an attribute name. |
| @* | Attribute wildcard; selects all attributes regardless of name. |
| [] | Subscript operator; applies a filter pattern OR used for indexing within a collection. |
| \| | Union operator; results in a combination of element sets |
| () | Groups operations to explicitly establish precedence |

> In order to access XPath functionality easily, some global objects has been extended with useful methods, for instance; `JSON.search`. Detailed information about these extensions can be found in the **Function reference** section.

### A couple of suggestions
* Switch views from XML to JSON to get a better overview of the data structure and how the selections are made.
* Also, check out the browser console for hints.
* To get going, click any of the pre-written examples of XPath queries.
* Don't forget to click the "Edit" button. You can alter or paste in your own JSON data and try out different XPath expressions on your custom data. This way, you can validate your expressions visually and get instant feedback.

### Caveats
There are some internal procedures of Defiant as well as known limitations of JSON (compared to XML) that you should be aware of. Below are some knowledge to keep in mind when working with XSLT, XPath and JSON.

* The structure of object that contains attributes keys (starting with "@"), will be altered and attributes precedes regular regular elements in the object structure.
* Namespace selection is not possible, since JSON does not support such detailed data semantics (as opposed to XML).
* Searching '//*' in JSON will result in one less match (comparing same search with XML), since XML has a root node and the handle to that match is "reachable". JSON's root handle is the name of the objects variable name and is out of scope for the search algorithm. Hence, a handle to the variable name can't be passed back to the querist.
* Defiant transforms JSON to XML, which is done lossless. This means that everything from the source data structure can be interpreted back. Transforming XML to JSON is not lossless since JSON isn't built to match the same level of data semantics as XML.