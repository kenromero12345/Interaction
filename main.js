var AM = new AssetManager();
AM.queueDownload("./img/RobotUnicorn.png");
var GAMEENGINE;

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
 }

function civ(game, color) {
	this.name = "civ";
 	this.game = game;
 	this.ctx = game.ctx;
	this.color = color;
	this.startColor = color;
	this.x = Math.floor(Math.random() * GAMEBOARD.length);
	this.y = Math.floor(Math.random() * GAMEBOARD[0].length);
	GAMEBOARD[this.x][this.y].occupied = true;
	GAMEBOARD[this.x][this.y].main = true;
	GAMEBOARD[this.x][this.y].civ = this;
}

civ.prototype.draw = function () {

}

function getUnoccupiedNeighbors(civ, neighbors) {
	var unoccupiedNeighbors = [];
	for (var i = 0; i < neighbors.length; i++) {
		if (!GAMEBOARD[neighbors[i].x][neighbors[i].y].occupied) {
			unoccupiedNeighbors.push(neighbors[i]);
		}
	}
	return unoccupiedNeighbors;
}

function getOccupiedNeighbors(civ, neighbors) {
	var occupiedNeighbors = [];
	for (var i = 0; i < neighbors.length; i++) {
		if (GAMEBOARD[neighbors[i].x][neighbors[i].y].occupied) {
			occupiedNeighbors.push(neighbors[i]);
		}
	}
	return occupiedNeighbors;
}

function getPower(civ) {
	var queue = [];

	for(var i = 0; i < GAMEBOARD.length; i++) {
		for(var j = 0; j < GAMEBOARD[i].length; j++) {
			GAMEBOARD[i][j].seen = false;
		}
	}

	var xy = {x:civ.x, y:civ.y};
	queue.push(xy);

	var power = 0;

	while (queue.length !== 0) {
	  for (let i = 0; i < queue.length; i++) {
		  var node = queue.shift();

		  power++;
// 		  if (GAMEBOARD[node.x][node.y].civ && GAMEBOARD[node.x][node.y].civ.color == civ.color) {
		  if (GAMEBOARD[node.x][node.y].civ && GAMEBOARD[node.x][node.y].civ.color == civ.color) {
			  if (node.x + 1 < GAMEBOARD.length && !GAMEBOARD[node.x + 1][node.y].seen) {
				  GAMEBOARD[node.x + 1][node.y].seen = true;
				  var newNode = Object.assign({}, node);
				  newNode.x++;
				  queue.push(newNode);
			  }
			  if (node.y + 1 < GAMEBOARD[0].length && !GAMEBOARD[node.x][node.y + 1].seen) {
				  GAMEBOARD[node.x][node.y + 1].seen = true;
				  var newNode = Object.assign({}, node);
				  newNode.y++;
				  queue.push(newNode);
			  }
			  if (node.x - 1 >= 0 && !GAMEBOARD[node.x - 1][node.y].seen) {
				  GAMEBOARD[node.x - 1][node.y].seen = true;
				  var newNode = Object.assign({}, node);
				  newNode.x--;
				  queue.push(newNode);
			  }
			  if (node.y - 1 >= 0 && !GAMEBOARD[node.x][node.y - 1].seen) {
				  GAMEBOARD[node.x][node.y - 1].seen = true;
				  var newNode = Object.assign({}, node);
				  newNode.y--;
				  queue.push(newNode);
			  }
		  }
	  }
	}
	return power;
}

