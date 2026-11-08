export const mount = (root, store, view) => {
    const render = (state) => root.replaceChildren(view(state));
    store.subscribe(render);
    render(store.getState());
};
