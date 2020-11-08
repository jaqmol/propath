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