function expandToOccupiedNeighbors(civ, neighbors, power) {
	//expand to any occupied neighbors
	var occupiedNeighbors = getOccupiedNeighbors(civ, neighbors);
	if (occupiedNeighbors.length > 0) {
		var xy = occupiedNeighbors[Math.floor(Math.random() * occupiedNeighbors.length)];
		GAMEBOARD[xy.x][xy.y].occupied = true;
		if (GAMEBOARD[xy.x][xy.y].main) {
			GAMEBOARD[xy.x][xy.y].civ.color = civ.color;
		}
		GAMEBOARD[xy.x][xy.y].civ = civ;

	}

	var i = 0;
	var lim = Math.floor(Math.sqrt(Math.sqrt(power))) - 1;
	// var lim = Math.floor(Math.sqrt(Math.sqrt(Math.sqrt(power)))) - 1;
	if (lim > occupiedNeighbors.length - 1) {
		lim = occupiedNeighbors.length - 1
	}
	while (lim != i) {
		occupiedNeighbors.splice(occupiedNeighbors.indexOf(xy), 1);
		xy = occupiedNeighbors[Math.floor(Math.random() * occupiedNeighbors.length)];
		if (xy) {
			GAMEBOARD[xy.x][xy.y].occupied = true;
			if (GAMEBOARD[xy.x][xy.y].main) {
				GAMEBOARD[xy.x][xy.y].civ.color = civ.color;
			}
			GAMEBOARD[xy.x][xy.y].civ = civ;
			break;
		}
		i++
	}
}

function isThereOccupiedNeighbors(civ, neighbors) {
	var occupiedNeighbors = getOccupiedNeighbors(civ, neighbors);
	if (occupiedNeighbors.length > 0) {
		return true;
	}
}

function isThereUnoccupiedNeighbors(civ, neighbors) {
	var unoccupiedNeighbors = getUnoccupiedNeighbors(civ, neighbors);
	if (unoccupiedNeighbors.length > 0) {
		return true;
	}
}

function expandToUnoccupiedNeighbors(civ, neighbors, power) {
	//expand to any unoccupied neighbors
	var unoccupiedNeighbors = getUnoccupiedNeighbors(civ, neighbors);
	if (unoccupiedNeighbors.length > 0) {
		var xy = unoccupiedNeighbors[Math.floor(Math.random() * unoccupiedNeighbors.length)];
		GAMEBOARD[xy.x][xy.y].occupied = true;
		GAMEBOARD[xy.x][xy.y].civ = civ;

		var i = 0;
		// var lim = Math.floor(Math.sqrt(Math.sqrt(Math.sqrt(power)))) - 1;
		var lim = Math.floor(Math.sqrt(Math.sqrt(power))) - 1;
		if (lim > unoccupiedNeighbors.length - 1) {
			lim = unoccupiedNeighbors.length - 1
		}
		while (lim != i) {
			unoccupiedNeighbors.splice(unoccupiedNeighbors.indexOf(xy), 1);
			xy = unoccupiedNeighbors[Math.floor(Math.random() * unoccupiedNeighbors.length)];
			GAMEBOARD[xy.x][xy.y].occupied = true;
			GAMEBOARD[xy.x][xy.y].civ = civ;
			i++
		}
	}
}

civ.prototype.update = function () {
	//can expand to any neighbors
	// console.log(neighbors.length);
	// if (neighbors.length > 0) {
	// 	var xy = neighbors[Math.floor(Math.random() * neighbors.length)];
	// 	GAMEBOARD[xy.x][xy.y].occupied = true;
	// 	GAMEBOARD[xy.x][xy.y].civ = this;
	// }
	var power = getPower(this);
	var neighbors = getNeighbors(this);

	var unoccupiedFlag = isThereUnoccupiedNeighbors(this, neighbors);
	var occupiedFlag = isThereOccupiedNeighbors(this, neighbors);

	if (unoccupiedFlag) {
		expandToUnoccupiedNeighbors(this, neighbors, power);
	} else {
		expandToOccupiedNeighbors(this, neighbors, power);
	}

	// if (unoccupiedFlag && occupiedFlag) {
	// 	//random move
	// 	//0: expand to unoccupied
	// 	//1: attack others
	// 	var moves = 2;
	// 	var move = Math.floor(Math.random() * moves);
	// 	// var move = 1;
	//
	// 	if(move == 0) {
	// 		expandToOccupiedNeighbors(this, neighbors, power);
	// 	} else if (move == 1) {
	// 		expandToUnoccupiedNeighbors(this, neighbors, power);
	// 	}
	// } else if (unoccupiedFlag) {
	// 	expandToUnoccupiedNeighbors(this, neighbors, power);
	// } else {
	// 	expandToOccupiedNeighbors(this, neighbors, power);
	// }
}

