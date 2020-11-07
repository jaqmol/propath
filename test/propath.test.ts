import PropPath from "../src/propath"

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

const cau2018Fun = () => ({
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
        Ornithoscelida: () => ({
          Ornithischia: 1694,
          Theropoda: 1124
        }),
      },
    ],
  }
});

describe("PropPath test", () => {
  it("Is instantiable", () => {
    const pp = PropPath('');
    expect(pp).toHaveProperty('get');
  });
  it("Performs has value paths", () => {
    const obj = cau2018Obj();
    const daemonosaurus = PropPath('Dracohors.Herrerasauria.Daemonosaurus');
    expect(daemonosaurus.has(obj)).toBe(true);
  });
  it("Performs get value paths", () => {
    const obj = cau2018Obj();
    const daemonosaurus = PropPath<number>('Dracohors.Herrerasauria.Daemonosaurus', -1);
    expect(daemonosaurus.get(obj)).toBe(1618);
  });
  it("Performs has paths with array indexes", () => {
    const obj = cau2018Arr();
    const daemonosaurus = PropPath('Dracohors.Herrerasauria[1]');
    expect(daemonosaurus.has(obj)).toBe(true);
  });
  it("Performs get paths with array indexes", () => {
    const obj = cau2018Arr();
    const daemonosaurus = PropPath<number>('Dracohors.Herrerasauria[1]', -1);
    expect(daemonosaurus.get(obj)).toEqual('Daemonosaurus');
  });
  it("Performs has paths with array indexes and function calls", () => {
    const obj = cau2018Fun();
    const theropoda = PropPath('Dracohors.Dinosauria[0].Ornithoscelida().Theropoda');
    expect(theropoda.has(obj)).toBe(true);
  });
  it("Performs get paths with array indexes and function calls", () => {
    const obj = cau2018Fun();
    const theropoda = PropPath<number>('Dracohors.Dinosauria[0].Ornithoscelida().Theropoda', -1);
    expect(theropoda.get(obj)).toBe(1124);
  });
});
