import React, { Component } from 'react';
import _ from 'lodash';
import * as R from 'ramda';
import * as keyboard from 'keyboard-handler'
import './App.css';

// configuration

const CONFIG = {
  rows: 10,
  columns: 10,
  color: 'grey',
  scrollDownInterval: 700
};

// create panel

const addRowColumn = (panel) => (
  panel.map((rows, rIndex) => (
    rows.map((item, cIndex) => (
      Object.assign(item, { row: rIndex, column: cIndex })
    ))
  ))
);

const createItem = (config = CONFIG) => ({ color: config.color });
const repeatItem = (initData, config = CONFIG) => (
  R.repeat([], config.columns).map(() => (
    initData())
  )
);
const convert1DimAry = (ary) => (_.flattenDepth(_.cloneDeep(ary)));
const convert2DimAry = (ary) => (_.chunk(ary, CONFIG.columns));
const createPanel = (config = CONFIG) => {
  return R.repeat({}, config.rows).map(() => (repeatItem(() => (createItem(config)))));
}

// check a panel

const isBlankItem = (item, config = CONFIG) => (item.color === config.color);
const isBottom = (panel) => (!isBlankLine(_.last(panel)));
const isBlankLine = (ary) => (_.every(ary, (item) => (isBlankItem(item))));
const isFullLine = (ary) => (_.every(ary, (item) => (!isBlankItem(item))));

const isOnTheLeftEdge = (panel) => {
  return !!_.reduce(panel, (count, rows) => {
    return (!isBlankItem(_.first(rows)) ? count + 1 : count);
  }, 0);
};

const isOnTheRightEdge = (panel) => {
  return !!_.reduce(panel, (count, rows) => {
    return (!isBlankItem(_.last(rows)) ? count + 1 : count);
  }, 0);
};

const isOverlap = (bgPanel, toolPanel) => {
  return _.some(
    R.zipWith((background, tool) => {
      return (!isBlankItem(background) && !isBlankItem(tool)) ? true : false;
    }, convert1DimAry(bgPanel), convert1DimAry(toolPanel))
    , (item) => (item === true));
};

const overwritePanel = (backgroundPanel, toolPanel) => {
  return convert2DimAry(
    R.zipWith((background, tool) => {
      return isBlankItem(tool) ? background : tool;
    }, convert1DimAry(backgroundPanel), convert1DimAry(toolPanel))
  );
};

// move panel

const downPanel = R.curry(
  (config, panel) => {
    const newPanel = _.cloneDeep(panel);
    newPanel.pop();
    newPanel.unshift(repeatItem(() => (createItem(config))));
    return newPanel;
  }
)(CONFIG);

const leftPanel = (panel) => {
  const newPanel = _.cloneDeep(panel);
  return newPanel.map((rows) => {
    rows.shift();
    rows.push(createItem());
    return rows;
  })
};

const rightPanel = (panel) => {
  const newPanel = _.cloneDeep(panel);
  return newPanel.map((rows) => {
    rows.pop();
    rows.unshift(createItem());
    return rows;
  })
};

const flipMatrix = matrix => (
  matrix[0].map((column, index) => (
    matrix.map(row => row[index])
  ))
);

const rotateRegion = (area, panel) => {
  const newPanel = _.cloneDeep(panel);
  const fromAry = [];
  _.range(area.startRow, area.endRow + 1).forEach((row) => {
    _.range(area.startColumn, area.endColumn + 1).forEach((column) => {
      fromAry.push(_.isUndefined(newPanel[row]) || _.isUndefined(newPanel[row][column]) ? createItem() : newPanel[row][column]);
    });
  });
  const from2Ary = _.chunk(fromAry, Math.abs(area.startRow - area.endRow) + 1);
  const toAry = convert1DimAry(flipMatrix(from2Ary.reverse()));
  _.range(area.startRow, area.endRow + 1).forEach((row) => {
    _.range(area.startColumn, area.endColumn + 1).forEach((column) => {
      const item = toAry.shift();
      const nop = _.isUndefined(newPanel[row]) || _.isUndefined(newPanel[row][column]) ? '' : newPanel[row][column] = _.cloneDeep(item);
    });
  });
  return newPanel;
}

