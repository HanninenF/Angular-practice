class Point3 {
  constructor(private _x?: number, private _y?: number) {}

  draw() {
    console.log(`X:${this._x} Y:${this._y}`);
  }
  get x(): number | undefined {
    return this._x;
  }

  set x(value: number) {
    try {
      if (value < 0) throw new Error('Value cannot be less than 0');

      this._x = value;
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
  }
}

const point3 = new Point3(11, 2);
point3.draw();
point3.x = 10;
console.log(point3.x);
