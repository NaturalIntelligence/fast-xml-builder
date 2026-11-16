

// String(val)/val.toString() drop the sign of -0 (e.g. String(-0) === '0'), silently
// corrupting a round-tripped negative-zero value. XML has no separate int/float syntax,
// so this is the single place every raw value gets turned into text.
export function valToStr(val) {
  return typeof val === 'number' && Object.is(val, -0) ? '-0' : String(val)
}

export function safeComment(val) {
  return valToStr(val)
    .replace(/--/g, '- -')   // -- is illegal anywhere in comment content
    .replace(/--/g, '- -')   // handle the scenario when 2 consiucative dashes appears 
    .replace(/-$/, '- ');    // trailing - would form -- with the closing -->
}

export function safeCdata(val) {
  return valToStr(val).replace(/\]\]>/g, ']]]]><![CDATA[>')
}

export function escapeAttribute(val) {
  return valToStr(val).replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

/**
 * Resolve a tag or attribute name through sanitizeName if configured.
 * Validation via xml-naming's qName is performed first; the sanitizeName
 * callback is invoked only when the name is invalid. If sanitizeName is
 * false (default), no validation occurs and the name is used as-is.
 *
 * @param {string}  name        - raw name from the JS object
 * @param {boolean} isAttribute - true when resolving an attribute name
 * @param {object}  options
 * @param {Matcher} matcher     - current matcher state (readonly from callback perspective)
 * @param {function} qNameValidator - function to validate tag names
 */

export function resolveName(name, isAttribute, options, matcher, validator) {
  if (!options.sanitizeName) return name;

  // Processing-instruction names: validate the part after the leading "?"
  const isPI = !isAttribute && name[0] === '?';
  const bare = isPI ? name.slice(1) : name;

  if (validator(bare)) return name;

  const result = options.sanitizeName(bare, { isAttribute, matcher: matcher.readOnly() });

  // Never trust the callback's output
  if (typeof result !== 'string' || !validator(result)) {
    throw new Error(`sanitizeName returned an invalid XML name for "${bare}"`);
  }
  return isPI ? '?' + result : result;
}