function helperToGetDirection(node) {
	if(GAMEBOARD[node.x][node.y].distToXY == 0) {
		return node.linkedDir;
	}

	if (node.x + 1 < GAMEBOARD.length && node.x + 1 >= 0 && !GAMEBOARD[node.x + 1][node.y].occupied
		&& GAMEBOARD[node.x + 1][node.y].distToXY == GAMEBOARD[node.x][node.y].distToXY - 1) {
		node.linkedDir = GAMEBOARD[node.x][node.y].dir;
		node.x++;
		return helperToGetDirection(node);
	}
	if (node.y + 1 < GAMEBOARD[0].length && node.y + 1 >= 0 && !GAMEBOARD[node.x][node.y + 1].occupied
		&& GAMEBOARD[node.x][node.y + 1].distToXY == GAMEBOARD[node.x][node.y].distToXY - 1) {
		node.linkedDir = GAMEBOARD[node.x][node.y].dir;
		node.y++;
		return helperToGetDirection(node);
	}
	if (node.x - 1 < GAMEBOARD.length && node.x - 1 >= 0 && !GAMEBOARD[node.x - 1][node.y].occupied
		&& GAMEBOARD[node.x - 1][node.y].distToXY == GAMEBOARD[node.x][node.y].distToXY - 1) {
		node.linkedDir = GAMEBOARD[node.x][node.y].dir;
		node.x--;
		return helperToGetDirection(node);
	}
	if (node.y - 1 < GAMEBOARD[0].length && node.y - 1 >= 0 && !GAMEBOARD[node.x][node.y - 1].occupied
		&& GAMEBOARD[node.x][node.y - 1].distToXY == GAMEBOARD[node.x][node.y].distToXY - 1) {
		node.linkedDir = GAMEBOARD[node.x][node.y].dir;
        node.y--;
		return helperToGetDirection(node);
	}
};

function getShortestPath(civ, target) {
    var queue = [];

	for(var i = 0; i < GAMEBOARD.length; i++) {
	  	for(var j = 0; j < GAMEBOARD[i].length; j++) {
            GAMEBOARD[i][j].distToXY = -1;
            GAMEBOARD[i][j].dir = -1;
	  	}
	}

    var xy = {x:civ.x, y:civ.y};
    GAMEBOARD[xy.x][xy.y].distToXY = 0;
    GAMEBOARD[xy.x][xy.y].dir = 0;
    queue.push(xy);

    while (queue.length !== 0) {
        for (let i = 0; i < queue.length; i++) {
            var node = queue.shift();

            if (node.x == civ.x && node.y == civ.y) {
				return helperToGetDirection(node);
            }

            if (node.x + 1 < GAMEBOARD.length && node.x + 1 >= 0 && !GAMEBOARD[node.x + 1][node.y].occupied
                && GAMEBOARD[node.x + 1][node.y].dir < 0) {
                var newNode = Object.assign({}, node);
                newNode.x++;
                queue.push(newNode);
				GAMEBOARD[node.x + 1][node.y].distToXY = GAMEBOARD[node.x][node.y].distToXY + 1;
				GAMEBOARD[node.x + 1][node.y].dir = 1;
            }
            if (node.y + 1 < GAMEBOARD[0].length && node.y + 1 >= 0 && !GAMEBOARD[node.x][node.y + 1].occupied
                && GAMEBOARD[node.x][node.y + 1].dir < 0) {
                var newNode = Object.assign({}, node);
                newNode.y++;
                queue.push(newNode);
				GAMEBOARD[node.x][node.y + 1].distToXY = GAMEBOARD[node.x][node.y].distToXY + 1;
				GAMEBOARD[node.x][node.y + 1].dir = 2;
            }
            if (node.x - 1 < GAMEBOARD.length && node.x - 1 >= 0 && !GAMEBOARD[node.x - 1][node.y].occupied
                && GAMEBOARD[node.x - 1][node.y].dir < 0) {
                var newNode = Object.assign({}, node);
                newNode.x--;
                queue.push(newNode);
				GAMEBOARD[node.x - 1][node.y].distToXY = GAMEBOARD[node.x][node.y].distToXY + 1;
				GAMEBOARD[node.x - 1][node.y].dir = 3;
            }
            if (node.y - 1 < GAMEBOARD[0].length && node.y - 1 >= 0 && !GAMEBOARD[node.x][node.y - 1].occupied
                && GAMEBOARD[node.x][node.y - 1].dir < 0) {
                var newNode = Object.assign({}, node);
                newNode.y--;
                queue.push(newNode);
				GAMEBOARD[node.x][node.y - 1].distToXY = GAMEBOARD[node.x][node.y].distToXY + 1;
				GAMEBOARD[node.x][node.y - 1].dir = 4;
            }
        }
    }
    return 0; // no shortest path
};

