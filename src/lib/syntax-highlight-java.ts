const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const highlightJavaSyntax = (code: string): string => {
  let html = escapeHtml(code);

  // Order of replacement is important to avoid conflicts.
  // 1. Comments
  html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 italic">$1</span>'); // Multi-line comments
  html = html.replace(/(\/\/.*)/g, '<span class="text-gray-500 italic">$1</span>'); // Single-line comments

  // 2. Strings
  html = html.replace(/(&quot;(?:\\.|[^&\\\n])*?&quot;)/g, '<span class="text-green-400">$1</span>');

  // 3. Annotations
  html = html.replace(/(@[A-Za-z_][A-Za-z0-9_]*)/g, '<span class="text-yellow-400">$1</span>');

  // 4. Keywords
  const keywords = [
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
    'continue', 'default', 'do', 'double', 'else', 'enum', 'exports', 'extends', 'final', 'finally', 'float',
    'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'module', 'native',
    'new', 'non-sealed', 'opens', 'package', 'permits', 'private', 'protected', 'public', 'provides', 'record', 'requires',
    'return', 'sealed', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw',
    'throws', 'to', 'transient', 'transitive', 'try', 'uses', 'var', 'void', 'volatile', 'while', 'with', 'yield',
    'true', 'false', 'null'
  ];
  const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
  html = html.replace(keywordRegex, '<span class="text-sky-400 font-semibold">$1</span>');
  
  // 5. Common Class/Type names (heuristic, case-sensitive)
  const types = [
    'String', 'Integer', 'Double', 'Boolean', 'List', 'ArrayList', 'LinkedList', 'Map', 'HashMap', 'Set', 'HashSet', 
    'System', 'Object', 'Exception', 'RuntimeException', 'Thread', 'Runnable', 'Optional', 'Stream', 'File',
    'InputStream', 'OutputStream', 'Reader', 'Writer', 'URL', 'Date', 'Calendar', 'BigDecimal', 'BigInteger'
  ];
  const typeRegex = new RegExp(`\\b(${types.join('|')})\\b`, 'g');
  html = html.replace(typeRegex, '<span class="text-cyan-400">$1</span>');

  // 6. Numbers (integers, decimals, scientific notation, hex, binary)
  html = html.replace(/\b(0[xX][0-9a-fA-F]+[lL]?|0[bB][01]+[lL]?|(?:[0-9]+\.[0-9]*|\.[0-9]+)(?:[eE][-+]?[0-9]+)?[fFdD]?|[0-9]+[fFdDlL]?)\b/g, '<span class="text-orange-400">$1</span>');
  
  // 7. Method calls (very heuristic: word followed by parenthesis, not a keyword/type)
  // This is tricky and can misidentify things. Kept simple.
  html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (match, p1) => {
    if (keywords.includes(p1) || types.includes(p1) || /^[A-Z]/.test(p1)) { // Avoid keywords, types, and potential constructors/classes
      return match;
    }
    return `<span class="text-white">${p1}</span>`;
  });


  return html.replace(/\n/g, '<br/>');
};
