angular.module('sweeperApp', ['teropa.virtualDom'])
  .controller('GameController', function() {
    var ctrl = this;

    var nMines = 2;
    var nRows = 5;
    var nCols = 5;

    var undoStack = Immutable.Stack();

    function inc(n) {
      return n + 1;
    }

    function randInt(n) {
      return Math.floor(Math.random() * n);
    }

    function range(from, to, fn) {
      return Immutable.Range(from, to).map(fn);
    }

    function generateMine() {
      return Immutable.List.of(randInt(nRows), randInt(nCols));
    }

    function generateMines() {
      return Immutable.Range(0, nMines)
        .map(generateMine)
        .toSet();
    }

    function getSurroundingCoords(coords) {
      var rowRange = Immutable.Range(coords.get(0) - 1, coords.get(0) + 2);
      var colRange = Immutable.Range(coords.get(1) - 1, coords.get(1) + 2);
      return rowRange.map(function(rowNum) {
        return colRange.map(function(colNum) {
          return Immutable.List.of(rowNum, colNum);
        })
      }).flatten(1).toSet();
    }

    function getAdjacentMineCount(coords, mines) {
      return getSurroundingCoords(coords)
        .intersect(mines)
        .size;
    }

    function makeCell(row, col, mines) {
      var coords = Immutable.List.of(row, col);
      return Immutable.Map({
        coords: coords,
        revealed: false,
        mine: mines.has(coords),
        adjacentMineCount: getAdjacentMineCount(coords, mines)
      });
    }

    function updateGame(fn) {
      if (ctrl.game) {
        undoStack = undoStack.unshift(ctrl.game);
      }
      ctrl.game = fn(ctrl.game);
    }

    function revealMine(cellPath) {
      updateGame(function(game) {
        return game.set('state', 'lost')
                   .setIn(cellPath.concat(['revealed']), true);
      });
    }

    function revealCell(cellPath) {
      updateGame(function(game) {
        return game.update('revealedCellCount', inc)
                   .setIn(cellPath.concat(['revealed']), true);
      });
    }

    function revealLastCell(cellPath) {
      updateGame(function(game) {
        return game.update('revealedCellCount', inc)
                   .set('state', 'won')
                   .setIn(cellPath.concat(['revealed']), true);
      });
    }

    this.startGame = function() {
      var mines = generateMines();
      updateGame(function() {
        return Immutable.Map({
          state: 'ongoing',
          cellCount: nRows * nCols,
          revealedCellCount: 0,
          mineCount: nMines,
          board: range(0, nRows, function(row) {
            return range(0, nCols, function(col) {
              return makeCell(row, col, mines);
            }).toOrderedMap();
          }).toOrderedMap()
        });
      });
    };

    this.getRemainingCellCount = function() {
      var cellCount = this.game.get('cellCount');
      var mineCount = this.game.get('mineCount');
      var revealedCellCount = this.game.get('revealedCellCount');
      return cellCount - mineCount - revealedCellCount;
    }

    this.reveal = function(coords) {
      if (this.game.get('state') !== 'ongoing') {
        return;
      }
      var cellPath = ['board', coords.get(0), coords.get(1)];
      var cell = this.game.getIn(cellPath);
      if (cell.get('mine')) {
        revealMine(cellPath);
      } else if (!cell.get('revealed') && this.getRemainingCellCount() > 1) {
        revealCell(cellPath);
      } else if (!cell.get('revealed')) {
        revealLastCell(cellPath);
      }
    };

    this.canUndo = function() {
      return !!undoStack.size;
    }
    this.undo = function() {
      if (this.canUndo()) {
        this.game = undoStack.peek();
        undoStack = undoStack.shift();
      }
    }

    this.isWon = function() {
      return this.game.get('state') === 'won';
    }
    this.isLost = function() {
      return this.game.get('state') === 'lost';
    }
    this.isGameOver = function() {
      return this.isWon() || this.isLost();
    };

    this.startGame();
  })
  .filter('cellValue', function() {
    return function(cell, gameOver) {
      if (gameOver || cell.get('revealed')) {
        if (!cell.get('mine')) {
          return cell.get('adjacentMineCount');
        } else {
          return '◉';
        }
      }
    }
  });
