export const createStore = (initial) => {
    let state = initial;
    let listeners = [];
    return {
        getState: () => state,
        update: (transform) => {
            const next = transform(state);
            if (next === state)
                return;
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
