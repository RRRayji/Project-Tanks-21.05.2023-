const DEBUG = false;

class Wall
{
	static genId = 0;
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
		this.width = cellSize;
		this.height = cellSize;
		this.id = Wall.genId++;
		this.model = `url('source/sprite/wall.png')`;
		gameZone.innerHTML += `<div class="wall" id="wall${this.id}"></div>`;

		this.createWall();
	}
	destruct()
	{
		findInAndSplice(tiles, this);
		if (coords[this.id] != undefined) coords[this.id] = undefined;
		gameZone.removeChild(document.getElementById(`wall${this.id}`));
	}
	createWall()
	{
		this.element = document.querySelector(`#wall${this.id}`);
		this.element.style.top = `${this.y}px`;
		this.element.style.left = `${this.x}px`;
		this.element.style.backgroundImage = this.model;
	}
};

class WallIndestructible extends Wall
{
	static model = `url('source/sprite/wallIndestructible.png')`;
	constructor(x, y)
	{
		super(x, y);
		this.model = WallIndestructible.model;
		this.element.style.backgroundImage = this.model;
	}
}

const sides = {
	top: 0,
	right: 1,
	bottom: 2,
	left: 3
};

class Bullet
{
	constructor(owner, bulletModel, side)
	{
		movableObject.push(this);
		this.model = bulletModel;
		this.side = side;
		this.owner = owner;
		this.id = `bullet${this.owner.id}`;
		gameZone.innerHTML += `<div class="bullet" id="${this.id}"></div>`;
		this.element = document.querySelector(`#${this.id}`);
		this.element.style.backgroundImage = this.model;
		this.width = 4;
		this.height = 10;
		this.spawnPosition = { x:owner.x,y:owner.y };
		this.isExist = true;
	}
	destruct()
	{
		this.isExist = false;
		findInAndSplice(movableObject, this);
		findInAndSplice(bullet, this);
		gameZone.removeChild(document.querySelector(`#${this.id}`));
		this.owner.didShot = false;
		defineEndOfGame();
	}
	setSide()
	{
		switch(this.side)
		{
		case sides.top:
			this.element.style.transform = `rotate(0deg)`;
			this.setX(this.spawnPosition.x + this.owner.width / 2 - 2);
			this.setY(this.spawnPosition.y - 10);
			break;
		case sides.right:
			this.element.style.transform = `rotate(90deg)`;
			this.setX(this.spawnPosition.x + this.owner.width + 3);
			this.setY(this.spawnPosition.y + this.owner.height / 2 - 5);
			break;
		case sides.bottom:
			this.element.style.transform = `rotate(180deg)`;
			this.setX(this.spawnPosition.x + this.owner.width / 2 - 2);
			this.setY(this.spawnPosition.y + this.owner.height);
			break;
		case sides.left:
			this.element.style.transform = `rotate(-90deg)`;
			this.setX(this.spawnPosition.x - 7);
			this.setY(this.spawnPosition.y + this.owner.height / 2 - 5);
			break;
		}
	}
	setX(x_)
	{
		switch (this.isExist)
		{
		case true: 
			x_ = this.bulletPositionCorrecting(x_);
			if (this.isCollisionDetected({ x:x_,y:-1 })) { this.destruct(); return; }
			this.x = x_;
			document.querySelector(`#${this.id}`).style.left = `${this.x}px`;
			return;
		case false: return;
		}
	}
	setY(y_)
	{
		switch (this.isExist)
		{
		case true: 
			y_ = this.bulletPositionCorrecting(y_);
			if (this.isCollisionDetected({ x:-1,y:y_ })) { this.destruct(); return; }
			this.y = y_;
			document.querySelector(`#${this.id}`).style.top = `${this.y}px`;
			return;
		case false: return;
		}
	}
	isCollisionDetected(otherCoord)
	{
		this.element = document.querySelector(`#${this.id}`);
		let object = [];
		if (unit.length > 0)add(unit, object);
		if (tiles.length > 0) add(tiles, object);
		if (bullet.length > 0) add(bullet, object);
		if (otherCoord.x == -1 && (this.side == sides.top || this.side == sides.bottom))			//	for Y
		{
			let x = this.spawnPosition.x + this.owner.width / 2;
			let y = otherCoord.y + this.height / 2;
			for (var i = 0; i < object.length; ++i)
			{
				if (object[i] == undefined || object[i].element == this.element) continue;
				let objCenterX = object[i].x + object[i].width / 2;
				let objCenterY = object[i].y + object[i].height / 2;
				if (Math.abs(x - objCenterX) <= 16 && Math.abs(y - objCenterY) < 20)
				{
					if (object[i].model != WallIndestructible.model) object[i].destruct();	//	DESTROY EVERYTHING
					return true;
				}
			}
		}
		else if (otherCoord.y == -1 && (this.side == sides.right || this.side == sides.left))	//	for X
		{
			let x = otherCoord.x + this.width / 2;
			let y = this.spawnPosition.y + this.owner.height / 2;
			for (var i = 0; i < object.length; ++i)
			{
				if (object[i] == undefined || object[i].element == this.element) continue;
				let objCenterX = object[i].x + object[i].width / 2;
				let objCenterY = object[i].y + object[i].height / 2;
				if (Math.abs(x - objCenterX) < 20 && Math.abs(y - objCenterY) <= 16)
				{
					if (object[i].model != WallIndestructible.model) object[i].destruct();	//	DESTROY EVERYTHING
					return true;
				}
			}
		}
		object = undefined;
		return false;
	}
	bulletPositionCorrecting(newValue)
	{
		switch (this.side)
		{
		case sides.top:
			if (newValue <= -this.height)
			{
				return resolution - this.height;
			}
			break;
		case sides.right:
			if (newValue >= resolution)
			{
				return 0;
			}
			break;
		case sides.bottom:
			if (newValue >= resolution)
			{
				return 0;
			}
			break;
		case sides.left:
			if (newValue <= -this.width)
			{
				return resolution - this.width;
			}
			break;
		}
		return newValue;
	}
	move()
	{
		switch(this.side)
		{
		case sides.top:
			this.setY(this.y - step);
			return;
		case sides.right:
			this.setX(this.x + step);
			return;
		case sides.bottom:
			this.setY(this.y + step);
			return;
		case sides.left:
			this.setX(this.x - step);
			return;
		}
	}
}

