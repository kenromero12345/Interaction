var GAMEBOARD = [];

function board(game) {
	GAMEBOARD = [];
	this.width = 130;
	this.height = 60;
	this.xgap = 10;
  	this.ygap = 10;
  	this.startingXPoint = 0;
  	this.startingYPoint = 0;
	this.game = game;
	this.ctx = game.ctx;
	this.buildGameboard();
}

board.prototype.buildGameboard = function () {
  GAMEBOARD = [];
  for(var i = 0; i < this.width; i++) {
    GAMEBOARD.push([]);
    for(var j = 0; j < this.height; j++) {
      GAMEBOARD[i].push({
    occupied : false,
	main : false,
	civ: null,
	life: 0
      });
    }
  }
}

board.prototype.drawRect = function (i,j,color) {
  var ctx = this.ctx;
  var x = this.startingXPoint + i * this.xgap;
  var y = this.startingYPoint + j * this.ygap;
  var w = this.xgap;
  var h = this.ygap;
  ctx.fillStyle = color;
  ctx.fillRect(x,y,w,h);
}

board.prototype.draw = function () {
 for(var i = 0; i < this.width; i++) {
    for(var j = 0; j < this.height; j++) {
	  if (GAMEBOARD[i][j].occupied) {
		this.drawRect(i, j, GAMEBOARD[i][j].civ.color);
		}
    }
  }
}


board.prototype.update = function () {
}
