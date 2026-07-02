import XMLBuilder from "../src/fxb.js";

describe("XMLBuilder", function () {
  it('should parse to XML with malicious CDATA', function () {
    const jObj = {
      a: {
        $cdata: null,
      },
      b: {
        $cdata: "Content]]>script<![CDATA[more",
      },
    };
    const expected = `<a></a><b><![CDATA[Content]]]]><![CDATA[>script<![CDATA[more]]></b>`;
    const builder = new XMLBuilder({ cdataPropName: '$cdata' });
    const result = builder.build(jObj);
    // console.log(result);
    expect(result).toEqual(expected);
  });
  it('should parse to XML with malicious comment', function () {
    const jObj = {
      a: {
        $comment: null,
      },
      b: {
        $comment: "comment-->script<!--more",
      },
    };
    const expected = `<a></a><b><!--comment- ->script<!- -more--></b>`;
    const builder = new XMLBuilder({ commentPropName: '$comment' });
    const result = builder.build(jObj);
    // console.log(result);
    expect(result).toEqual(expected);
  });
  it('should parse to XML with malicious comment with 3 dashes', function () {
    const jObj = {
      a: {
        $comment: null,
      },
      b: {
        $comment: "comment--->script<!---more",
      },
    };
    const expected = `<a></a><b><!--comment- - ->script<!- - -more--></b>`;
    const builder = new XMLBuilder({ commentPropName: '$comment' });
    const result = builder.build(jObj);
    // console.log(result);
    expect(result).toEqual(expected);
  });
  it('should esxape double quote in attribute value', function () {
    const jObj = {
      a: {
        // "@_attr": '&apos; onClick=&apos;alert(1)'
        "@_attr": '" onClick="alert(1)'
      }

    };
    const expected = `<a attr="&quot; onClick=&quot;alert(1)"></a>`;
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      processEntities: false
    });
    const result = builder.build(jObj);
    // console.log(result);
    expect(result).toEqual(expected);
  });

  it('should esxape double quote in attribute value', function () {
    const jObj = {
      a: {
        "@_attr": '\\" onClick=\\"alert(1)'
      }

    };
    const expected = `<a attr="\\&quot; onClick=\\&quot;alert(1)"></a>`;
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      processEntities: false
    });
    const result = builder.build(jObj);
    // console.log(result);
    expect(result).toEqual(expected);
  });

  it('should esxape double quote in attribute value when order was preserrved', function () {
    const jObj = [
      {
        "a": [],
        ":@": {
          "@_attr": '" onClick="alert(1)'
        }
      }
    ]
    const expected = `<a attr="&quot; onClick=&quot;alert(1)"></a>`;
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      processEntities: false,
      preserveOrder: true
    });
    const result = builder.build(jObj);
    // console.log(result);
    expect(result).toEqual(expected);
  });

  it('should escape quote in a stopNode attribute value', function () {
    const jObj = {
      root: {
        div: {
          "#text": "<b>raw</b>",
          "@_class": '" onmouseover="alert(1)'
        }
      }
    };
    const expected = `<root><div class="&quot; onmouseover=&quot;alert(1)"><b>raw</b></div></root>`;
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      stopNodes: ["..div"],
      processEntities: false
    });
    const result = builder.build(jObj);
    // stopNode content stays raw, but the quote delimiter must still be escaped
    // (same output as preserveOrder: true below)
    expect(result).toEqual(expected);
  });

  it('should escape quote in a stopNode attribute value when order was preserved', function () {
    const jObj = [
      {
        "root": [
          {
            "div": [{ "#text": "<b>raw</b>" }],
            ":@": { "@_class": '" onmouseover="alert(1)' }
          }
        ]
      }
    ];
    const expected = `<root><div class="&quot; onmouseover=&quot;alert(1)"><b>raw</b></div></root>`;
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      stopNodes: ["root.div"],
      processEntities: false,
      preserveOrder: true
    });
    const result = builder.build(jObj);
    expect(result).toEqual(expected);
  });
});