class Unit
{
	static genId = 0;
	constructor()
	{
		movableObject.push(this);
		this.id = `unit${Unit.genId++}`;
		this.x = 0;
		this.y = 0;
		this.model = null;
		this.element = null;
		this.side = null;
		this.unitOnBorderId = -1;
		this.didShot = false;
		this.width = 32;
		this.height = 32;
		this.isAlive = true;
		this.isMoving = false;
	}
	construct(x, y)
	{
		switch (this.id.includes(`unit`))
		{
		case true:
			this.model = unitSettings[2].model;
			gameZone.innerHTML += `<div id="${this.id}"></div>`;
			this.element = document.querySelector(`#${this.id}`);
			this.element.style.backgroundImage = this.model;
			this.initStyle();
			this.setX(x);
			this.setY(y);
			this.side = sides.top;
			this.AIemulation();
			return;
		case false: return;
		}
	}
	destruct()
	{
		this.isAlive = false;
		switch (this.id.includes(`player`))
		{
		case true: findInAndSplice(player, this);
		}
		findInAndSplice(unit, this);
		findInAndSplice(movableObject, this);
		gameZone.removeChild(document.querySelector(`#${this.id}`));
		document.removeEventListener('keydown', (e) => {
			switch (this.isAlive)
			{
			case true:
				this.element = document.querySelector(`#${this.id}`);
				switch (e.keyCode)
				{
				case this.controls.top:
					this.side = sides.top;
					this.isMoving = true;
					this.element.style.transform = 'rotate(0deg)';
					return;
				case this.controls.right:
					this.side = sides.right;
					this.isMoving = true;
					this.element.style.transform = 'rotate(90deg)';
					return;
				case this.controls.bottom:
					this.side = sides.bottom;
					this.isMoving = true;
					this.element.style.transform = 'rotate(180deg)';
					return;
				case this.controls.left:
					this.side = sides.left;
					this.isMoving = true;
					this.element.style.transform = 'rotate(-90deg)';
					return;
				case this.controls.shot:
					this.shot();
					return;
				}
				return;
			case false: return;
			}
		});
		document.removeEventListener('keyup', (e) => {
			switch (this.isAlive)
			{
			case true:
				switch (e.keyCode)
				{
				case this.controls.top:
					this.isMoving = false;
					return;
				case this.controls.right:
					this.isMoving = false;
					return;
				case this.controls.bottom:
					this.isMoving = false;
					return;
				case this.controls.left:
					this.isMoving = false;
					return;
				}
				return;
			case false: return;
			}
		});
	}
	async AIemulation()
	{
		let rand = parseInt(Math.random()*10);
		do
		{
			this.side = rand % 4;
			this.isMoving = true;
			this.element = document.querySelector(`#${this.id}`);
			this.updateCurrentSide();
			rand = parseInt(Math.random()*10);
			switch (parseInt(Math.random()*10) % 6)
			{
			case 0: this.shot();
			}
			await wait(2000);
			this.isMoving = false;
			await wait(1000);
		}
		while(this.isAlive);
	}
	shot()
	{
		if (!this.didShot && this.isAlive)
		{
			bullet.push(new Bullet(this, unitSettings[(this.id.includes(`player`)) ? this.id[this.id.length - 1] : 2].bulletModel, this.side));
			this.didShot = true;
			bullet[bullet.length-1].setSide();
		}
	}
	initStyle()
	{
		this.element.style.position = 'absolute';
		this.element.style.width = `${cellSize}px`;
		this.element.style.height = `${cellSize}px`;
		this.element.style.backgroundRepeat = 'no-repeat';
		this.element.style.color = 'transparent';
	}
	updateCurrentSide()
	{
		switch(this.side)
		{
		case sides.top:
			this.element.style.transform = 'rotate(0deg)';
			break;
		case sides.right:
			this.element.style.transform = 'rotate(90deg)';
			break;
		case sides.bottom:
			this.element.style.transform = 'rotate(180deg)';
			break;
		case sides.left:
			this.element.style.transform = 'rotate(-90deg)';
			break;
		}
	}
	setX(x_)
	{
		x_ = this.newPositionCorrecting(x_);
		if (isCollisionDetected( { x:x_,y:-1 },this )) return;
		this.x = x_;
		this.element.style.left = `${this.x}px`;
	}
	setY(y_)
	{
		y_ = this.newPositionCorrecting(y_);
		if (isCollisionDetected( { x:-1,y:y_ },this )) return;
		this.y = y_;
		this.element.style.top = `${this.y}px`;
	}
	newPositionCorrecting(newValue)
	{
		switch (this.side)
		{
		case sides.top:
			if (newValue <= -cellSize)
			{
				return resolution - cellSize;
			}
			break;
		case sides.right:
			if (newValue >= resolution)
			{
				return 0;
			}
			break;
		case sides.bottom:
			if (newValue >= resolution)
			{
				return 0;
			}
			break;
		case sides.left:
			if (newValue <= -cellSize)
			{
				return resolution - cellSize;
			}
			break;
		}
		return newValue;
	}
	controller()
	{
		document.addEventListener('keydown', (e) => {
			switch (this.isAlive)
			{
			case true:
				this.element = document.querySelector(`#${this.id}`);
				switch (e.keyCode)
				{
				case this.controls.top:
					this.side = sides.top;
					this.isMoving = true;
					this.element.style.transform = 'rotate(0deg)';
					return;
				case this.controls.right:
					this.side = sides.right;
					this.isMoving = true;
					this.element.style.transform = 'rotate(90deg)';
					return;
				case this.controls.bottom:
					this.side = sides.bottom;
					this.isMoving = true;
					this.element.style.transform = 'rotate(180deg)';
					return;
				case this.controls.left:
					this.side = sides.left;
					this.isMoving = true;
					this.element.style.transform = 'rotate(-90deg)';
					return;
				case this.controls.shot:
					this.shot();
					return;
				}
				return;
			case false: return;
			}
		});
		document.addEventListener('keyup', (e) => {
			switch (this.isAlive)
			{
			case true:
				switch (e.keyCode)
				{
				case this.controls.top:
					this.isMoving = false;
					return;
				case this.controls.right:
					this.isMoving = false;
					return;
				case this.controls.bottom:
					this.isMoving = false;
					return;
				case this.controls.left:
					this.isMoving = false;
					return;
				}
				return;
			case false: return;
			}
		});
	}
	move()
	{
		switch(this.isMoving)
		{
		case true:
			switch(this.side)
			{
			case sides.top:
				this.setY(this.y - step);
				return;
			case sides.right:
				this.setX(this.x + step);
				return;
			case sides.bottom:
				this.setY(this.y + step);
				return;
			case sides.left:
				this.setX(this.x - step);
				return;
			}
		case false: return;
		}
	}
}