const rotatePanel = (panel, moreSize = 2) => {
  const zeroPoints = [];
  panel.forEach((rows, rIndex) => (
    rows.forEach((item, cIndex) => (
      item.zeroPoint === true
      ? zeroPoints.push(Object.assign(item, { row: rIndex, column: cIndex }))
      : item
    ))
  ))

  const area = zeroPoints.length === 0
    ? {
      startRow: 0,
      startColumn: 0,
      endRow: 0,
      endColumn: 0
    }
    : _.reduce(zeroPoints, (keep, zeroPoint) => {
      return {
        startRow: Math.min(keep.startRow, zeroPoint.row),
        startColumn: Math.min(keep.startColumn, zeroPoint.column),
        endRow: Math.max(keep.endRow, zeroPoint.row),
        endColumn: Math.max(keep.endColumn, zeroPoint.column)
      };
    }, {
      startRow: 100,
      startColumn: 100,
      endRow: -1,
      endColumn: -1
    });

  const newArea = zeroPoints.length === 1 ? {
    startRow: _.first(zeroPoints).row - moreSize,
    startColumn: _.first(zeroPoints).column - moreSize,
    endRow: _.first(zeroPoints).row + moreSize,
    endColumn: _.first(zeroPoints).column + moreSize
  } : _.clone(area);

  return rotateRegion(newArea, panel);
}

// paint on panel

const paint = (panel, posAry, color) => {
  _(posAry).each((pos) => {
    panel[pos.row][pos.column].color = color;
    panel[pos.row][pos.column].zeroPoint = pos.zeroPoint ? pos.zeroPoint : false;
  });
  return panel;
};

const paintO = (panel) => {
  return paint(panel, [
    {row: 0, column: 4, zeroPoint: true},
    {row: 0, column: 5, zeroPoint: true},
    {row: 1, column: 4, zeroPoint: true},
    {row: 1, column: 5, zeroPoint: true}
  ], 'yellow');
};

const paintI = (panel) => {
  return paint(panel, [
    {row: 0, column: 3},
    {row: 0, column: 4, zeroPoint: true},
    {row: 0, column: 5},
    {row: 0, column: 6}
  ], 'lime');
};

const paintH = (panel) => {
  return paint(panel, [
    {row: 0, column: 4},
    {row: 0, column: 6},
    {row: 1, column: 4},
    {row: 1, column: 5, zeroPoint: true},
    {row: 1, column: 6},
    {row: 2, column: 4},
    {row: 2, column: 6},
  ], 'white');
};

const paintT = (panel) => {
  return paint(panel, [
    {row: 0, column: 5},
    {row: 1, column: 4},
    {row: 1, column: 5, zeroPoint: true},
    {row: 1, column: 6}
  ], 'pink');
};

const paintJ = (panel) => {
  return paint(panel, [
    {row: 0, column: 6},
    {row: 1, column: 4},
    {row: 1, column: 5, zeroPoint: true},
    {row: 1, column: 6}
  ], 'orange');
};

const paintL = (panel) => {
  return paint(panel, [
    {row: 0, column: 4},
    {row: 1, column: 4},
    {row: 1, column: 5, zeroPoint: true},
    {row: 1, column: 6}
  ], 'blue');
};

const paintS = (panel) => {
  return paint(panel, [
    {row: 0, column: 4, zeroPoint: true},
    {row: 0, column: 5},
    {row: 1, column: 3},
    {row: 1, column: 4}
  ], 'green');
};

const paintZ = (panel) => {
  return paint(panel, [
    {row: 0, column: 3},
    {row: 0, column: 4, zeroPoint: true},
    {row: 1, column: 4},
    {row: 1, column: 5}
  ], 'red');
};

const createBigPanel = (size) => (createPanel({
  rows: size,
  columns: size,
  color: 'grey',
}));

const createEmptyPanel = () => (createPanel());
const panelList = [
  R.compose(paintO, createEmptyPanel),
  R.compose(paintI, createEmptyPanel),
  R.compose(paintH, createEmptyPanel),
  R.compose(paintT, createEmptyPanel),
  R.compose(paintJ, createEmptyPanel),
  R.compose(paintL, createEmptyPanel),
  R.compose(paintS, createEmptyPanel),
  R.compose(paintZ, createEmptyPanel),
];
const getWindow = R.compose(convert1DimAry, overwritePanel);
const getDebugWindow = R.compose(convert1DimAry);