function isPath(civ, target) {
  var queue = [];

for(var i = 0; i < GAMEBOARD.length; i++) {
    for(var j = 0; j < GAMEBOARD[i].length; j++) {
          GAMEBOARD[i][j].distToXY = -1;
          GAMEBOARD[i][j].dir = -1;
    }
}

  var xy = {x:civ.x, y:civ.y};
  GAMEBOARD[xy.x][xy.y].distToXY = 0;
  GAMEBOARD[xy.x][xy.y].dir = 0;
  queue.push(xy);

  while (queue.length !== 0) {
      for (let i = 0; i < queue.length; i++) {
          var node = queue.shift();

          if (node.x == target.x && node.y == target.y) {
            return true;
          }

          if (node.x + 1 < GAMEBOARD.length && !GAMEBOARD[node.x + 1][node.y].occupied
			  && GAMEBOARD[node.x + 1][node.y].dir < 0) {
              var newNode = Object.assign({}, node);
              newNode.x++;
              queue.push(newNode);
              GAMEBOARD[node.x + 1][node.y].distToXY = GAMEBOARD[node.x][node.y].distToXY + 1;
              GAMEBOARD[node.x + 1][node.y].dir = 1;
          }
          if (node.y + 1 < GAMEBOARD[0].length && node.y + 1 >= 0
            && !GAMEBOARD[node.x][node.y + 1].occupied && GAMEBOARD[node.x][node.y + 1].dir < 0) {
              var newNode = Object.assign({}, node);
              newNode.y++;
              queue.push(newNode);
              GAMEBOARD[node.x][node.y + 1].distToXY = GAMEBOARD[node.x][node.y].distToXY + 1;
              GAMEBOARD[node.x][node.y + 1].dir = 2;
          }
          if (node.x - 1 < GAMEBOARD.length && node.x - 1 >= 0
            && !GAMEBOARD[node.x - 1][node.y].occupied && GAMEBOARD[node.x - 1][node.y].dir < 0) {
              var newNode = Object.assign({}, node);
              newNode.x--;
              queue.push(newNode);
              GAMEBOARD[node.x - 1][node.y].distToXY = GAMEBOARD[node.x][node.y].distToXY + 1;
              GAMEBOARD[node.x - 1][node.y].dir = 3;
          }
          if (node.y - 1 < GAMEBOARD[0].length && node.y - 1 >= 0
            && !GAMEBOARD[node.x][node.y - 1].occupied && GAMEBOARD[node.x][node.y - 1].dir < 0) {
              var newNode = Object.assign({}, node);
              newNode.y--;
              queue.push(newNode);
              GAMEBOARD[node.x][node.y - 1].distToXY = GAMEBOARD[node.x][node.y].distToXY + 1;
              GAMEBOARD[node.x][node.y - 1].dir = 4;
          }
      }
  }
  GAMEBOARD[blockX][blockY].hoverOccupied = false;
  return false; // no shortest path
};