unitSettings = [
	{
		model : `url('source/sprite/tankYellow.png')`, 
		bulletModel : `url('source/sprite/bulletYellow.png')`,
		controls : {
			top : 87,		//	W
			right : 68,		//	D
			bottom : 83,	//	S
			left : 65,		//	A
			shot: 16
		} 
	},
	{
		model : `url('source/sprite/tankGreen.png')`,
		bulletModel : `url('source/sprite/bulletGreen.png')`,
		controls : {
			top : 38,		//	TOP
			right : 39,		//	RIGHT
			bottom : 40,	//	BOTTOM
			left : 37,		//	LEFT
			shot: 32
		}
	},
	{
		model : `url('source/sprite/tankRed.png')`,
		bulletModel : `url('source/sprite/bulletRed.png')`,
	}
];

class Player extends Unit
{
	constructor(x, y)
	{
		super();
		this.changeId();
		unit.push(this);
		this.model = unitSettings[this.id[this.id.length - 1]].model;
		gameZone.innerHTML += `<div id="${this.id}"></div>`;
		this.element = document.querySelector(`#${this.id}`);
		this.element.style.backgroundImage = this.model;
		this.initStyle();
		this.setX(x);
		this.setY(y);
		this.side = sides.top;
		this.controls = unitSettings[this.id[this.id.length - 1]].controls;
		this.controller();
	}
	changeId()
	{
		this.id = `player${this.id[this.id.length - 1]}`;
	}
}