// components

const createBlocks = (ary) => (
  ary.map(
    (item, index) => (
      <Block color={item.color} row={item.row} column={item.column} key={index} />
    )
  )
);

const Block = (props) => (
  <div className="block" style={{backgroundColor: props.color}}></div>
);
const Blocks = (props) => (createBlocks(props.window));
const createRandomToolPanel = (panelList, bgPanel) => {
  const newPanel = panelList[_.random(0, panelList.length -1)]();
  // const newPanel = _.last(panelList)();
  const overlap = bgPanel ? isOverlap(bgPanel, newPanel) : false;
  return overlap ? createEmptyPanel() : newPanel;
};

// process event

const scrollDownPanel = (bgPanel, toolPanel) => {
  const overlap = isBottom(toolPanel) || isOverlap(bgPanel, downPanel(toolPanel));
  const newBgPanel = overlap ? overwritePanel(bgPanel, toolPanel) : bgPanel;
  const newToolPanel = overlap ? createRandomToolPanel(panelList, newBgPanel) : downPanel(toolPanel);
  return {
    bgPanel: newBgPanel,
    toolPanel: newToolPanel
  }
};

const leftKey = (bgPanel, toolPanel) => {
  const overlap = isOnTheLeftEdge(toolPanel) || isOverlap(bgPanel, leftPanel(toolPanel));
  // console.log("overlap left,", overlap);
  return {
    bgPanel,
    toolPanel:  overlap ? toolPanel : leftPanel(toolPanel)
  }
};

const rightKey = (bgPanel, toolPanel) => {
  const overlap = isOnTheRightEdge(toolPanel) || isOverlap(bgPanel, rightPanel(toolPanel));
  // console.log("overlap right,", overlap);
  return {
    bgPanel,
    toolPanel: overlap ? toolPanel : rightPanel(toolPanel)
  }
};

const getColorCount = (panel) => (
  _.reduce(convert1DimAry(panel), (sum, item) => {
    return (sum + (!isBlankItem(item) ? 1 : 0));
  }, 0)
);

const upKey = (bgPanel, toolPanel) => {
  const rotatedToolPanel = rotatePanel(toolPanel);
  const overlap = getColorCount(toolPanel) !== getColorCount(rotatedToolPanel) || isOverlap(bgPanel, rotatedToolPanel);
  console.log("overlap rotate,", overlap);
  return {
    bgPanel,
    toolPanel: overlap ? toolPanel : rotatedToolPanel
  };
};

// key definition

const keyFnList = [
  { key: 37, fn: leftKey },
  { key: 38, fn: upKey },
  { key: 39, fn: rightKey },
  { key: 40, fn: scrollDownPanel }
];

const processKey = R.curry((key, bgPanel, toolPanel) => (
  _.find(keyFnList, (item) => (
    item.key === key
  )).fn(bgPanel, toolPanel))
);
const isValidKey = (key) => (_.some(keyFnList, (item) => (item.key === key)));

// UI

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bgPanel: createEmptyPanel(),
      toolPanel: createRandomToolPanel(panelList)
    }

    this.state.timer = setInterval(() => {
      this.setState((state) => {
        return scrollDownPanel(state.bgPanel, state.toolPanel);
      });
    }, CONFIG.scrollDownInterval);

    keyboard.keyPressed(e => {
      setTimeout(function() {
        this.setState((state) => {
          return isValidKey(e.which) ? processKey(e.which)(state.bgPanel, state.toolPanel) : {};
        });
      }.bind(this));
    })
  }

  render() {
    return (
      <div className="container">
        <div className="App">
          <Blocks window={getDebugWindow(_.cloneDeep(this.state.bgPanel))} />
        </div>
        <div className="App">
          <Blocks window={getDebugWindow(_.cloneDeep(this.state.toolPanel))} />
        </div>
        <div className="App">
          <Blocks window={getWindow(this.state.bgPanel, this.state.toolPanel)} />
        </div>
      </div>
    );
  }
}

export default App;
