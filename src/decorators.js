function createMutator(elementDescriptor, overwrite = false) {
  const { descriptor } = elementDescriptor;

  const newDescriptor = Object.assign({}, descriptor, {
    value(...args) {
      if (overwrite) {
        this.set(descriptor.value(this.state, ...args));
      } else {
        this.assign(descriptor.value(this.state, ...args));
      }
    },
  });

  return Object.assign({}, elementDescriptor, {
    descriptor: newDescriptor,
  });
}

export function assign(elementDescriptor) {
  return createMutator(elementDescriptor);
}

export function set(elementDescriptor) {
  return createMutator(elementDescriptor, true);
}
