import ProPath from "../src/propath"

const cau2018Obj = () => ({
  Dracohors: {
    Silesauridae: {
      Pisanosaurus: 1901,
    },
     Herrerasauria: {
      Tawa: 1096,
      Daemonosaurus: 1618,
      Staurikosaurus: 1283,
      Herrerasaurus: 1305,
      Sanjuansaurus: 1558,
    },
    Dinosauria: {
      Sauropodomorpha: 1757,
      Eodromaeus: 1383,
      Ornithoscelida: {
        Ornithischia: 1694,
        Theropoda: 1124
      },
    },
  }
});

const cau2018Arr = () => ({
  Dracohors: {
    Silesauridae: {
      Pisanosaurus: 1901,
    },
     Herrerasauria: [
      'Tawa',
      'Daemonosaurus',
      'Staurikosaurus',
      'Herrerasaurus',
      'Sanjuansaurus',
    ],
    Dinosauria: {
      Sauropodomorpha: 1757,
      Eodromaeus: 1383,
      Ornithoscelida: {
        Ornithischia: 1694,
        Theropoda: 1124
      },
    },
  }
});

const cau2018Fun = () => {
  const orni = {
    Ornithischia: 1694,
    Theropoda: 1124
  };
  return {
    Dracohors: {
      Silesauridae: {
        Pisanosaurus: 1901,
      },
       Herrerasauria: {
        Tawa: 1096,
        Daemonosaurus: 1618,
        Staurikosaurus: 1283,
        Herrerasaurus: 1305,
        Sanjuansaurus: 1558,
      },
      Dinosauria: [
        {
          Sauropodomorpha: 1757,
          Eodromaeus: 1383,
          Ornithoscelida: () => orni,
        },
      ],
    }
  };
};

describe("ProPath test", () => {
  it("Is instantiable", () => {
    const pp = ProPath('');
    expect(pp).toHaveProperty('get');
  });

  it("Performs has value path", () => {
    const obj = cau2018Obj();
    const daemonosaurus = ProPath('Dracohors.Herrerasauria.Daemonosaurus');
    expect(daemonosaurus.has(obj)).toBe(true);
  });
  it("Performs get value path", () => {
    const obj = cau2018Obj();
    const daemonosaurus = ProPath<number>('Dracohors.Herrerasauria.Daemonosaurus', -1);
    expect(daemonosaurus.get(obj)).toBe(1618);
  });
  it("Performs set value path", () => {
    const obj = cau2018Obj();
    const daemonosaurus = ProPath<number>('Dracohors.Herrerasauria.Daemonosaurus', -1);
    const didSet = daemonosaurus.set(obj, 9977);
    expect(didSet).toBe(true);
    expect(daemonosaurus.get(obj)).toBe(9977);
  });

  it("Performs has path with array indexes", () => {
    const obj = cau2018Arr();
    const daemonosaurus = ProPath('Dracohors.Herrerasauria[1]');
    expect(daemonosaurus.has(obj)).toBe(true);
  });
  it("Performs get path with array indexes", () => {
    const obj = cau2018Arr();
    const daemonosaurus = ProPath<number>('Dracohors.Herrerasauria[1]', -1);
    expect(daemonosaurus.get(obj)).toEqual('Daemonosaurus');
  });
  it("Performs set path with array indexes", () => {
    const obj = cau2018Arr();
    const daemonosaurus = ProPath<number>('Dracohors.Herrerasauria[1]', -1);
    const didSet = daemonosaurus.set(obj, 'Daemonosaurus_9977');
    expect(didSet).toBe(true);
    expect(daemonosaurus.get(obj)).toEqual('Daemonosaurus_9977');
  });

  it("Performs has path with array indexes and function calls", () => {
    const obj = cau2018Fun();
    const theropoda = ProPath('Dracohors.Dinosauria[0].Ornithoscelida().Theropoda');
    expect(theropoda.has(obj)).toBe(true);
  });
  it("Performs get path with array indexes and function calls", () => {
    const obj = cau2018Fun();
    const theropoda = ProPath<number>('Dracohors.Dinosauria[0].Ornithoscelida().Theropoda', -1);
    expect(theropoda.get(obj)).toBe(1124);
  });
  it("Performs set path with array indexes and function calls", () => {
    const obj = cau2018Fun();
    const theropoda = ProPath<number>('Dracohors.Dinosauria[0].Ornithoscelida().Theropoda', -1);
    const didSet = theropoda.set(obj, 9977);
    expect(didSet).toBe(true);
    expect(theropoda.get(obj)).toBe(9977);
  });

  it("Fails correctly on wrong indexes", () => {
    const obj = cau2018Fun();
    const theropodaOrUndefined = ProPath<number>('Dracohors.Dinosauria[1].Ornithoscelida().Theropoda');
    const theropodaOr123 = ProPath<number>('Dracohors.Dinosauria[2].Ornithoscelida().Theropoda', 123);
    const theropodaOrNull = ProPath<number>('Dracohors.Dinosauria[3].Ornithoscelida().Theropoda', null);
    const shouldBeUndefined = theropodaOrUndefined.get(obj);
    const shouldBe123 = theropodaOr123.get(obj);
    const shouldBeNull = theropodaOrNull.get(obj);
    expect(shouldBeUndefined).toBeUndefined();
    expect(shouldBe123).toBe(123);
    expect(shouldBeNull).toBe(null);
  });

  it("Runs the readme examples", () => {
    const pp = ProPath;

    const obj = {
      a: {
        b: "f",
        c: ["g", "h"],
        d: () => 'i',
        e: (j: string) => `${j}_k`,
      },
    };

    // Parse path
    const ab = pp('a.b');

    // Get value
    let value = ab.get(obj); // value === "f"
    expect(value).toEqual("f");
    
    // Return undefined if path doesn't exist
    const alm12 = pp('a.l.m[12]');
    value = alm12.get(obj); // typeof value === "undefined"
    expect(value).toBeUndefined();
    
    // Return predictable value if path doesn't exist
    const ano0pOrHello = pp('a.n.o[0].p()', 'Hello');
    value = ano0pOrHello.get(obj); // value === "Hello"
    expect(value).toEqual('Hello');

    // Set value
    ab.set(obj, "l");
    value = ab.get(obj); // value === "l"
    expect(value).toEqual("l");

    // Has value
    let hasAB = ab.has(obj); // hasAB === true
    expect(hasAB).toBe(true);
    const hasABC = pp('a.b.c').has(obj); // hasABC === false
    expect(hasABC).toBe(false);

    // Delete value
    ab.delete(obj); // returns true if ab was found and deleted
    hasAB = ab.has(obj); // hasAB === false
    expect(hasAB).toBe(false);

    // Get value from array
    const ac0 = pp('a.c[0]');
    value = ac0.get(obj); // value === "g"
    expect(value).toEqual("g");
    value = pp('a.c[1]').get(obj); // value === "h"
    expect(value).toEqual("h");

    // Set value on array
    ac0.set(obj, 'm');
    value = ac0.get(obj); // value === "m"
    expect(value).toEqual("m");

    // Get value from function
    const ad = pp('a.d()');
    value = ad.get(obj); // value === "i"
    expect(value).toEqual("i");

    // Get value from parametrized function
    const param = 'n';
    value = pp(`a.e("${param}")`).get(obj); // value === "n_k"
    expect(value).toEqual("n_k");
    // -> Parameters are provided in JSON syntax
  });
});
