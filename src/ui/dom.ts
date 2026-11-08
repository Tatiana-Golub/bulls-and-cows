export type Child = Node | string | false | null | undefined | Child[];

export type Handlers = {
  [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void;
};

export type Props = {
  readonly className?: string;
  readonly attrs?: Readonly<Record<string, string | number | boolean | undefined>>;
  readonly on?: Handlers;
};

const toNodes = (child: Child): readonly (Node | string)[] => {
  if (Array.isArray(child)) return child.flatMap(toNodes);
  if (child === null || child === undefined || child === false) return [];
  return [child];
};

export const h = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  ...children: readonly Child[]
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);

  if (props.className !== undefined) element.className = props.className;

  Object.entries(props.attrs ?? {}).forEach(([name, value]) => {
    if (value === undefined || value === false) return;
    element.setAttribute(name, value === true ? "" : String(value));
  });

  Object.entries(props.on ?? {}).forEach(([name, handler]) => {
    if (handler !== undefined) element.addEventListener(name, handler as EventListener);
  });

  element.append(...children.flatMap(toNodes));
  return element;
};