function getNeighbors(civ) {
  	var queue = [];

	for(var i = 0; i < GAMEBOARD.length; i++) {
	    for(var j = 0; j < GAMEBOARD[i].length; j++) {
			GAMEBOARD[i][j].seen = false;
	    }
	}

	var xy = {x:civ.x, y:civ.y};
	queue.push(xy);

	var neighbors = [];

  while (queue.length !== 0) {
	  // console.log(queue.length)
      for (let i = 0; i < queue.length; i++) {
          var node = queue.shift();

// if (!GAMEBOARD[node.x][node.y].civ || GAMEBOARD[node.x][node.y].civ.color != civ.color) {
          if (GAMEBOARD[node.x][node.y].civ != civ) {
			  neighbors.push(node);
          }

// if (GAMEBOARD[node.x][node.y].civ && GAMEBOARD[node.x][node.y].civ.color == civ.color) {
		  if (GAMEBOARD[node.x][node.y].civ == civ) {
	          if (node.x + 1 < GAMEBOARD.length && !GAMEBOARD[node.x + 1][node.y].seen) {
				  GAMEBOARD[node.x + 1][node.y].seen = true;
	              var newNode = Object.assign({}, node);
	              newNode.x++;
	              queue.push(newNode);
	          }
	          if (node.y + 1 < GAMEBOARD[0].length && !GAMEBOARD[node.x][node.y + 1].seen) {
				  GAMEBOARD[node.x][node.y + 1].seen = true;
	              var newNode = Object.assign({}, node);
	              newNode.y++;
	              queue.push(newNode);
	          }
	          if (node.x - 1 >= 0 && !GAMEBOARD[node.x - 1][node.y].seen) {
				  GAMEBOARD[node.x - 1][node.y].seen = true;
	              var newNode = Object.assign({}, node);
	              newNode.x--;
	              queue.push(newNode);
	          }
	          if (node.y - 1 >= 0 && !GAMEBOARD[node.x][node.y - 1].seen) {
				  GAMEBOARD[node.x][node.y - 1].seen = true;
	              var newNode = Object.assign({}, node);
	              newNode.y--;
	              queue.push(newNode);
	          }

			  //no border?
			//   if (!GAMEBOARD[(node.x + 1) % GAMEBOARD.length][node.y].seen) {
			// 	GAMEBOARD[(node.x + 1) % GAMEBOARD.length][node.y].seen = true;
			// 	var newNode = Object.assign({}, node);
			// 	newNode.x++;
			// 	newNode.x %= GAMEBOARD.length;
			// 	queue.push(newNode);
			// }
			// if (!GAMEBOARD[node.x][(node.y + 1) % GAMEBOARD[0].length].seen) {
			// 	GAMEBOARD[node.x][(node.y + 1) % GAMEBOARD[0].length].seen = true;
			// 	var newNode = Object.assign({}, node);
			// 	newNode.y++;
			// 	newNode.y %= GAMEBOARD[0].length;
			// 	queue.push(newNode);
			// }
			// var newX = node.x--;
			// if (newX == -1) {
			// 	newX = GAMEBOARD.length - 1;
			// }
			// var newY = node.y--;
			// if (newY == -1) {
			// 	newY = GAMEBOARD[0].length - 1;
			// }
			// if (!GAMEBOARD[newX][node.y].seen) {
			// 	GAMEBOARD[newX][node.y].seen = true;
			// 	var newNode = Object.assign({}, node);
			// 	newNode.x = newX;
			// 	queue.push(newNode);
			// }
			// if (!GAMEBOARD[node.x][newY].seen) {
			// 	GAMEBOARD[node.x][newY].seen = true;
			// 	var newNode = Object.assign({}, node);
			// 	newNode.y = newY;
			// 	queue.push(newNode);
			// }
		  }
      }
  }

  return neighbors;
};

