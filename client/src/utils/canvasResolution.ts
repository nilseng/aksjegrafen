export const getPixelRatio = (context: any) => {
    const backingStore =
        context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio ||
        1;

    return (window.devicePixelRatio || 1) / backingStore;
};

export const setCanvasStyleRatio = (canvas: HTMLCanvasElement | null, context: CanvasRenderingContext2D | null | undefined, viewWidth: number, viewHeight: number) => {
    if (!(canvas && context && viewWidth && viewHeight)) {
        console.error('Could not set canvas style ratio')
        return;
    };
    const ratio = getPixelRatio(context);
    const canvasWidth = getComputedStyle(canvas)
        .getPropertyValue("width")
        .slice(0, -2);
    const canvasHeight = getComputedStyle(canvas)
        .getPropertyValue("height")
        .slice(0, -2);
    canvas.width = +canvasWidth * ratio;
    canvas.height = +canvasHeight * ratio;
    canvas.style.width = `${viewWidth}px`;
    canvas.style.height = `${viewHeight}px`;
}