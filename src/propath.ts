interface ProPathInstance<T, D> {
  has(obj: any) :boolean
  get(obj: any) :T|D|undefined
}

// TODO: WRITE TEST TO COVER FAILS

export default function ProPath<T=any, D=any>(path: string, defaultValue?: D) :ProPathInstance<T, D> {
  const handlers = path.split('.')
    .map<ComponentHandler>(comp => {
      const funHandler = FunctionHandler(comp, path);
      if (funHandler) return funHandler;
      const arrHandler = ArrayHandler(comp, path);
      if (arrHandler) return arrHandler;
      return ValueHandler(comp);
    });
  const lastIndex = handlers.length - 1;

  const has = (obj: any) :boolean => {
    if (!obj) return false;
    let current = obj;
    let returnValue = false;
    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
      if (i === lastIndex) {
        returnValue = handler.has(current);
      } else {
        const [hasNext, next] = handler.get(current);
        if (hasNext) {
          current = next;
        } else {
          return false;
        }
      }
    }
    return returnValue;
  };
  
  const get = (obj: any) :T|D|undefined => {
    if (!obj) return defaultValue;
    let current = obj;
    for (const handler of handlers) {
      // if (!current) return defaultValue; TODO: Test if this is not needed
      const [hasNext, next] = handler.get(current);
      if (hasNext) {
        current = next;
      } else {
        return defaultValue;
      }
    }
    return current;
  };

  return {
    has,
    get,
  };
}

interface ComponentHandler {
  // type: string
  has(obj: any) :boolean
  get(obj: any) :[boolean, any]
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
  const has = (obj: any) => typeof obj[fnName] === 'function';
  return {
    // type: 'FUN',
    has,
    get: (obj: any) => has(obj)
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
  const indexStr = comp.slice(openingSquareBrackets + 1, closingSquareBrackets);
  const index = Number.parseInt(indexStr);
  const has = (obj: any) => obj[arrName] instanceof Array;
  return {
    // type: 'ARR',
    has: (obj: any) => has(obj) && ((obj[arrName] as Array<any>).length > index),
    get: (obj: any) => has(obj)
      ? [true, obj[arrName][index]]
      : [false, undefined],
  };
}

const ValueHandler = (comp: string) :ComponentHandler => {
  const has = (obj: any) => typeof obj[comp] !== 'undefined';
  return {
    // type: 'VAL',
    has,
    get: (obj: any) => has(obj)
      ? [true, obj[comp]]
      : [false, undefined]
  };
};

