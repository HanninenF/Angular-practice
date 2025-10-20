const gateGuard1 = new Proxy(house as any, {
  get(houseTarget, door) {
    const doorHandle = houseTarget[door as keyof typeof houseTarget];

    // Om det inte är en funktion/dörr – släpp igenom värdet direkt
    if (typeof doorHandle !== 'function') return doorHandle;

    // Binda dörrhandtaget till huset (så this pekar rätt)
    const installedDoorHandle = doorHandle.bind(houseTarget);

    // 🚪 Om det är just doorA, sätt en dörrvakt framför (funktion-proxy)
    if (door === 'doorA') {
      return new Proxy(installedDoorHandle, {
        apply(
          doorFn: (parcel: Parcel) => [ParcelLabel, Content],
          targetHouse: RealEstate,
          parcelPallet: [Parcel]
        ): [ParcelLabel, Content] {
          const incomingParcel = parcelPallet[0];

          // 🏷️ Byt etikett X ↔ Y innan paketet släpps in
          const relabeled: Parcel = {
            ...incomingParcel,
            label:
              incomingParcel.label === ParcelLabel.LabelX ? ParcelLabel.LabelY : ParcelLabel.LabelX,
          };

          console.log('👮‍♂️ Dörrvakt bytte etiketten till:', relabeled.label);

          // Lämna in paketet till dörren med den nya etiketten
          return Reflect.apply(doorFn, targetHouse, [relabeled]);
        },
      });
    }

    // Andra dörrar: ingen extra vakt, kör som vanligt
    return installedDoorHandle;
  },
});
