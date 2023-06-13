export interface INodeDimensions {
  width: number;
  height: number;
}

export interface IGraphDimensions {
  width: number;
  height: number;
  nodeDimensions: INodeDimensions;
}

export const graphConfig: IGraphDimensions = {
  width: 1000,
  height: 1000,
  nodeDimensions: {
    width: 180,
    height: 120,
  },
};
