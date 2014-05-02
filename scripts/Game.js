var Game = {
    options: {
        fontSize: 28,
        fontFamily: "droid sans mono, monospace",
        spacing: 1.1,
        width: 1,
        height: 1
    },   
    display: null,
    map: {}, // {} is shortcut for new Object(), which we can use to emulate a dictionary type array
    player: null,
    engine: null,
    treasure: null,
    monster: null,
    
    init: function() {        
        // use rot.js to make a display object for the game
        this.display = new ROT.Display(this.options);
        // append the display to the page!
        document.body.appendChild(this.display.getContainer());        
        
        this._resize();

        window.addEventListener("resize", this._resize.bind(this));

        this._generateMap();
        // use rot.js simple scheduler for round robin turns
        var scheduler = new ROT.Scheduler.Simple();
        // add player to the scheduler, true sets it as recurring
        scheduler.add(this.player, true);
        scheduler.add(this.monster, true);
        // create rot.js engine, which takes care of the main game loop and needs a scheduler object
        this.engine = new ROT.Engine(scheduler);
        // lets get this shit started
        this.engine.start();
        
    },    
    /* TODO: implement some resizing of the font to make the game fit on smaller screen */
    _resize: function() {        
        var size = this.display.computeSize(window.innerWidth, window.innerHeight);
        this.display.setOptions({width:size[0], height:size[1]});
    },

    _generateMap: function() {
        // this creates a rot.js map object
        var digger = new ROT.Map.Digger(80,25);
        // array for empty cells
        var freeCells = [];
        
        // callback method to pass to the map create method to store our map
        // the callback method requires x,y, and value params
        var digCallBack = function(x, y, value) {
            // create a key for our map array of the x y coordinates
            var key = x+","+y;
            // value will be 1 for walls, 0 for empty space
            if (value) {
                return; // waaaaaaall
            }
            else { 
                this.map[key] = ".";
                // also add this coordinate to the freeCells array
                freeCells.push(key);
            }
        };
        // the create method creates the map and calls the callback method for every map cell generated
        digger.create(digCallBack.bind(this));
        
        this._generateBoxes(freeCells);
        this._drawWholeMap();
        this.player = this._createActor(Player, freeCells);
        this.monster = this._createActor(Monster, freeCells);
    },
    
    /**
     *  This function just creates ten random boxes and puts them in free cells
     **/
    _generateBoxes: function(freeCells) {
        for(var i=0;i<10;i++) {
            // gets a random number by multiplying the current freeCells length and rot.js random number
            var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
            // removes a key from freeCells at the random index(1 removes 1 item)
            //...not sure what the [0] is for
            var key = freeCells.splice(index, 1)[0];
            // put a box there!
            this.map[key] = "*";
            if (!i) { this.treasure = key; } // put some treasure in the first box
        }  
    },
    
    _drawWholeMap: function() {
        // for every coordinate in the map array, draw the tile
        for(var key in this.map) {
            if (this.map.hasOwnProperty(key)) {
                var parts = key.split(",");
                var x = parseInt(parts[0]);
                var y = parseInt(parts[1]);
                this.display.draw(x, y, this.map[key]);
            }
        }
    },
    
    _createActor: function(what, freeCells) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        return new what(x, y);
    }

};  