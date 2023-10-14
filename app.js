class Canvas {
    constructor() {
        this.canvas = document.getElementById("myCanvas"),
        this.pixelSize= Math.sqrt(this.canvas.width) * 2;
        this.context = this.canvas.getContext("2d");
    }

    updatePixel(x, y, type) {
        this.context.fillStyle = type;
        this.context.fillRect(x * this.pixelSize + 1, y * this.pixelSize + 1, this.pixelSize - 1, this.pixelSize - 1);
        
    }
}

const globCan = new Canvas();
const dButton = document.getElementById("depth");
const bButton = document.getElementById("breadth");
const dMButton = document.getElementById("depth_map");
const bMButton = document.getElementById("breadth_map");



function printBoard(board) {
    console.log("printing board")
    const map = board.map;
        let line = "";
        for(let i =0; i <map.length; i++) 
        for(var j = 0; j<map[i].length; j++) {
            let color = "";
            if(map[i][j] == board.startNode) {
                line += "[s]";
                color = "green";
            }
            else if(map[i][j] == board.finNode) {
                line+="[f]"
                color = "red";
            }
            else if(map[i][j] == null) {
                line += "[ ]";
                color = "black";
            }
            else if(map[i][j].isExplored == false) {
                line += "[o]";
                color = "blue";
            }
            else {
                line += "[-]";
                color = "yellow";
            }
            globCan.updatePixel(j, i, color);
            
        }
}

function printPath(board, nodes) {
    const map = board.map
    for(let i =0; i <map.length; i++) {
        let line = "";
        for(var j = 0; j<map[i].length; j++) {
            let color = "";
            if(map[i][j] == board.startNode) {
                 line += "[s]";
                 color = "green";
            }
            else if(map[i][j] == board.finNode){
                line+="[f]";
                color = "red";
            }
            else if(nodes.has(map[i][j])) {
                line+= "[p]";
                color = "purple";
            }
            else if(map[i][j] == null)  {
                line += "[ ]";
                color = "black";
            }
            else if(map[i][j].isExplored == false) {
                line += "[o]";
                color = "blue";
            }
            else {
                line += "[-]";
                color = "yellow";
            }
            globCan.updatePixel(j, i, color);
        }
        console.log(line);
    }
}

class Board {
    #queue = [];
    #curNode;

    constructor(map, start = {x, y}, finish = {x, y}, algo) {
        this.map = map;
        this.start = start;
        this.finish = finish;
        this.algo = algo;
        this.startNode = map[this.start.y][this.start.x];
        this.finNode = map[this.finish.y][this.finish.x];
        this.searchOver = false;
        this.pathFound = false;
        this.#firstUpdate();
        this.#calcNodeBorders();
    }

    async runAlgo() {
        console.log("algo been run");
        while(this.searchOver == false) {           
                this.turn();
                const timeOut = (secs) => new Promise((res) => setTimeout(res, secs * 1000));
                await timeOut(.1);
                printBoard(this);
            }
            if(this.pathFound)
                this.#computePath();
        bButton.disabled = false;
        dButton.disabled = false;
        dMButton.disabled = curM != 'b';
        bMButton.disabled = curM != 'd';
    }