function findInAndSplice(inArray, item)
{
	for (var i = 0; i < inArray.length; ++i)
	{
		if (inArray[i].id == item.id) inArray.splice(i, 1);
	}
}

function add(fromArray, toArray)
{
	for (var i = 0; i < fromArray.length; ++i)
	{
		toArray.push(fromArray[i]);
	}
}

function placeTilesOnMap()
{
	coords = [
		{x:0,y:2},{x:1,y:1},{x:1,y:2},{x:1,y:3},
		{x:1,y:4},{x:0,y:6},{x:2,y:6},{x:2,y:7},{x:2,y:8},
		{x:1,y:8},{x:0,y:11},{x:1,y:10},{x:3,y:11},{x:4,y:11},
		{x:5,y:11},{x:2,y:3},{x:4,y:5},{x:5,y:4},{x:5,y:4},
		{x:5,y:5},{x:3,y:1},{x:4,y:1},{x:5,y:1},{x:6,y:1},
		{x:7,y:1},{x:6,y:2},{x:9,y:0},{x:10,y:0},{x:11,y:0},
		{x:10,y:3},{x:9,y:3},{x:9,y:4},{x:9,y:5},{x:12,y:0},
		{x:13,y:2},{x:14,y:2},{x:15,y:2},{x:16,y:2},{x:17,y:2},
		{x:17,y:1},{x:15,y:0},{x:21,y:0},{x:21,y:1},{x:22,y:1},
		{x:22,y:2},{x:23,y:4},{x:22,y:4},{x:21,y:4},{x:19,y:3},
		{x:5,y:10},{x:6,y:7},{x:8,y:9},
		{x:9,y:8},{x:10,y:8},{x:2,y:13},{x:1,y:13},{x:5,y:12},
		{x:5,y:13},{x:3,y:15},{x:0,y:16},{x:1,y:16},{x:12,y:5},
		{x:13,y:5},{x:13,y:6},{x:13,y:7},{x:14,y:6},{x:15,y:6},
		{x:15,y:5},{x:15,y:4},{x:16,y:5},{x:19,y:6},{x:18,y:6},
		{x:19,y:5},{x:21,y:6},{x:22,y:6},{x:23,y:8},{x:21,y:8},
		{x:20,y:8},{x:19,y:8},{x:19,y:10},{x:18,y:10},{x:17,y:10},
		{x:23,y:10},{x:23,y:10},{x:12,y:10},{x:12,y:11},{x:11,y:11},
		{x:9,y:12},{x:7,y:14},{x:8,y:15},{x:8,y:16},{x:8,y:17},
		{x:12,y:17},{x:12,y:18},{x:12,y:19},{x:12,y:20},{x:11,y:23},
		{x:12,y:22},{x:13,y:22},{x:14,y:22},{x:11,y:22},{x:1,y:22},
		{x:2,y:22},{x:3,y:22},{x:0,y:20},
		{x:1,y:20},{x:2,y:19},{x:5,y:16},{x:5,y:17},
		{x:5,y:20},{x:6,y:20},{x:6,y:23},{x:17,y:23},
		{x:17,y:21},{x:17,y:23},{x:11,y:14},{x:12,y:14},
		{x:10,y:18},{x:9,y:20},{x:10,y:17},{x:8,y:21},
		{x:17,y:21},{x:17,y:20},{x:16,y:19},{x:15,y:19},{x:18,y:20},
		{x:19,y:20},{x:20,y:20},{x:22,y:20},{x:23,y:20},{x:22,y:22},
		{x:20,y:22},{x:19,y:22},{x:20,y:18},{x:21,y:18},
		{x:22,y:18},{x:23,y:16},{x:21,y:16},{x:20,y:16},
		{x:19,y:16},{x:18,y:18},{x:17,y:16},{x:17,y:16},{x:17,y:17},
		{x:15,y:15},{x:15,y:14},{x:14,y:11},
		{x:15,y:11},{x:18,y:12},{x:18,y:13},{x:21,y:13},{x:21,y:12},
		{x:22,y:12},{x:13,y:17}
	];

	for (var i = 0; i < coords.length; ++i) {
		if (i % 4 == 0) 
			tiles.push(new WallIndestructible(coords[i].x * cellSize, coords[i].y * cellSize));
		else
			tiles.push(new Wall(coords[i].x * cellSize, coords[i].y * cellSize));
	}
}

