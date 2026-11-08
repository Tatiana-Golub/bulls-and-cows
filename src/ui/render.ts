import type { Store } from "./store.js";

export const mount = <S>(
  root: HTMLElement,
  store: Store<S>,
  view: (state: S) => Node,
): void => {
  const render = (state: S): void => root.replaceChildren(view(state));

  store.subscribe(render);
  render(store.getState());
};
