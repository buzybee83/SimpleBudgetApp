import React from 'react';
import { Dimensions } from 'react-native';
import { Path, G, Svg, Rect } from 'react-native-svg'
// M 50 300 C 150 400 300 400 400 300 C 500 200 650 200 750 300 L 750 500 L 50 500 Z
// M380.279 107.377C380.279 107.377 295.739 13.1031 187.625 107.25C79.5108 201.397 -1.97128 107.125 -1.97128 107.125L-1.89778 1.07516e-06L380.353 0.252415L380.279 107.377Z
const shapes = {
    pathBottom: "M 50 300 C 150 400 300 400 400 300 C 500 200 650 200 750 300 L 750 500 L 50 500 Z",
    pathTop: "M380.279 107.377C380.279 107.377 295.739 13.1031 187.625 107.25C79.5108 201.397 -1.97128 107.125 -1.97128 107.125L-1.89778 1.07516e-06L380.353 0.252415L380.279 107.377Z",
    pathBottomReverse: "M 800 300 C 700 450 500 450 400 300 C 300 150 100 150 0 300 L 0 500 L 800 500 Z"
}

const WaveShape = ({ style, path, fill, opacity, view, ...props }) => {
    const { width, height } = Dimensions.get("screen");
    return (
        <Svg style={[style]} {...props} width={width} height={height} viewBox={view}>
            <Path fill={fill} fillOpacity={opacity} d={shapes[path]}></Path>
        </Svg>
    );
};

export default WaveShape;