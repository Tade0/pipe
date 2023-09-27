const METHOD_CALL = Symbol('Pipe Object');
const PROP_NAME = Symbol('Prop name');

/**
 * Accepts an unary function returing an array of functions/values to be piped.
 * 
 * The argument passed to this function is a proxy object representing the intermediate result.
 * 
 * ```
 * pipeSync((p) => ([
 *   "hello",
 *   p.concat("!"),
 *   (s) => s.toUpperCase()
 * ])); // returns "HELLO!"
 * ```

 * 
 * @param {Function} pipingFun 
 * @returns 
 */
function pipeSync(pipingFun) {
  let result = undefined;

  const proxy = new Proxy({}, {
    get: (_target, prop) => {
      const proxied = (...arguments) => {
        return {
          [PROP_NAME]: prop,
          [METHOD_CALL]: true,
          arguments,
        }
      };

      proxied[PROP_NAME] = prop;

      return proxied;
    }
  });

  pipingFun(proxy).forEach(item => {
    if (item[METHOD_CALL]) {
      result = result[item[PROP_NAME]](...item.arguments);

      return;
    }

    if (item[PROP_NAME]) {
      result = result[item[PROP_NAME]];

      return;
    }

    if (typeof item === 'function') {
      result = item(result);

      return;
    }

    result = item;
  });

  return result;
}

pipeSync((p) => ([
  "hello",
  p.concat("!"),
  (s) => s.toUpperCase()
])); // returns "HELLO!"