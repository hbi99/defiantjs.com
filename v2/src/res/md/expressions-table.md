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

In order to access XPath functionality easily, some global objects has been extended with useful methods, for instance; `JSON.search`. Detailed information about these extensions can be found in the **Function reference** section.