function initPlayer()
{
	player = [new Player(cellSize*10, cellSize*22)];
	player.push(new Player(cellSize*11, cellSize*1));
}

function findSpawnPosition()
{
	let position = { x:-1,y:-1 };
	do
	{
		position.x = parseInt(Math.random()*23);
		position.y = parseInt(Math.random()*23);
	}
	while(findTile(position.x, position.y) > -1 || findUnit(position.x * cellSize, position.x * cellSize, -1));
	return position;
}

async function initEnemies()
{
	for (let i = 0; i < 10; ++i)
	{
		unit.push(new Unit());
		let newPos = findSpawnPosition();
		unit[unit.length - 1].construct(cellSize * newPos.x, cellSize * newPos.y);
		await wait(800);
	}
}

function isCollisionDetected(otherCoord, currUnit)
{
	if (otherCoord.x == -1)		//	for Y
	{
		switch (findUnit(currUnit.x, otherCoord.y, currUnit.id[currUnit.id.length - 1]))
		{
			case true: return true;
		}
		switch(currUnit.side)
		{
		case sides.top:
			if (otherCoord.y < 0)
			{
				switch(findTile( findNearest(currUnit.x+1)/cellSize,resolution/cellSize - 1 ) == -1 && findTile( findNearest(currUnit.x+31)/cellSize,resolution/cellSize - 1 ) == -1)
				{
					case true: return false;
					case false: return true;
				}
			}
			else if (findTile( findNearest(currUnit.x+1)/cellSize,findNearest(otherCoord.y+1)/cellSize ) > -1 || findTile( findNearest(currUnit.x+31)/cellSize,findNearest(otherCoord.y+1)/cellSize ) > -1) return true;
			break;
		case sides.bottom:
			if (otherCoord.y > resolution - cellSize || otherCoord.y == 0)
			{
				switch (findTile( findNearest(currUnit.x+1)/cellSize,0 ) > -1 || findTile( findNearest(currUnit.x+31)/cellSize,0 ) > -1)
				{
					case true: return true;
					case false: return false;
				}
			}
			else if (currUnit.y >= 0 && (findTile( findNearest(currUnit.x+1)/cellSize,findNearest(otherCoord.y)/cellSize+1 ) > -1 || findTile( findNearest(currUnit.x+31)/cellSize,findNearest(otherCoord.y)/cellSize+1 ) > -1))
			{
				return true;
			}
			break;
		}
	}
	else if (otherCoord.y == -1)	//	for X
	{
		switch (findUnit(otherCoord.x, currUnit.y, currUnit.id[currUnit.id.length - 1]))
		{
			case true: return true;
		}
		switch(currUnit.side)
		{
		case sides.right:
			if (otherCoord.x > resolution - cellSize || otherCoord.x == 0)
			{
				switch(!(findTile( 0,findNearest(currUnit.y+1)/cellSize ) == -1 && findTile( 0,findNearest(currUnit.y+31)/cellSize ) == -1))
				{
					case true: return true;
					case false: return false;
				}
			}
			else if ((otherCoord.x > 0 && otherCoord.x <= resolution - cellSize) && (findTile( findNearest(otherCoord.x)/cellSize+1,findNearest(currUnit.y+1)/cellSize ) > -1 || findTile( findNearest(otherCoord.x)/cellSize+1,findNearest(currUnit.y+31)/cellSize ) > -1)) return true;
			break;
		case sides.left:
			if (otherCoord.x < 0)
			{
				switch (findTile( resolution/cellSize-1,findNearest(currUnit.y+1)/cellSize ) > -1 || findTile( resolution/cellSize-1,findNearest(currUnit.y+31)/cellSize ) > -1)
				{
				case true: return true;
				case false: return false;
				}
			}
			if (otherCoord.x >= 0 && (findTile( findNearest(otherCoord.x+1)/cellSize,findNearest(currUnit.y+1)/cellSize ) > -1 || findTile( findNearest(otherCoord.x+1)/cellSize,findNearest(currUnit.y+31)/cellSize ) > -1)) return true;
			break;
		}
	}
	return false;
}

