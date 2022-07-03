const setStyleProperty = function(property, value) {
    document.documentElement.style.setProperty(`--${property}`, value);
}
const getStyleProperty = function(property) {
    document.documentElement.style.getPropertyValue(`--${property}`);
}
const getPercent = function(percent, start, length) {
    return Math.max(0, Math.min(1, (percent - start) / length))
}

export { setStyleProperty, getStyleProperty, getPercent };