# XMLBuilder Options

XML Builder can be used to build an XML string from a JS object. It supports the following options:

```js
import XMLBuilder from 'fast-xml-builder';

const options = {
    ignoreAttributes: false
};

const builder = new XMLBuilder(options);
let xmlDataStr = builder.build(jObj);
```

---

## arrayNodeName
When you build XML from an array, set `arrayNodeName` to wrap each element in a named tag.

```js
const cars = [
    { color: "purple", type: "minivan", registration: "2020-02-03", capacity: 7 },
    { color: "orange", type: "SUV",     registration: "2021-05-17", capacity: 4 },
];
const builder = new XMLBuilder({ arrayNodeName: "car" });
const output = builder.build(cars);
```
```xml
<car>
    <color>purple</color>
    <type>minivan</type>
    <registration>2020-02-03</registration>
    <capacity>7</capacity>
</car>
<car>
    <color>orange</color>
    <type>SUV</type>
    <registration>2021-05-17</registration>
    <capacity>4</capacity>
</car>
```

---

## attributeNamePrefix
Prefix used to identify attribute properties in the JS object so they can be recognized and stripped from tag names. Default: `'@_'`.

Avoid setting it to blank string as the builder can't distinguish it with other properties/tags.

---

## attributesGroupName
Identifies a property in the JS object that groups all attributes for a tag. The builder strips this key and promotes its children as XML attributes.

This option is **not supported** when `preserveOrder: true` because attributes are already grouped in the ordered structure.

---

## attributeValueProcessor
Customize how attribute values are serialized. Receives the attribute name and its raw value.

```js
const options = {
    ignoreAttributes: false,
    attributeValueProcessor: (attrName, val) => val.toUpperCase()
};
```

> **Note:** For stop nodes, `attributeValueProcessor` is skipped and values are written as-is.

---

## cdataPropName
Identifies properties whose values should be wrapped in `<![CDATA[...]]>` blocks.

**Example input:**
```json
{
    "any_name": {
        "person": {
            "phone": [122233344550, 122233344551, ""],
            "name": ["<some>Jack</some>Jack", "<some>Mohan</some>"],
            "blank": "",
            "regx": "^[ ].*$"
        }
    }
}
```

**Code:**
```js
const options = {
    processEntities: false,
    format: true,
    ignoreAttributes: false,
    cdataPropName: "phone"
};
const builder = new XMLBuilder(options);
const xmlOutput = builder.build(input);
```

**Output:**
```xml
<any_name>
    <person>
        <![CDATA[122233344550]]>
        <![CDATA[122233344551]]>
        <![CDATA[]]>
        <name><some>Jack</some>Jack</name>
        <name><some>Mohan</some></name>
        <blank></blank>
        <regx>^[ ].*$</regx>
    </person>
</any_name>
```

> It is recommended to use `preserveOrder: true` when parsing XML to a JS object and building it back, so that CDATA order is maintained.

**Note**: If value contains CDATA start/end delimiters then the builder will automatically santize the value.

---

## commentPropName
Identifies properties whose values should be rendered as XML comments (`<!-- ... -->`).

**Example input:**
```json
{
    "any_name": {
        "person": {
            "phone": [122233344550, 122233344551, ""],
            "name": ["<some>Jack</some>Jack", "<some>Mohan</some>"],
            "blank": "",
            "regx": "^[ ].*$"
        }
    }
}
```

**Code:**
```js
const options = {
    processEntities: false,
    format: true,
    ignoreAttributes: false,
    commentPropName: "phone"
};
const builder = new XMLBuilder(options);
const xmlOutput = builder.build(input);
```

**Output:**
```xml
<any_name>
    <person>
        <!--122233344550-->
        <!--122233344551-->
        <!---->
        <name><some>Jack</some>Jack</name>
        <name><some>Mohan</some></name>
        <blank></blank>
        <regx>^[ ].*$</regx>
    </person>
</any_name>
```

> It is recommended to use `preserveOrder: true` when parsing XML to a JS object and building it back, so that comment order is maintained.


**Note**: If value contains comment start/end delimiters then the builder will automatically santize the value.

---

## format
By default, output is a single-line XML string. Set `format: true` to produce indented, human-readable XML.

---

## ignoreAttributes

By default (`true`), the builder skips all attributes. Set to `false` to include them.

You can also selectively ignore specific attributes using an array of strings, an array of regular expressions, or a callback function.

### Example input

```json
{
    "tag": {
        "$ns:attr1": "a1-value",
        "$ns:attr2": "a2-value",
        "$ns2:attr3": "a3-value",
        "$ns2:attr4": "a4-value",
        "tag2": {
            "$ns:attr1": "a1-value",
            "$ns:attr2": "a2-value",
            "$ns2:attr3": "a3-value",
            "$ns2:attr4": "a4-value"
        }
    }
}
```

### Ignore by array of strings

```js
const options = {
    attributeNamePrefix: "$",
    ignoreAttributes: ['ns:attr1', 'ns:attr2']
};
```

```xml
<tag ns2:attr3="a3-value" ns2:attr4="a4-value">
    <tag2 ns2:attr3="a3-value" ns2:attr4="a4-value"></tag2>
</tag>
```

### Ignore by array of regular expressions

```js
const options = {
    attributeNamePrefix: "$",
    ignoreAttributes: [/^ns2:/]
};
```

```xml
<tag ns:attr1="a1-value" ns:attr2="a2-value">
    <tag2 ns:attr1="a1-value" ns:attr2="a2-value"></tag2>
</tag>
```

### Ignore via callback function

The callback receives the attribute name and the current `jPath` (a dot-notation string by default, or a `Matcher` instance if `jPath: false`).

