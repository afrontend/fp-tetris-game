import React, { Component } from 'react';
import _ from 'lodash';
import fp from 'lodash/fp';
import * as keyboard from 'keyboard-handler';
import './App.css';

// configuration

const CONFIG = {
  rows: 17,
  columns: 12,
  color: 'grey',
  scrollDownInterval: 700,
  count: 0
};

// panel functions

const getAry = (len, fn) => (
  _.range(len).map(() => (
    fn
    ? (
      _.isFunction(fn)
      ? fn()
      : fn )
    : null)
  ));

const createItem = () => ({ color: CONFIG.color });
const getEmptyRow = () => (getAry(CONFIG.columns, createItem));
const createPanel = () => (getAry(CONFIG.rows, getEmptyRow));
const getEmptyRows = (count) => (getAry(count, getEmptyRow));
const convert1DimAry = _.flattenDepth;
const convert2DimAry = fp.chunk(CONFIG.columns)

// check a panel

const isBlank = (item) => (item.color === CONFIG.color);
const isNotBlank = (item) => (item.color !== CONFIG.color);
const isBottom = (panel) => (isNotBlankRow(_.last(panel)));
const isNotBlankRow = fp.some(isNotBlank);
const isNotFullRow = fp.some(isBlank);

const isOnTheLeftEdge = (panel) => {
  return !!_.reduce(panel, (count, rows) => {
    return (isNotBlank(_.first(rows)) ? count + 1 : count);
  }, 0);
};

const isOnTheRightEdge = (panel) => {
  return !!_.reduce(panel, (count, rows) => {
    return (isNotBlank(_.last(rows)) ? count + 1 : count);
  }, 0);
};

const isOverlapItem = (bg, tool) => ((isNotBlank(bg) && isNotBlank(tool)) ? true : false);
const isOverlap = (bgPanel, toolPanel) => {
  return _.some(
    _.zipWith(
      convert1DimAry(bgPanel),
      convert1DimAry(toolPanel),
      isOverlapItem),
    fp.isEqual(true));
};

const zipPanelItem = (bg, tool) => (isBlank(tool) ? bg : tool);
const assignPanel = (bgPanel, toolPanel) => {
  return convert2DimAry(
    _.zipWith(
      convert1DimAry(bgPanel),
      convert1DimAry(toolPanel),
      zipPanelItem)
  );
};

// move panel

const downPanel = (panel) => {
  const newPanel = _.cloneDeep(panel);
  newPanel.pop();
  newPanel.unshift(getEmptyRow());
  return newPanel;
};

const leftPanel = (panel) => {
  return _.cloneDeep(panel).map((rows) => {
    rows.shift();
    rows.push(createItem());
    return rows;
  });
};

const rightPanel = (panel) => {
  return _.cloneDeep(panel).map((rows) => {
    rows.pop();
    rows.unshift(createItem());
    return rows;
  });
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
};

const rotatePanel = (panel, moreSize = 2) => {
  const zeroPoints = [];
  panel.forEach((rows, rIndex) => (
    rows.forEach((item, cIndex) => (
      item.zeroPoint === true
      ? zeroPoints.push(Object.assign(item, { row: rIndex, column: cIndex }))
      : item
    ))
  ));

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
};

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

const panelList = [
  _.flow([createPanel, paintO]),
  _.flow([createPanel, paintI]),
  _.flow([createPanel, paintT]),
  _.flow([createPanel, paintJ]),
  _.flow([createPanel, paintL]),
  _.flow([createPanel, paintS]),
  _.flow([createPanel, paintZ])
];
const getWindow = _.flow([assignPanel, convert1DimAry]);

// make tool panel

const createRandomToolPanel = (panelList, bgPanel) => {
  const toolPanel = panelList[_.random(0, panelList.length -1)]();
  const overlap = bgPanel ? isOverlap(bgPanel, toolPanel) : false;
  return overlap ? createPanel() : toolPanel;
};

// process event

const scrollDownPanel = (bgPanel, toolPanel) => {
  const overlap = isBottom(toolPanel) || isOverlap(bgPanel, downPanel(toolPanel));
  const newBgPanel = overlap ? assignPanel(bgPanel, toolPanel) : bgPanel;
  const newToolPanel = overlap ? createRandomToolPanel(panelList, newBgPanel) : downPanel(toolPanel);
  return {
    bgPanel: removeFullRow(newBgPanel),
    toolPanel: newToolPanel
  };
};

const leftKey = (bgPanel, toolPanel) => {
  const overlap = isOnTheLeftEdge(toolPanel) || isOverlap(bgPanel, leftPanel(toolPanel));
  // console.log("overlap left,", overlap);
  return {
    bgPanel,
    toolPanel:  overlap ? toolPanel : leftPanel(toolPanel)
  };
};

const rightKey = (bgPanel, toolPanel) => {
  const overlap = isOnTheRightEdge(toolPanel) || isOverlap(bgPanel, rightPanel(toolPanel));
  // console.log("overlap right,", overlap);
  return {
    bgPanel,
    toolPanel: overlap ? toolPanel : rightPanel(toolPanel)
  };
};

const getColorCount = (panel) => (
  _.reduce(convert1DimAry(panel), (sum, item) => {
    return (sum + (isNotBlank(item) ? 1 : 0));
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

const processKey = (key, bgPanel, toolPanel) => (
  _.find(keyFnList, (item) => (
    item.key === key
  )).fn(bgPanel, toolPanel)
);

const isValidKey = (key) => (_.some(keyFnList, (item) => (item.key === key)));

// remove row on panel

const addEmptyRow = panel => {
  const newPanel = _.cloneDeep(panel);
  const count = CONFIG.rows - newPanel.length;
  CONFIG.count += count;
  newPanel.unshift(...getEmptyRows(count));
  _.last(_.last(newPanel)).count = CONFIG.count;
  return newPanel;
};

const removeFullRow = panel => {
  const newPanel = _.filter(_.cloneDeep(panel), (row) => (
    isNotFullRow(row)
  ));

  return addEmptyRow(newPanel);
};

// components

const createBlocks = ary => (
  ary.map(
    (item, index) => (
      <Block color={item.color} key={index}>
        {item.count}
      </Block>
    )
  )
);

const Block = props => (
  <div className="block" style={{backgroundColor: props.color}}>{props.children}</div>
);
const Blocks = props => (createBlocks(props.window));

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bgPanel: createPanel(),
      toolPanel: createRandomToolPanel(panelList)
    };

    this.state.timer = setInterval(() => {
      this.setState((state) => {
        return scrollDownPanel(state.bgPanel, state.toolPanel);
      });
    }, CONFIG.scrollDownInterval);

    keyboard.keyPressed(e => {
      setTimeout(() => {
        this.setState((state) => {
          return isValidKey(e.which)
            ? processKey(e.which, state.bgPanel, state.toolPanel)
            : {};
        });
      });
    });
  }

  render() {
    return (
      <div className="container">
        <div className="App">
          <Blocks window={getWindow(this.state.bgPanel, this.state.toolPanel)} />
        </div>
      </div>
    );
  }
}

export default App;
