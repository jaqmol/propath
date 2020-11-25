interface ProPathAPI<T, D> {
  has(obj: any) :boolean
  get(obj: any) :T|D|undefined
  set(obj: any, value: any) :boolean
  delete(obj: any) :boolean
}

export default function ProPath<V=any, D=any>(path: string, defaultValue?: D) :ProPathAPI<V, D> {
  const handlers = path.split('.')
    .map<ComponentHandler>(comp => {
      const funHandler = FunctionHandler(comp, path);
      if (funHandler) return funHandler;
      const arrHandler = ArrayHandler(comp, path);
      if (arrHandler) return arrHandler;
      return ValueHandler(comp);
    });
  const lastIndex = handlers.length - 1;
  
  const has = WithLastHandlerFn<boolean, boolean>(
    handlers,
    lastIndex,
    (handler: ComponentHandler, current: any) => handler.has(current),
    false,
  );

  const get = WithLastHandlerFn<V, D|undefined>(
    handlers,
    lastIndex,
    (handler: ComponentHandler, current: any) => {
      const [hasNext, next] = handler.get(current);
      if (hasNext) return next;
      return defaultValue;
    },
    defaultValue,
  );
  
  const set = WithLastHandlerFn<boolean, boolean>(
    handlers,
    lastIndex,
    (handler: ComponentHandler, current: any, value: any) => handler.set(current, value),
    false,
  );

  const remove = WithLastHandlerFn<boolean, boolean>(
    handlers,
    lastIndex,
    (handler: ComponentHandler, current: any) => handler.delete(current),
    false,
  );

  return {
    has,
    get,
    set,
    delete: remove,
  };
}

const WithLastHandlerFn = <L, N>(
  handlers: ComponentHandler[],
  lastIndex: number,
  lastHandler: (handler: ComponentHandler, current: any, ctx?: any) => L,
  noNextValue: N,
) => (
  obj: any,
  ctx?: any,
) :L|N => {
  if (!obj) return noNextValue;
  let current = obj;
  for (let i = 0; i < lastIndex; i++) {
    const handler = handlers[i];
    const [hasNext, next] = handler.get(current);
    if (hasNext) {
      current = next;
    } else {
      return noNextValue;
    }
  }
  return lastHandler(handlers[lastIndex], current, ctx);
};

const DeleteFn = (
  has: (obj: any) => boolean,
  propName: string,
) => (obj: any) => {
  if (has(obj)) {
    delete obj[propName];
    return true;
  }
  return false;
};

interface ComponentHandler {
  has(obj: any) :boolean
  get(obj: any) :[boolean, any]
  set(obj: any, value: any) :boolean
  delete(obj: any) :boolean
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
    has,
    get: (obj: any) => has(obj)
      ? [true, obj[fnName](...args)]
      : [false, undefined],
    set: () => false,
    delete: DeleteFn(has, fnName),
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
  const has = (obj: any) => 
    (obj[arrName] instanceof Array) && 
    ((obj[arrName] as Array<any>).length > index);
  return {
    has,
    get: (obj: any) => has(obj) 
      ? [true, obj[arrName][index]]
      : [false, undefined],
    set: (obj: any, value: any) => {
      if (has(obj)) {
        obj[arrName][index] = value;
        return true;
      }
      return false;
    },
    delete: DeleteFn(has, arrName),
  };
}

const ValueHandler = (comp: string) :ComponentHandler => {
  const has = (obj: any) => typeof obj[comp] !== 'undefined';
  return {
    has,
    get: (obj: any) => has(obj)
      ? [true, obj[comp]]
      : [false, undefined],
    set: (obj: any, value: any) => {
      if (has(obj)) {
        obj[comp] = value;
        return true;
      }
      return false;
    },
    delete: DeleteFn(has, comp),
  };
};