```js
const options = {
    attributeNamePrefix: "$",
    ignoreAttributes: (attrName, jPath) => attrName.startsWith('ns:') || jPath === 'tag.tag2'
};
```

```xml
<tag ns2:attr3="a3-value" ns2:attr4="a4-value">
    <tag2></tag2>
</tag>
```

---

## indentBy
The string used for each indentation level. Default: `'  '` (two spaces). Only applies when `format: true`.

---

## maxNestedTags
Limits the maximum depth of nested tags. An error is thrown if the nesting depth exceeds this value. Default: `100`.

```js
const options = { maxNestedTags: 10 };
const builder = new XMLBuilder(options);
const xmlOutput = builder.build(jsonData);
```

---

## oneListGroup
Groups all repeated child tags under a single parent tag.

**Input:**
```json
{
    "Attributes": [
        { "Attribute": "1" },
        { "Attribute": "2" }
    ]
}
```

**Code:**
```js
const builder = new XMLBuilder({ oneListGroup: true });
const output = builder.build(json);
```

**Output:**
```xml
<Attributes>
    <Attribute>1</Attribute>
    <Attribute>2</Attribute>
</Attributes>
```

---

## preserveOrder
When you parse XML using [Fast XML Parser](https://github.com/NaturalIntelligence/fast-xml-parser) with `preserveOrder: true` or [Flexible-XML-parser](https://github.com/nodable/flexible-xml-parser) with Sequential Builder, the result has a different structure. Pass `preserveOrder:true` to get the same XML response back.

---

## processEntities
Set to `true` (default) to replace special characters with XML entities (`&amp;`, `&lt;`, `&gt;`, `&apos;`, `&quot;`). Disable with `processEntities: false` for better performance when you know your content contains no entities.

> **Security note:** Single and double quotes in attribute values are always escaped to `&apos;` and `&quot;`, regardless of this setting.

---

## stopNodes
Tags listed here are treated as raw content containers. Their text content is written as-is without entity encoding or child processing.

Accepts an array of tag name strings or pre-compiled `Expression` instances from `path-expression-matcher`.

The old `*.tagName` wildcard syntax is still accepted and is automatically converted to the equivalent `..tagName` deep-wildcard expression.

> This option is currently only supported with `preserveOrder: true`.

A stop node may have raw content and attributes, but is not expected to have child nodes, CDATA, comments, or other structured properties.

**Example (with `preserveOrder: true`):**
```js
[{
    root: [
        { foo: [{ '#text': '<p>raw html</p>' }] },
        { bar: [{ '#text': '' }] }
    ]
}]
```

---

## suppressBooleanAttributes
When `true` (default), attributes whose value is `true` are rendered as boolean attributes (value omitted).

**Input:**
```js
const jsOrderedObj = [
    {
        "?textinfo": [{ "#text": "" }],
        ":@": {
            "@_whitespace": true,
            "@_is": true,
            "@_allowed": true
        }
    }
];
const options = {
    ignoreAttributes: false,
    preserveOrder: true,
    allowBooleanAttributes: true,
    suppressBooleanAttributes: true
};
const builder = new XMLBuilder(options);
const output = builder.build(jsOrderedObj);
```

**Output:**
```xml
<?textinfo whitespace is allowed?>
```

---

## suppressEmptyNode
When `true`, tags with no text value are rendered as self-closing tags.

**Input:**
```js
const builder = new XMLBuilder({ suppressEmptyNode: true });
const output = builder.build({ a: 32, b: "" });
```

**Output:**
```xml
<a>32</a>
<b/>
```

---

## suppressUnpairedNode
Controls the rendering of unpaired tags. Default: `true`.

- `true` (default): renders as `<br>` (no closing slash)
- `false`: renders as `<br/>`

---

## tagValueProcessor
Customize how tag text values are serialized. Receives the tag name and its raw value.

```js
const options = {
    tagValueProcessor: (tagName, val) => val.trim()
};
```

> **Note:** For stop nodes, `tagValueProcessor` is skipped and values are written as-is.

---

## textNodeName
The property name used to represent the text content of a tag in the JS object. Default: `'#text'`.

---

## unpairedTags
A list of tag names that have no closing tag (e.g. `<br>`, `<img>` in HTML). You can provide the same list to the parser, validator, and builder.

**Example:**
```js
const options = { unpairedTags: ["br", "img"] };
const builder = new XMLBuilder(options);
```

---

# Restoring original XML

### Example 1 — `alwaysCreateTextNode`

```js
const XMLdata = `<car>
  <color>purple</color>
  <type>minivan</type>
</car>`;

const parser = new XMLParser({ alwaysCreateTextNode: true });
let result = parser.parse(XMLdata);

const builder = new XMLBuilder({ format: true });
const output = builder.build(result);
```

Output:
```xml
<car>
  <color>purple</color>
  <type>minivan</type>
</car>
```

### Example 2 — `isArray`

```js
const parser = new XMLParser({
    isArray: (tagName, jPath, isLeafNode) => isLeafNode
});
let result = parser.parse(XMLdata);

const builder = new XMLBuilder();
const output = builder.build(result);
```

### Example 3 — `preserveOrder`

```js
const parser = new XMLParser({ preserveOrder: true });
let result = parser.parse(XMLdata);

const builder = new XMLBuilder({ preserveOrder: true });
const output = builder.build(result);
```

### Example 4 — Matching `attributeNamePrefix`

Always set `attributeNamePrefix` and other shared options to the same value in both the parser and builder.

```js
const options = {
    ignoreAttributes: false,
    attributeNamePrefix: "@@",
    format: true
};
const parser = new XMLParser(options);
let result = parser.parse(XMLdata);

const builder = new XMLBuilder(options);
const output = builder.build(result);
```