    #computePath() {
        const nodes = new Set();
        let node = this.finNode;
        while(node.parent != null) {
            node = node.parent;
            nodes.add(node);   
        }
        printPath(this, nodes);
    }

    #firstUpdate() {
        this.#curNode = this.startNode;
        this.startNode.isExplored = true;
        this.#queue.push(this.startNode);
        printBoard(this);
    }

    reset() {
        resetBoard(this.map);
        this.searchOver = false;
        this.pathFound = false;
        this.startNode = this.map[this.start.y][this.start.x];
        this.finNode = this.map[this.finish.y][this.finish.x];
        this.#queue = [];
        this.#curNode = this.startNode;
        this.#queue.push(this.startNode);
        this.#firstUpdate();
        this.#calcNodeBorders();
    }

    turn() { 
        if(this.finNode.isExplored) {
            this.searchOver = true;
            this.pathFound = true;
            this.#computePath();
            return;
        } else if(this.#queue.length == 0) {
            this.searchOver = true;
            this.pathFound = false;
        } else {
            if(this.algo == "depth")    
                this.#curNode = this.#queue.pop();
            else {
                console.log(this.#queue);
                console.log(this.#curNode.getPos())
                if(this.#curNode.parent != null)
                    console.log(this.#curNode.parent.getPos());
                this.#curNode = this.#queue.shift();
            }
            for(const n of this.#curNode.neighbors) {
                if(!n.isExplored) {
                        n.isExplored = true;
                        n.parent = this.#curNode;
                        this.#queue.push(n);       
                    }
            }
            let past = this.#curNode;
        }
    }

    #calcNodeBorders() {   
        for (let i = 0; i < this.map.length; i++)
            for (let j = 0; j < this.map[0].length; j++) {
                if(this.map[i][j] != null) {
                    this.map[i][j].x = j;
                    this.map[i][j].y = i;
                    if (i != 0)
                        if (this.map[i - 1][j] != null)
                            this.map[i][j].addNeighbor(this.map[i - 1][j]);
                    if (i != this.map.length - 1)
                        if (this.map[i + 1][j] != null)
                        this.map[i][j].addNeighbor(this.map[i + 1][j]);
                    if (j != 0)
                        if (this.map[i][j - 1] != null)
                        this.map[i][j].addNeighbor(this.map[i][j - 1]);

                    if (j != this.map[i].length - 1)
                        if (this.map[i][j + 1] != null)
                            this.map[i][j].addNeighbor(this.map[i][j + 1]);
                }
            }
    }
}

class Node {
    constructor() {
        this.neighbors = [];
        this.parent = null;
        this.inPath = false;
        this.isExplored = false;
        this.x = -1;
        this.y = -1;
    }

    addNeighbor(node) {
        this.neighbors.push(node);
    }

    //Mostly for debugging errors with search and checking node borders
    getPos() {
        return "x: " + this.x + ",y: " + this.y;
    }
}

const map1 = [
    [new Node(), new Node(), null      , null      , null      , null      , null      , null      , null      , null      ],
    [null      , new Node(), null      , null      , null      , new Node(), null      , null      , null      , null      ],
    [null      , new Node(), new Node(), new Node(), new Node(), new Node(), null      , null      , null      , null      ],
    [null      , new Node(), null      , null      , new Node(), null      , null      , null      , null      , null      ],
    [new Node(), new Node(), null      , null      , new Node(), null      , null      , new Node(), new Node(), null      ],
    [new Node(), null      , null      , null      , new Node(), new Node(), new Node(), new Node(), null      , null      ],
    [null      , null      , null      , null      , new Node(), null      , null      , new Node(), new Node(), null      ],
    [null      , null      , null      , null      , new Node(), null      , null      , new Node(), null      , null      ],
    [null      , null      , null      , new Node(), new Node(), new Node(), new Node(), new Node(), null      , null      ],
    [null      , null      , null      , new Node(), null      , null      , null      , null      , null      , null      ]
];

function resetBoard(map) {
    for(let i = 0; i < map.length; i++)
        for(let j = 0; j < map[i].length; j++)
            if(map[i][j] != null)
                map[i][j] = new Node();
}

const depthMap = new Board(map1, {x: 0,y: 0}, {x:8, y:6}, "");
const breadthMap = new Board(map1, {x: 0,y: 0}, {x:0, y:5}, "");


dButton.onclick = function() {
    resOnClick("depth");
}

bButton.onclick = function() {
    resOnClick("breadth");
}

dMButton.onclick = function() {
    curMap = depthMap;
    curM = 'd';
    curMap.reset();
    printBoard(curMap);
    dMButton.disabled = true;
    bMButton.disabled = false;
}

bMButton.onclick = function() {
    curMap = breadthMap;
    curM = 'b';
    curMap.reset();
    printBoard(curMap);
    dMButton.disabled = false;
    bMButton.disabled = true;
}

dMButton.onclick();

printBoard(curMap);

function resOnClick(algo) {
    bButton.disabled = true;
    dButton.disabled = true;
    dMButton.disabled = true;
    bMButton.disabled = true;
    globCan.context.clearRect(0, 0, globCan.canvas.width, globCan.canvas.height);
    curMap.reset();
    curMap.algo = algo;
    curMap.runAlgo();
}


