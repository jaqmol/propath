# propath

Access deep property-values, arrays and functions using a path. Written in TypeScript. Paths are parsed for performance.

## Install

### Node.js

```
npm install propath --save
```

## Usage

```javascript
import pp from "propath";

const obj = {
  a: {
    b: "f",
    c: ["g", "h"],
    d: () => 'i',
    e: j => `${j}_k`,
  },
};

// Parse path
const ab = pp('a.b');

// Get value
let value = ab.get(obj); // value === "f"

// Set value
ab.set(obj, "l");
value = ab.get(obj); // value === "l"

// Has value
let hasAB = ab.has(obj); // hasAB === true
const hasABC = pp('a.b.c').has(obj); // hasABC === false

// Delete value
ab.delete(obj); // returns true if ab was found and deleted
hasAB = ab.has(obj); // hasAB === false

// Get value from array
const ac0 = pp('a.c[0]');
value = ac0.get(obj); // value === "g"
value = pp('a.c[1]').get(obj); // value === "h"

// Set value on array
ac0.set(obj, 'm');
value = ac0.get(obj); // value === "m"

// Get value from function
const ad = pp('a.d()');
value = ad.get(obj) // value === "i"

// Get value from parametrized function
const param = 'n';
value = pp(`a.e("${param}")`).get(); // value === "n_k"
// -> Parameters are provided in JSON syntax
```

### How propath deals with inherited properties

Propath doesn't differentiate between inherited and own properties.

## Full API + examples

### Import propath

```typescript
import pp from "propath";
```

### Parse property-path / instantiate propath

```typescript
const ab = pp<V, D>('a.b', 'DEFAULT');
```

- **Type V** is the value type, the path is expected to return
- **Type D** is the value type of the default value

Default value parameter is optional.

### Property-path syntax

#### Value access

```javascript
a.b.c.d.e
```

Values access is done by property-names separated by dots `.`.

#### Array index

```javascript
a.b[5]
```

Value access is done by index number in square brackets `[` and `]`.

#### Function call

```javascript
a.b.c()
a.b.c("STRING", 6.7, false)
```

Calling functions is done by parameters in round brackets `(` and `)`.
- Function calls cannot be nested, but can contain whitespace.
- Parameters must be in JSON syntax, strings must be double quoted with `"`

### API

### `pp<T, D>(path :string, defaultValue :D) :<instance>`

If `propath` is imported as the name `pp`, it is called as a function with optional type parameters `T` specifying the type returned by the path and `D` specifying the type of the default value. 
- `D` can be omitted while `T` is provided. 
- Neither `T` nor `D` must be provided. 
- If `T` is omitted, return-type of `.get` will be `any`. 
- Default value can be omitted.

### `.get(<obj>) :T|any|D|undefined`

Traverses the path, returns the value found in `<obj>` if the path can be traversed completely. If it cannot, the default value or `undefined` is returned.

### `.set(<obj>, value) :boolean`

Traverses the path, sets the value if the path can be traversed completely in `<obj>`. If it cannot, `false` is returned.

### `.has(<obj>) :boolean`

Traverses the path, return `true` if the path can be traversed completely in `<obj>`. If it cannot, `false` is returned.

### `.delete(<obj>) :boolean`

Traverses the path, deletes the value and returns `true` if the path can be traversed completely in `<obj>`. If it cannot, `false` is returned.