function findNearest(value)
{
	if (value < 32) return 0;
	nearestValue = 0;
	for (; nearestValue < value; nearestValue += cellSize) {
	}
	return nearestValue -= cellSize;
}

function findUnit(x,y, id)
{
	switch (id)
	{
	case -1:
		for (var i = 0; i < unit.length; ++i)
		{
			if (i != id && Math.abs(x - unit[i].x) < 32 && Math.abs(y - unit[i].y) < 32) return true;
		}
		return false;
	}
	for (var i = 0; i < unit.length; ++i)
	{
		if (i != id && (unit[i].id == `unit${id}` || unit[i].id == `player${id}`)) id = i;
	}
	switch (unit[id].side)
	{
	case sides.top:
		if (y < 0)
		{
			y = resolution - cellSize;
		}
		break;
	case sides.right:
		if (x > resolution - cellSize)
		{
			x = 0;
		}
		break;
	case sides.bottom:
		if (y > resolution - cellSize)
		{
			y = 0;
		}
		break;
	case sides.left:
		if (x < 0)
		{
			x = resolution - cellSize;
		}
		break;
	}
	for (var i = 0; i < unit.length; ++i)
	{
		if (i != id && Math.abs(x - unit[i].x) < 32 && Math.abs(y - unit[i].y) < 32) return true;
	}
	return false;
}

function findTile(x, y)
{
	for (var i = 0; i < coords.length; ++i) {
		if (coords[i] != undefined && coords[i].x == x && coords[i].y == y) return i;
	}
	return -1;
}

