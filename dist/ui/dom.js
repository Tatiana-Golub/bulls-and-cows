const toNodes = (child) => {
    if (Array.isArray(child))
        return child.flatMap(toNodes);
    if (child === null || child === undefined || child === false)
        return [];
    return [child];
};
export const h = (tag, props = {}, ...children) => {
    const element = document.createElement(tag);
    if (props.className !== undefined)
        element.className = props.className;
    Object.entries(props.attrs ?? {}).forEach(([name, value]) => {
        if (value === undefined || value === false)
            return;
        element.setAttribute(name, value === true ? "" : String(value));
    });
    Object.entries(props.on ?? {}).forEach(([name, handler]) => {
        if (handler !== undefined)
            element.addEventListener(name, handler);
    });
    element.append(...children.flatMap(toNodes));
    return element;
};
