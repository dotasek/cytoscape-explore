import React, { Component } from 'react';
import _ from 'lodash';
import colorConvert from 'color-convert';
import classNames from 'classnames';
import Color from 'color';
import PropTypes from 'prop-types';
import { mapColor } from '../../../model/style';


// TODO improve defaults
// TODO move default colors into style.js ??
const linearHues = {
  hues: [ 0, 30, /*60,*/ 120, 180, 240, 300 ],
  minSat: 50,
  maxSat: 50,
  minLight: 40,
  maxLight: 80,
};

// TODO, divergent gradients not properly supported yet
const colorBrewerDivergent = [
  {start:[202,0,32],   mid:[247,247,247], end:[5,113,176]}, // RdBu
  {start:[230,97,1],   mid:[247,247,247], end:[94,60,153]}, // PuOr
  // {start:[123,50,148], mid:[247,247,247], end:[0,136,55]},  // PRGn
  {start:[166,97,26],  mid:[245,245,245], end:[1,133,113]}, // BrBG
  {start:[252,141,89],  mid:[255,255,191], end:[145,191,219]}, // 3-class RdYlBu
];

function rgbCss(c) {
  return Color(c).rgb().string();
}

export const defaultColor = {r:136,g:136,b:136}; // same as the #888 from the default style in style.js


export function ColorSwatch(props) {
  return (
    <div 
      className={classNames({ 
        'color-swatches-color': true, 
        'color-swatches-color-selected': props.selected
      })}
      onClick = {() => props.onClick(props.color) }
      style={{ backgroundColor: rgbCss(props.color) }} >
    </div>
  );
}

ColorSwatch.propTypes = {
  onClick: PropTypes.func,
  selected: PropTypes.any,
  color: PropTypes.any
};
ColorSwatch.defaultProps = {
  onClick: () => null,
  selected: false,
  color: defaultColor,
};


export class ColorSwatches extends Component {
  constructor(props) {
    super(props);

    const { minSat, maxSat, minLight, maxLight } = linearHues;
    const range = 5;

    this.groups = linearHues.hues.map(hue => {
      const colors = [];
      for(let i = 0; i < range; i++) {
        const p = i / (range - 1);
        const s = minSat + (maxSat - minSat) * p;
        const l = minLight + (maxLight - minLight) * p;
        const [r, g, b] = colorConvert.hsl.rgb(hue, s, l);
        colors.push({ r, g, b });
      }
      return { hue, colors };
    });

    // Monochrome
    this.groups.push({
      hue: 0,
      colors: [
        {r:40, g:40, b:40 },
        {r:100,g:100,b:100},
        defaultColor,
        {r:200,g:200,b:200},
        {r:230,g:230,b:230},
      ]
    });
  }

  render() {
    return (
      <div className="color-swatches">
        { this.groups.map((group, i) => 
          <div key={`group-${i}`} className="color-swatches-hue">
            { group.colors.map((c, i) => 
                <ColorSwatch 
                  color={c}
                  key={`swatch-${i}`}
                  selected={_.isEqual(this.props.selected, c)} 
                  onClick={this.props.onSelect} />
            )}
          </div>
        )}
      </div>
    );
  }
}

ColorSwatches.propTypes = {
  selected: PropTypes.any,
  onSelect: PropTypes.func
};


export function ColorGradient(props) {
  const { styleValue1, styleValue2, styleValue3 } = props.value;

  let colors;
  if(!styleValue3) {
    colors = _.range(7).map(x => mapColor(x, 0, 6, styleValue1, styleValue2));
  } else {
    colors = [].concat(
      _.range(0,3).map(x => mapColor(x, 0, 3, styleValue1, styleValue2)),
      styleValue2,
      _.range(1,4).map(x => mapColor(x, 0, 3, styleValue2, styleValue3))
    );
  }

  return (
      <div 
        className={classNames({ 
          'color-gradients-squares': true, 
          'color-gradients-squares-selected': props.selected
        })}
        onClick = {() => props.onSelect(props.value)}
      >
        {colors.map((c,i) =>
          <div
            key={i}
            className='color-gradients-squares-item'
            style={{ backgroundColor: rgbCss(c) }} 
          />
        )}
      </div>
  );
}

ColorGradient.propTypes = {
  value: PropTypes.instanceOf({
    styleValue1: PropTypes.any,
    styleValue2: PropTypes.any,
    styleValue3: PropTypes.any
  }),
  onSelect: PropTypes.func,
  selected: PropTypes.any
};


export function ColorGradients(props) {
  const { minSat, maxSat, minLight, maxLight } = linearHues;

  const linearGradients = linearHues.hues.map(hue => {
    const s = colorConvert.hsl.rgb(hue, maxSat, maxLight);
    const e = colorConvert.hsl.rgb(hue, minSat, minLight);
    return {
      styleValue1: { r: s[0], g: s[1], b: s[2] },
      styleValue2: { r: e[0], g: e[1], b: e[2] },
    };
  });

  const divGrads = () => 
    colorBrewerDivergent.map(val => {
      const {start:[r1,g1,b1], mid:[r2,g2,b2], end:[r3,g3,b3]} = val;
      return {
        styleValue1: {r:r1, g:g1, b:b1},
        styleValue2: {r:r2, g:g2, b:b2},
        styleValue3: {r:r3, g:g3, b:b3},
      };
    });

  return (
    <div className="color-gradients">
      { !props.divergent ? null : <div>Linear</div> }
      <div>
      { linearGradients.map((value, i) => 
          <ColorGradient 
            value={value} 
            key={i}
            selected={_.isMatch(props.selected, value)}
            onSelect={props.onSelect} />
      )}
      </div>
      { !props.divergent ? null :
        <div>
          <div>Divergent</div>
          <div>
          { divGrads().map((value, i) => 
              <ColorGradient 
                value={value} 
                key={i}
                selected={_.isMatch(props.selected, value)} 
                onSelect={props.onSelect} />
          )}
          </div>
        </div>
      }
    </div>
  );
}

ColorGradients.propTypes = {
  onSelect: PropTypes.func,
  selected: PropTypes.any,
  divergent: PropTypes.bool,
};