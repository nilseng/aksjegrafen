import { ICompany } from "../../models/models";

const company: ICompany = {
    _id: "61229a9bc79b48b7e30c24c5",
    orgnr: "924532831",
    name: "PUREOKRS AS",
    stocks: 30000,
};

const fontSize = 32;
const font = `normal normal bold ${fontSize}px arial`;
const borderRadius = 20;

export const drawNode = (
    canvas: HTMLCanvasElement,
    theme: any
) => {
    const context = canvas?.getContext("2d");
    if (!context) return;
    const x = canvas.width / 2;
    const y = canvas.height / 4;
    const rectWidth = 400;
    const rectHeight = 200;
    const rectOffset = {
        x: rectWidth / 2,
        y: rectHeight / 2,
    };
    const borderOffset = borderRadius / 2;

    context.font = font;
    const textOffset = {
        x: context.measureText(company.name).width / 2,
        y: fontSize / 2,
    };

    context.fillStyle = theme.backgroundSecondary;
    context.lineJoin = "round";
    context.lineWidth = borderRadius;
    context.fillRect(x - rectOffset.x, y - rectOffset.y, rectWidth, rectHeight);
    context.strokeStyle = theme.backgroundSecondary;
    context.strokeRect(
        x - rectOffset.x - borderOffset,
        y - rectOffset.y - borderOffset,
        rectWidth + borderRadius,
        rectHeight + borderRadius
    );

    context.fillStyle = theme.primary;

    context.fillText(company.name, x - textOffset.x, y + textOffset.y);
};