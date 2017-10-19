export function ctor (Ctor) {
  return function () {
    const instance = Object.create(Ctor.prototype)
    Ctor.apply(instance, arguments)
    return instance
  }
}

export function inherit (ParentCtor, Ctor, ...mixins) {
  Ctor.create = ctor(Ctor)
  if (ParentCtor) Ctor.prototype = Object.create(ParentCtor.prototype)
  Ctor.prototype.constructor = Ctor
  mixins.forEach((mixin) => {
    Object.assign(Ctor.prototype, mixin)
  })
}