if (DEBUG) document.addEventListener('keydown', (e) => {
	switch (e.keyCode)
	{
	case 49: 	//	1 number
		selectedTileModel = tileModel.wall;
		return;
	case 50: 	//	2	number
		selectedTileModel = tileModel.wallIndestructible;
		return;
	}
});

if (DEBUG) document.addEventListener('click', function(event) {
	var _x = findNearest(event.clientX);
	var _y = findNearest(event.clientY);
	if (findTile(_x / cellSize, _y / cellSize) == -1 && _x < resolution && _y < resolution)
	{
		coords.push({ x:_x/cellSize , y:_y/cellSize });
		if (selectedTileModel == tileModel.wall)
			tiles.push(new Wall(coords[coords.length - 1].x * cellSize, coords[coords.length - 1].y * cellSize));
		else
			tiles.push(new WallIndestructible(coords[coords.length - 1].x * cellSize, coords[coords.length - 1].y * cellSize));
	}
});

if (DEBUG) document.addEventListener("contextmenu", function(event){
	event.preventDefault();
	var _x = findNearest(event.clientX);
	var _y = findNearest(event.clientY);
	let tileId = -1;
	for (let i = 0; i < tiles.length; ++i)
	{
		if (tiles[i].x == _x && tiles[i].y == _y) tileId = tiles[i].id;
	}
	if (tileId == -1) { alert(`ERROR: tileId == ${tileId}.\nwhen x,y of tile: ${_x},${_y}`); return; }
	gameZone.removeChild(document.querySelector(`#wall${tileId}`));
	coords[tileId] = undefined;
	tiles.splice(tileId,1);
});

function initGameZone()
{
	indent = parseInt((window.innerWidth - 768) / 2);
	gameZone = document.querySelector('#gameZone');

	gameZone.style.padding = '0';
	gameZone.style.margin = '0';
	gameZone.style.position = 'relative';
	gameZone.style.overflow = 'hidden';

	gameZone.style.height = `${resolution}px`;
	gameZone.style.width = `${resolution}px`;

	(DEBUG) ? gameZone.style.margin = '0' : gameZone.style.margin = `0 ${indent}px`;

	gameZone.style.backgroundImage = 'url("source/sprite/ground.png")';
}

function initBackground()
{
	body = document.querySelector('body');
	if (window.innerHeight > resolution) (DEBUG) ? body.style.margin = '0' : body.style.margin = `${(window.innerHeight - resolution) / 2}px 0`;
	body.style.backgroundImage = 'url("source/image/particles.webp")';
	body.style.backgroundRepeat = 'no-repeat';
	body.style.backgroundPosition = 'top left';
	body.style.backgroundAttachment = 'fixed';
	body.style.backgroundClip = 'padding-box';
	body.style.backgroundSize = 'cover';
}

function wait(ms)
{
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function initInts()
{
	interval = setInterval(() => {
		for (var i = 0; i < movableObject.length; ++i)
		{
			movableObject[i].move();
		}
	}, fps);
}

function defineEndOfGame()
{
	switch (unit.length)
	{
	case 1:
		if (unit[0].id.includes(`player`))
			alert(`Congratulations on win the game!`);
		else
			alert(`You lose!`);
		location.reload(true);
		return; 
	}
	isLose = true;
	for (let i = 0; i < unit.length; ++i)
	{
		switch (unit[i].id.includes(`player`))
		{
			case true: isLose = false;
			case false: continue;
		}
	}
	switch (isLose)
	{
	case true:
		alert(`You lose!`);
		location.reload(true);
		return;
	case false: return;
	}
}

function game()
{
	step = 8;
	fps = 65;

	cellSize = 32;
	cellCount = 24;
	resolution = cellSize * cellCount;

	movableObject = [];
	
	tiles = [];
	coords = [];
	unit = [];
	bullet = [];

	if (DEBUG)
	{
		tileModel = { wall : 0, wallIndestructible : 1 };
		selectedTileModel = tileModel.wall;
	}

	initInts();
	initBackground();
	initGameZone();
	initPlayer();
	initEnemies();
	placeTilesOnMap();
}

game();