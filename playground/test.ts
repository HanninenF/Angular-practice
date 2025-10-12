let count = 5;
let b: boolean;
let c: string;
let d: any;
let e: number[] = [1, 2, 3];
let f: any[] = [1, true, 'a', false];

const colorRed = 0;
const colorGreen = 1;
const colorBlue = 2;

enum color {
  red = 0,
  green = 1,
  blue = 2,
}
let backgroundColor = color.green;

let message = 'abc';
let endsWithC = (<string>message).endsWith('c');
let alternativeWay = (message as string).endsWith('c');

console.log('hello', message);

const log = function (message: string) {
  console.log(message);
};

const doLog = (message: string) => console.log('arrow', message);

log('hello');
doLog('hello');

enum Key {
  x = 'x',
  y = 'y',
}

class Point {
  public constructor(x?: number, y?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
  }
  public inc = {
    incX: (incValue?: number): void => {
      this.x += incValue ?? 1;
    },
    incY: (incValue?: number): void => {
      this.y += incValue ?? 1;
    },
  };

  public dec = {
    decX: (decValue?: number): void => {
      this.x -= decValue ?? 1;
    },
    decY: (decValue?: number): void => {
      this.y -= decValue ?? 1;
    },
  };

  //key metod
  public keyInc(key: Key, v?: number) {
    this[key] += v ?? 1;
  }
  public keyDec(key: Key, v?: number): [Key, number] {
    this[key] -= v ?? 1;
    return [key, this[key]];
  }

  //enum metod

  public enumInc(key: Key, v?: number) {
    this[key as Key] += v ?? 1;
  }

  public draw = (): number => {
    return this.x + this.y;
  };

  public x: number;
  private y: number;
}

//behövs inte med class Point
/* const drawPoint = (point: Point) => {
  return point.x + point.y;
}; */
const point = new Point(5, 5);
point.inc.incX();
point.inc.incX();
point.inc.incX(2);
point.dec.decX(2);
point.dec.decX();
point.dec.decX();
point.keyInc(Key.x, 1);
point.enumInc(Key.x, 1);
console.log(point.draw());

const point2 = new Point(1, 2);

//proxy som ändrar värdet
const proxy = new Proxy(point2 as any, {
  get(target, prop, receiver) {
    const value = target[prop as keyof typeof target];

    if (typeof value !== 'function') return value;

    const bound = value.bind(target);

    if (prop === 'keyDec') {
      return new Proxy(bound, {
        apply(fn, thisArg, args: [Key, number?]) {
          // Byt 'x' ↔ 'y' innan vi anropar originalmetoden
          args[0] = args[0] !== Key.x ? Key.x : Key.y;

          return Reflect.apply(fn, thisArg, args);
        },
      });
    }

    return bound;
  },
});

//här blir x y istället, genom proxyn
console.log("proxy.keyDec('x')", proxy.keyDec('x'));
console.log(point2.x);

type Content = number;

// 🏷️ Etiketter (adresslappar) som pekar ut husets hyllor
enum ParcelLabel {
  LabelX = 'storageX',
  LabelY = 'storageY',
}

// 🔑 Hjälptyp för indexåtkomst mot klassens hyllor
type ShelfKey = 'storageX' | 'storageY';

// 📦 Paket: etikett + innehåll (hur mycket som ska påverka hyllan)
type Parcel = {
  label: ParcelLabel; // vilken hylla: storageX eller storageY
  content: Content; // hur mycket vi plockar av (doorA minskar)
};

// 🏠 Huset med två hyllor
class RealEstate {
  private storageX: number;
  private storageY: number;

  public constructor(initialX?: number, initialY?: number) {
    this.storageX = initialX ?? 0;
    this.storageY = initialY ?? 0;
  }

  // 🚪 Dörr A: tar emot ett paket och minskar hyllans värde med parcel.content
  public doorA(parcel: Parcel): [ParcelLabel, Content] {
    const key = parcel.label as unknown as ShelfKey; // 'storageX' | 'storageY'
    this[key] -= parcel.content;
    return [parcel.label, this[key]];
  }

  // 📊 Läs av hyllor (så vi kan logga före/efter)
  public shelves() {
    return { storageX: this.storageX, storageY: this.storageY };
  }
}

// 🏠 Skapa huset
const house = new RealEstate(5, 5);

// 👮‍♂️ Vakten vid grinden (Proxy runt huset)
const gateGuard = new Proxy(house as any, {
  get(houseTarget, door) {
    const doorHandle = houseTarget[door as keyof typeof houseTarget];

    // Om det inte är en funktion/dörr – släpp igenom värdet direkt
    if (typeof doorHandle !== 'function') return doorHandle;

    // Binda dörrhandtaget till huset (så this pekar rätt)
    const boundDoor = doorHandle.bind(houseTarget);

    // 🚪 Om det är just doorA, sätt en dörrvakt framför (funktion-proxy)
    if (door === 'doorA') {
      return new Proxy(boundDoor, {
        apply(
          doorFn: (parcel: Parcel) => [ParcelLabel, Content],
          thisHouse: RealEstate,
          args: [Parcel]
        ): [ParcelLabel, Content] {
          const incomingParcel = args[0];

          // 🏷️ Byt etikett X ↔ Y innan paketet släpps in
          const relabeled: Parcel = {
            ...incomingParcel,
            label:
              incomingParcel.label === ParcelLabel.LabelX ? ParcelLabel.LabelY : ParcelLabel.LabelX,
          };

          console.log('👮‍♂️ Dörrvakt bytte etiketten till:', relabeled.label);

          // Lämna in paketet till dörren med den nya etiketten
          return Reflect.apply(doorFn, thisHouse, [relabeled]);
        },
      });
    }

    // Andra dörrar: ingen extra vakt, kör som vanligt
    return boundDoor;
  },
});

// 🧪 Demo
console.log('FÖRE:', house.shelves());
// Vi säger att vi vill påverka X-hyllan, men dörrvakten byter etikett till Y
console.log(
  'gateGuard.doorA({ label: ParcelLabel.LabelX, content: 1 }) =>',
  gateGuard.doorA({ label: ParcelLabel.LabelX, content: 1 })
);
console.log('EFTER:', house.shelves());

// Exempelutskrift (ungefär):
// FÖRE:  { storageX: 5, storageY: 5 }
// 👮‍♂️ Dörrvakt bytte etiketten till: LabelY
// gateGuard.doorA(...) => [ 'LabelY', 4 ]
// EFTER: { storageX: 5, storageY: 4 }
