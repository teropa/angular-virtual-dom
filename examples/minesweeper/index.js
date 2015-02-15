var app = angular.module('sweeperApp', ['teropa.virtualDom']);

// The game logic is implemented as stateless functions that
// take the current game state (an immutable data structure)
// as arguments, and return the new game state.

app.factory('gameLogic', function() {

  var nMines = 2;
  var nRows = 5;
  var nCols = 5;

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

  function newGame() {
    var mines = generateMines();
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
  }

  function getRemainingCellCount(game) {
    var cellCount = game.get('cellCount');
    var mineCount = game.get('mineCount');
    var revealedCellCount = game.get('revealedCellCount');
    return cellCount - mineCount - revealedCellCount;
  }

  function revealMine(cellPath, game) {
    return game.set('state', 'lost')
               .setIn(cellPath.concat(['revealed']), true);
  }

  function revealCell(cellPath, game) {
    return game.update('revealedCellCount', inc)
               .setIn(cellPath.concat(['revealed']), true);
  }

  function revealLastCell(cellPath, game) {
    return game.update('revealedCellCount', inc)
               .set('state', 'won')
               .setIn(cellPath.concat(['revealed']), true);
  }

  function reveal(coords, game) {
    if (game.get('state') !== 'ongoing') {
      return;
    }
    var cellPath = ['board', coords.get(0), coords.get(1)];
    var cell = game.getIn(cellPath);
    if (cell.get('mine')) {
      return revealMine(cellPath, game);
    } else if (!cell.get('revealed') && getRemainingCellCount(game) > 1) {
      return revealCell(cellPath, game);
    } else if (!cell.get('revealed')) {
      return revealLastCell(cellPath, game);
    } else {
      return game;
    }
  }

  // The public API of gameLogic consists of two methods
  return {
    newGame: newGame,
    reveal: reveal
  };

});

// The game store (A DeLorean Flux store) maintains the state of
// the game and produces events when it changes. It also maintains
// the undo stack.
//
// The concrete state transitions are delegated to gameLogic functions.

app.factory('gameStore', function(gameLogic) {
  var GameStore = DeLorean.Flux.createStore({
    game: null,
    undoStack: Immutable.Stack(),
    updateGame: function(updateFn) {
      if (this.game) {
        this.undoStack = this.undoStack.unshift(this.game);
      }
      this.game = updateFn(this.game);
      this.emit('change');
    },
    undo: function() {
      if (this.undoStack.size) {
        this.game = this.undoStack.peek();
        this.undoStack = this.undoStack.shift();
        this.emit('change');
      }
    },
    startGame: function() {
      this.updateGame(gameLogic.newGame);
    },
    reveal: function(coords) {
      this.updateGame(gameLogic.reveal.bind(gameLogic, coords));
    },
    actions: {
      startGame: 'startGame',
      reveal: 'reveal',
      undo: 'undo'
    }
  });
  return new GameStore();
});

// The gameDispatcher (a DeLorean Flux Dispatcher) mediates
// actions from the controller to stores. In our app, we have
// just one store.

app.factory('gameDispatcher', function(gameStore) {
  return DeLorean.Flux.createDispatcher({
    getStores: function() {
      return {game: gameStore};
    }
  });
});

// GameController makes the game state available for the view
// to render, and listens to changes in the store.
// It also sends actions to the dispatcher from user actions.

app.controller('GameController', function(gameStore, gameDispatcher) {
  var ctrl = this;

  // When the game state changes, put the new version on `this`
  // for the view to use. The view can use ctrl.game as the
  // root value of the virtual DOM, because all changes in
  // game state produce a new version.
  gameStore.onChange(function() {
    ctrl.game = gameStore.store.game;
    ctrl.canUndo = gameStore.store.undoStack.size;
  });

  ctrl.isWon = function() {
    return ctrl.game.get('state') === 'won';
  }
  ctrl.isLost = function() {
    return ctrl.game.get('state') === 'lost';
  }
  ctrl.isGameOver = function() {
    return ctrl.isWon() || ctrl.isLost();
  };

  // User actions - all sent to the dispatcher.

  ctrl.startGame = function() {
    gameDispatcher.dispatch('startGame');
  };
  ctrl.reveal = function(coords) {
    gameDispatcher.dispatch('reveal', coords);
  };
  ctrl.undo = function() {
    gameDispatcher.dispatch('undo');
  };

  // Start a game when the controller is first constructed
  ctrl.startGame();
});

// The cellValue filter is used to render the contents of
// a game cell.
// Regular Angular filters can be used with the virtual DOM.

app.filter('cellValue', function() {
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
