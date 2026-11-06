export type Listener<S> = (state: S) => void;

export type Store<S> = {
  readonly getState: () => S;
  readonly update: (transform: (state: S) => S) => void;
  readonly subscribe: (listener: Listener<S>) => () => void;
};

export const createStore = <S>(initial: S): Store<S> => {
  let state = initial;
  let listeners: readonly Listener<S>[] = [];

  return {
    getState: () => state,

    update: (transform) => {
      const next = transform(state);
      if (next === state) return;
      state = next;
      listeners.forEach((listener) => listener(state));
    },

    subscribe: (listener) => {
      listeners = [...listeners, listener];
      return () => {
        listeners = listeners.filter((item) => item !== listener);
      };
    },
  };
};
