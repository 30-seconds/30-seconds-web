/** Get the textual content in a gatsby page */
const getTextualContent = (str, noExplain = false) => {
  const result = str.slice(0, str.indexOf('<div class="gatsby-highlight"'));
  if (noExplain)
    return result.slice(0, result.lastIndexOf('<p>'));
  return result;
};

/** Gets the code blocks in a gatsby page */
const getCodeBlocks = (str, language) => {
  const regex = /<pre[.\S\s]*?<\/pre>/g;
  let results = [];
  let m = null;
  while ((m = regex.exec(str)) !== null) {
    if (m.index === regex.lastIndex) regex.lastIndex += 1;
    // eslint-disable-next-line
    m.forEach((match, groupIndex) => {
      results.push(match);
    });
  }
  const replacer = new RegExp(
    `<pre class="language-${language}"><code class="language-${language}">([\\s\\S]*?)</code></pre>`,
    'g'
  );
  results = results.map(v => v.replace(replacer, '$1').trim());
  return {
    code: results[0],
    example: results[1],
  };
};

/** Optimizes nodes in an HTML string */
const optimizeNodes = (data, regexp, replacer) => {
  let count = 0;
  let output = data;
  do {
    output = output.replace(regexp, replacer);
    count = 0;
    while (regexp.exec(output) !== null)++count;
  } while (count > 0);
  return output;
};

/** Optimizes all nodes in an HTML string */
const optimizeAllNodes = html => {
  let output = html;
  // Optimize punctuation nodes
  output = optimizeNodes(
    output,
    /<span class="token punctuation">([^\0<]*?)<\/span>([\n\r\s]*)<span class="token punctuation">([^\0]*?)<\/span>/gm,
    (match, p1, p2, p3) =>
      `<span class="token punctuation">${p1}${p2}${p3}</span>`
  );
  // Optimize operator nodes
  output = optimizeNodes(
    output,
    /<span class="token operator">([^\0<]*?)<\/span>([\n\r\s]*)<span class="token operator">([^\0]*?)<\/span>/gm,
    (match, p1, p2, p3) =>
      `<span class="token operator">${p1}${p2}${p3}</span>`
  );
  // Optimize keyword nodes
  output = optimizeNodes(
    output,
    /<span class="token keyword">([^\0<]*?)<\/span>([\n\r\s]*)<span class="token keyword">([^\0]*?)<\/span>/gm,
    (match, p1, p2, p3) => `<span class="token keyword">${p1}${p2}${p3}</span>`
  );
  return output;
};

const parseHtml = (
  str,
  {
    language,
  }
) => {
  const description = getTextualContent(str, true);
  const fullDescription = getTextualContent(str, false);
  const codeBlocks = getCodeBlocks(str, language);
  return {
    description,
    fullDescription,
    code: `${optimizeAllNodes(codeBlocks.code)}`,
    example: `${optimizeAllNodes(codeBlocks.example)}`,
  };
};

export default parseHtml;
