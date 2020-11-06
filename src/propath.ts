interface ProPathInstance<T> {
  get(obj: any) :T|undefined
}


export default function ProPath<T>(path: string, defaultValue?: T) :ProPathInstance<T> {
  const handlers = path.split('.')
    .map<ComponentHandler>(comp => {
      const funHandler = FunctionHandler(comp, path);
      if (funHandler) return funHandler;
      const arrHandler = ArrayHandler(comp, path);
      if (arrHandler) return arrHandler;
      return ValueHandler(comp);
    });

  const get = (obj: any) :T|undefined => {
    if (!obj) return defaultValue;

    let current = obj;

    for (const handler of handlers) {
      if (!current) return defaultValue;

      const [hasNext, next] = handler.processGet(obj);
      if (hasNext) {
        current = next;
      } else {
        return defaultValue;
      }
    }
    return current;
  };

  return {
    get,
  };
}

interface ComponentHandler {
  // processHas(obj: any) :boolean
  processGet(obj: any) :[boolean, any]
  // processSet(obj: any, value: any) :boolean
  // processDelete(obj: any) :[boolean, any]
}

function FunctionHandler(comp: string, path: string) : ComponentHandler|null {
  const openingRoundBrackets = comp.indexOf('(');
  if (openingRoundBrackets === -1) return null;
  const closingRoundBrackets = comp.indexOf(')');
  if ((closingRoundBrackets === -1) || (closingRoundBrackets < openingRoundBrackets)) {
    throw new Error(`Malformed function call "${comp}" in property path "${path}"`);
  }
  const fnName = comp.slice(0, openingRoundBrackets);
  const argsStr = comp.slice(openingRoundBrackets + 1, closingRoundBrackets);
  const args = JSON.parse(`[${argsStr}]`);
  return {
    processGet: (obj: any) => typeof obj[fnName] === 'function'
      ? [true, obj[fnName](...args)]
      : [false, undefined],
  };
}

function ArrayHandler(comp: string, path: string) : ComponentHandler|null {
  const openingSquareBrackets = comp.indexOf('[');
  if (openingSquareBrackets === -1) return null;
  const closingSquareBrackets = comp.indexOf(']');
  if ((closingSquareBrackets === -1) || (closingSquareBrackets < openingSquareBrackets)) {
    throw new Error(`Malformed array indexing "${comp}" in property path "${path}"`);
  }
  const arrName = comp.slice(0, openingSquareBrackets);
  const idxStr = comp.slice(openingSquareBrackets + 1, closingSquareBrackets);
  const idx = Number.parseInt(idxStr);
  return {
    processGet: (obj: any) => obj[arrName] instanceof Array
      ? [true, obj[arrName][idx]]
      : [false, undefined],
  };
}

const ValueHandler = (comp: string) :ComponentHandler => ({
  processGet: (obj: any) => typeof obj[comp] !== 'undefined'
    ? [true, obj[comp]]
    : [false, undefined],
});