AM.downloadAll(function () {
	var socket = io.connect("http://24.16.255.56:8888");

	socket.on("load", function (data) {
		//TODO replace our entities
		console.log(data);
		GAMEENGINE.entities = [];
		var obj = data.data;
		GAMEENGINE.addEntity(new board(GAMEENGINE));
		for (var i = 0; i < obj.civs.length; i++) {
			var newCiv = new civ(GAMEENGINE, obj.civs[i].startColor, true);
			newCiv.color = obj.civs[i].color;
			newCiv.x = obj.civs[i].x;
			newCiv.y = obj.civs[i].y;
			GAMEENGINE.addEntity(newCiv);
		}
		console.log(obj.gameBoard);
		for (var i = 0; i < obj.gameBoard.length; i++) {
			for (var j = 0; j < obj.gameBoard[i].length; j++) {
				GAMEBOARD[i][j].occupied = obj.gameBoard[i][j].occupied;
				GAMEBOARD[i][j].main = obj.gameBoard[i][j].main;
				GAMEBOARD[i][j].civ = null;
				for (var k = 0; k < GAMEENGINE.entities.length; k++) {
					if (GAMEENGINE.entities[k].name != "board"
						&& obj.gameBoard[i][j].civStartColor
						&& obj.gameBoard[i][j].civStartColor == GAMEENGINE.entities[k].startColor) {
						GAMEBOARD[i][j].civ = GAMEENGINE.entities[k];
						break;
					}
				}

			}
		}
	});

	var text = document.getElementById("text");
	var saveButton = document.getElementById("save");
	var loadButton = document.getElementById("load");

	saveButton.onclick = function () {
		//TODO send data to be saved
		var gameData = {gameBoard: []}
		for (var i = 0; i < GAMEBOARD.length; i++) {
			gameData.gameBoard[i] = [];
			for (var j = 0; j < GAMEBOARD[i].length; j++) {
				gameData.gameBoard[i][j] = {};
				gameData.gameBoard[i][j].occupied = GAMEBOARD[i][j].occupied;
				gameData.gameBoard[i][j].main = GAMEBOARD[i][j].main;
				gameData.gameBoard[i][j].civStartColor = null;
				if (GAMEBOARD[i][j].civ) {
					gameData.gameBoard[i][j].civStartColor = GAMEBOARD[i][j].civ.startColor;
				}
			}
		}
		gameData.civs = [];
		for (var i = 0; i < GAMEENGINE.entities.length; i++) {
			if (GAMEENGINE.entities[i].name != "board") {
				var civ = {};
				civ.color = GAMEENGINE.entities[i].color;
				civ.startColor = GAMEENGINE.entities[i].startColor;
				civ.x = GAMEENGINE.entities[i].x;
				civ.y = GAMEENGINE.entities[i].y;
				gameData.civs.push(civ);
			}
		}
	  	console.log("save");
	  	text.innerHTML = "Saved."
	  	socket.emit("save", { studentname: "Ken Romero", statename: "theState", data: gameData });
	};

	loadButton.onclick = function () {
	  	console.log("load");
	  	text.innerHTML = "Loaded."
	  	socket.emit("load", { studentname: "Ken Romero", statename: "theState" });
	};

    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new board(gameEngine));
	gameEngine.addEntity(new civ(gameEngine, "red"));
	gameEngine.addEntity(new civ(gameEngine, "blue"));
	gameEngine.addEntity(new civ(gameEngine, "yellow"));
	gameEngine.addEntity(new civ(gameEngine, "green"));
	gameEngine.addEntity(new civ(gameEngine, "white"));
	gameEngine.addEntity(new civ(gameEngine, "violet"));
	gameEngine.addEntity(new civ(gameEngine, "orange"));
	GAMEENGINE = gameEngine;
    console.log("All Done!");
});
