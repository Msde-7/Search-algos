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

function printBoard(board) {
    const map = board.map;
    for(let i =0; i <map.length; i++) {
        let line = "";
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
        console.log(line);
    }
}

function PrintPath(board, nodes) {
    const map = board.map
    for(let i =0; i <map.length; i++) {
        let line = "";
        for(var j = 0; j<map[i].length; j++) {
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
    console.log()
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
        while(this.searchOver == false) {
            const timeOut = (secs) => new Promise((res) => setTimeout(res, secs * 1000));
            await timeOut(.5);
            this.#updateBoard();
            }
            
        if(this.pathFound)
            this.#computePath();
            bButton.disabled = false;
            dButton.disabled = false;
    }

    #computePath() {
        const nodes = new Set();
        let node = this.finNode;
        while(node.parent != null) {
            node = node.parent;
            console.log(node);
            nodes.add(node);   
        }

        PrintPath(this, nodes);
    }

    #firstUpdate() {
        this.#curNode = this.startNode;
        this.startNode.isExplored = true;
        this.#queue.push(this.startNode);
        printBoard(this);
    }

    #updateBoard() {
        this.turn();  
    }

    turn() { 
        if(this.finNode.isExplored) {
            this.searchOver = true;
            this.pathFound = true;
        } else if(this.#queue.length == 0) {
            this.searchOver = true;
            this.pathFound = false;
        } else {
            this.#curNode = this.#queue.pop();
            for(const n of this.#curNode.neighbors) {
                if(!n.isExplored) {
                    n.isExplored = true;
                    n.parent = this.#curNode;
                    console.log(this.algo)
                    if(this.algo == "depth")
                        this.#queue.push(n);                    
                    else
                        this.#queue.unshift(n);                                     
                    }
            }
            let past = this.#curNode;
            console.log(this.#queue);
           // this.#curNode = this.#queue.pop();
            console.log(this.#curNode);
            console.log(this.#curNode.neighbors);
        }
        printBoard(this);
    }

    #calcNodeBorders() {   
        for (let i = 0; i < this.map.length; i++)
            for (let j = 0; j < this.map[0].length; j++) {
                if(this.map[i][j] != null) {
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
    }

    addNeighbor(node) {
        this.neighbors.push(node);
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

printBoard(new Board(map1, {x: 0,y: 0}, {x:8, y:6}, ""));

dButton.onclick = function() {
    bButton.disabled = true;
    dButton.disabled = true;
    resetBoard(map1);
    globCan.context.clearRect(0, 0, globCan.canvas.width, globCan.canvas.height);
    let board = new Board(map1, {x: 0,y: 0}, {x:8, y:6}, "depth");
    board.runAlgo();
}

bButton.onclick = function() {
    bButton.disabled = true;
    dButton.disabled = true;
    resetBoard(map1);
    globCan.context.clearRect(0, 0, globCan.canvas.width, globCan.canvas.height);
    let board = new Board(map1, {x: 0,y: 0}, {x:8, y:6}, "breadth");
    board.runAlgo();
}