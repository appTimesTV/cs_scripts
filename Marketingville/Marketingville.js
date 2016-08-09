var correctSound = DX.resource("729d3c7b54e2511e0d7b16352b869f74defb64d9d7448620ecd7fba4c45fbe94");
var incorrectSound = DX.resource("e930c4b7700aa3d7a1d0d4da9f275f090c0b4bcc50356f5d32c309bd10bcd5ce");
var tryAgainSound = DX.resource("d0f319700574fb088caf6264da8643f378e617a1e04bec7c8d1275bfa8b4ff5a");
var alreadyFoundSound = DX.resource("befc438e7a51cd3efbea53aa6558007a1b16ff8e530cf8791d14fd9a8e4db9fe");

class Game {
    constructor() {
        this._name2ItemsMap = new Map();
        this._tasks = [];
        this._currentTaskIndex = -1;
    }

    init(name2SoundMap) {
        this._name2SoundMap = name2SoundMap;
        var that = this;
        DX.items().forEach(function(item) {
            var name = item.name();
            if (name !== undefined && name !== null && name.length > 0){
                //adding only items with names
                var items = that._name2ItemsMap.get(name);
                if (items === undefined) {
                    items = [item];
                    that._name2ItemsMap.set(name, items);
                } else {
                    items.push(item);
                }
                item.activate(function() {
                    if (gameFinished) return;
                    var task = that.findTask(item.name());
                    if (task !== undefined) {
                        var currentTask = that._tasks[that._currentTaskIndex];
                        if (task === currentTask) {
                            // DX.log("This item belongs to the current task.")
                            var items = that._name2ItemsMap.get(currentTask.name);
                            var idx = items.indexOf(item);
                            if (idx > -1) {
                                items.splice(idx, 1);
                                that._name2ItemsMap.set(currentTask.name, items);
                                var finished = items.length === 0;
                                // DX.log(items.length + " items left for the task");
                                correctSound.play(function() {
                                    // DX.log("Finished? " + finished);
                                    incorrectSound.stop(); //just in case
                                    if (finished) {
                                        // DX.log("Done with the task.")
                                        that.nextTask();
                                    }
                                });
                            } else {
                                //already removed
                                incorrectSound.stop(); //just in case
                                alreadyFoundSound.play(function() {
                                    tryAgainSound.play();
                                });
                            }
                        } else {
                            correctSound.stop(); //just in case
                            tryAgainSound.stop();
                            incorrectSound.play();
                        }
                    } else {
                        DX.log("Item has no tasks assigned: " + item.name());
                        correctSound.stop(); //just in case
                        tryAgainSound.stop();
                        incorrectSound.play();
                    }
                });
            }
        });

        this._name2SoundMap.forEach(function(value, key){
            that.addTask(key);
        });
    }

    taskCount() {
        return this._tasks.length;
    }

    addTask(name) {
        var items = this._name2ItemsMap.get(name);
        if (items !== undefined && items.length > 0){
            // DX.log("Adding task [" + name + "] with " + items.length + " items.");
            this._tasks.push(new Task(name, items.length));
        }
    }

    findTask(name) {
        // DX.log("findTask for " + name);
        for (let i = 0; i < this._tasks.length; i++) {
            if (name === this._tasks[i].name) {
                // DX.log("[findTask] Returning " + name);
                return this._tasks[i];
            }
        }
        return undefined;
    }

    nextTask() {
        this._currentTaskIndex++;
        if (this._currentTaskIndex < this._tasks.length) {
            this._name2SoundMap.get(this._tasks[this._currentTaskIndex].name).play();
        } else {
            gameFinished = true;
            //game is finished
            //now what?
        }
    }

    start() {
        this.nextTask();
    }
}

class Task {
    constructor(name, count) {
        this.name = name;
        this.count = count;
    }
}

function soundMap() {
    return new Map([
        ["red train", DX.resource("76ababf9df9668a04ee327911b7b7189d3ba3ce95e28525ea4157473d056d3dd")],
        ["blue car", DX.resource("766d1f64907a2ca336d9e06e40b6a9c3b8aa13797a127f5867ce27fcc7b39c17")],
        ["yellow bike", DX.resource("dacb3375303d3b46fd894903cb27c1445fa3a10c9a01fe1d9388d3e543c79f5")],
        ["pink skateboard", DX.resource("e57c24339e73abcb7ac4e9806ac20e391d7df68d72f8c2b660469d5e2d71c4dd")]
    ]);
}

var game = new Game();
var gameFinished = false;
game.init(soundMap());
game.start();

