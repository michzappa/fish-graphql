var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var _ = require("underscore");
// all the cards in the game, a 54 card deck
var cards = [
    "2-H",
    "3-H",
    "4-H",
    "5-H",
    "6-H",
    "7-H",
    "9-H",
    "10-H",
    "J-H",
    "Q-H",
    "K-H",
    "A-H",
    "2-D",
    "3-D",
    "4-D",
    "5-D",
    "6-D",
    "7-D",
    "9-D",
    "10-D",
    "J-D",
    "Q-D",
    "K-D",
    "A-D",
    "2-S",
    "3-S",
    "4-S",
    "5-S",
    "6-S",
    "7-S",
    "9-S",
    "10-S",
    "J-S",
    "Q-S",
    "K-S",
    "A-S",
    "2-C",
    "3-C",
    "4-C",
    "5-C",
    "6-C",
    "7-C",
    "9-C",
    "10-C",
    "J-C",
    "Q-C",
    "K-C",
    "A-C",
    "8-H",
    "8-D",
    "8-S",
    "8-C",
    "B-J",
    "R-J",
];
var Room = /** @class */ (function () {
    function Room(data) {
        this.team1 = new Team({});
        this.team2 = new Team({});
        this.move = "";
        this.turn = "";
        this.cards = _.shuffle(cards);
        Object.assign(this, data);
    }
    // returns the next hand of cards in this room's deck (nine cards)
    Room.prototype.getNextHand = function () {
        var hand = [];
        for (var i = 0; i < 9; i += 1) {
            var card = this.cards[this.cards.length - 1];
            this.cards.pop();
            hand.push(card);
        }
        return hand;
    };
    // adds a player to this room
    Room.prototype.addPlayer = function (playerName) {
        var team1players = this.team1.players;
        var team1size = team1players.length;
        var team2players = this.team2.players;
        var team2size = team2players.length;
        var teamAdded;
        if (team1size > 2 && team2size > 2) {
            // do nothing as both teams are full
        }
        else {
            var hand = this.getNextHand();
            this.turn = playerName;
            // randomly put the new player into a team, except if one team is full
            if (Math.random() < 0.5) {
                // want to add to team 1
                if (team1size > 2) {
                    this.team2.addPlayer(playerName, hand);
                    team2size += 1;
                    teamAdded = "team2";
                    return teamAdded;
                }
                else {
                    this.team1.addPlayer(playerName, hand);
                    team1size += 1;
                    teamAdded = "team1";
                    return teamAdded;
                }
            }
            else {
                if (team2size > 2) {
                    this.team1.addPlayer(playerName, hand);
                    team1size += 1;
                    teamAdded = "team1";
                    return teamAdded;
                }
                else {
                    this.team2.addPlayer(playerName, hand);
                    team2size += 1;
                    teamAdded = "team2";
                    return teamAdded;
                }
            }
        }
    };
    return Room;
}());
var Team = /** @class */ (function () {
    function Team(data) {
        this.players = [];
        this.claims = [];
        Object.assign(this, data);
    }
    // adds a player with the given name and hand to this team
    Team.prototype.addPlayer = function (playerName, hand) {
        console.log("adding player " + playerName + " to team in team method");
        this.players.push(new Player({ name: playerName, hand: hand }));
    };
    return Team;
}());
var Player = /** @class */ (function () {
    function Player(data) {
        this.name = "";
        this.hand = [];
        Object.assign(this, data);
    }
    return Player;
}());
var express = require("express");
var cors = require("cors");
var graphqlHTTP = require("express-graphql");
var gql = require("graphql-tag");
var buildASTSchema = require("graphql").buildASTSchema;
var schema = buildASTSchema(gql(__makeTemplateObject(["\n  type Query {\n    rooms: [Room]\n    room(name: String!): Room\n    getMove(roomName: String): String\n    getTurn(roomName: String): String\n    getTeam(roomName: String, teamName: String): Team\n    getClaims(roomName: String, teamName: String): [String]\n    getPlayer(roomName: String, teamName: String, playerName: String): Player\n  }\n\n  type Mutation {\n    addRoom(roomName: String): Room\n    deleteRoom(roomName: String): [Room]\n    addPlayer(roomName: String, playerName: String): String\n    changeMove(roomName: String, move: String): Room\n    changeTurn(roomName: String, turn: String): Room\n    addClaim(roomName: String, teamName: String, claim: String): Team\n    addCardToPlayer(\n      roomName: String\n      teamName: String\n      playerName: String\n      card: String\n    ): Player\n    removeCardFromPlayer(\n      roomName: String\n      teamName: String\n      playerName: String\n      card: String\n    ): Boolean\n    setPlayerHand(\n      roomName: String\n      teamName: String\n      playerName: String\n      hand: [String]\n    ): Player\n  }\n\n  type Room {\n    name: String\n    team1: Team\n    team2: Team\n    cards: [String]!\n    move: String!\n    turn: String!\n  }\n\n  type Team {\n    players: [Player]\n    claims: [String]\n  }\n\n  type Player {\n    name: String\n    hand: [String]\n  }\n"], ["\n  type Query {\n    rooms: [Room]\n    room(name: String!): Room\n    getMove(roomName: String): String\n    getTurn(roomName: String): String\n    getTeam(roomName: String, teamName: String): Team\n    getClaims(roomName: String, teamName: String): [String]\n    getPlayer(roomName: String, teamName: String, playerName: String): Player\n  }\n\n  type Mutation {\n    addRoom(roomName: String): Room\n    deleteRoom(roomName: String): [Room]\n    addPlayer(roomName: String, playerName: String): String\n    changeMove(roomName: String, move: String): Room\n    changeTurn(roomName: String, turn: String): Room\n    addClaim(roomName: String, teamName: String, claim: String): Team\n    addCardToPlayer(\n      roomName: String\n      teamName: String\n      playerName: String\n      card: String\n    ): Player\n    removeCardFromPlayer(\n      roomName: String\n      teamName: String\n      playerName: String\n      card: String\n    ): Boolean\n    setPlayerHand(\n      roomName: String\n      teamName: String\n      playerName: String\n      hand: [String]\n    ): Player\n  }\n\n  type Room {\n    name: String\n    team1: Team\n    team2: Team\n    cards: [String]!\n    move: String!\n    turn: String!\n  }\n\n  type Team {\n    players: [Player]\n    claims: [String]\n  }\n\n  type Player {\n    name: String\n    hand: [String]\n  }\n"])));
var ROOMS = new Map();
var root = {
    rooms: function () { return ROOMS.values(); },
    room: function (_a) {
        var name = _a.name;
        return ROOMS.get(name);
    },
    getMove: function (_a) {
        var roomName = _a.roomName;
        var room = ROOMS.get(roomName);
        return room.move;
    },
    getTurn: function (_a) {
        var roomName = _a.roomName;
        var room = ROOMS.get(roomName);
        return room.turn;
    },
    getTeam: function (_a) {
        var roomName = _a.roomName, teamName = _a.teamName;
        var team = ROOMS.get(roomName)[teamName];
        return team;
    },
    getClaims: function (_a) {
        var roomName = _a.roomName, teamName = _a.teamName;
        var team = ROOMS.get(roomName)[teamName];
        return team.claims;
    },
    getPlayer: function (_a) {
        var roomName = _a.roomName, teamName = _a.teamName, playerName = _a.playerName;
        var players = ROOMS.get(roomName)[teamName].players;
        console.log(players);
        var wantedPlayer;
        players.forEach(function (player) {
            if (player.name == playerName) {
                wantedPlayer = player;
            }
        });
        return wantedPlayer;
    },
    addRoom: function (_a) {
        var roomName = _a.roomName;
        ROOMS.set(roomName, new Room({ name: roomName }));
        return ROOMS.get(roomName);
    },
    deleteRoom: function (_a) {
        var roomName = _a.roomName;
        ROOMS.delete(roomName);
        return ROOMS.values();
    },
    addPlayer: function (_a) {
        var roomName = _a.roomName, playerName = _a.playerName;
        var room = ROOMS.get(roomName);
        var team = room.addPlayer(playerName);
        //return ROOMS.get(roomName);
        console.log(team);
        return team;
    },
    changeMove: function (_a) {
        var roomName = _a.roomName, move = _a.move;
        var room = ROOMS.get(roomName);
        room.move = move;
        return room;
    },
    changeTurn: function (_a) {
        var roomName = _a.roomName, turn = _a.turn;
        var room = ROOMS.get(roomName);
        room.turn = turn;
        return room;
    },
    addClaim: function (_a) {
        var roomName = _a.roomName, teamName = _a.teamName, claim = _a.claim;
        var team = ROOMS.get(roomName)[teamName];
        team.claims.push(claim);
        return team;
    },
    addCardToPlayer: function (_a) {
        var roomName = _a.roomName, teamName = _a.teamName, playerName = _a.playerName, card = _a.card;
        var players = ROOMS.get(roomName)[teamName].players;
        console.log(players);
        var wantedPlayer = new Player({});
        ;
        players.forEach(function (player) {
            if (player.name == playerName) {
                wantedPlayer = player;
            }
        });
        wantedPlayer.hand.push(card);
        return wantedPlayer;
    },
    setPlayerHand: function (_a) {
        var roomName = _a.roomName, teamName = _a.teamName, playerName = _a.playerName, hand = _a.hand;
        var players = ROOMS.get(roomName)[teamName].players;
        console.log(players);
        var wantedPlayer = new Player({});
        players.forEach(function (player) {
            if (player.name == playerName) {
                wantedPlayer = player;
            }
        });
        wantedPlayer.hand = hand;
        return wantedPlayer;
    },
};
var initializeData = function () {
    var fakeRooms = [
        {
            name: "test",
            team1: new Team({
                players: [new Player({ name: "michael", hand: ["a"] })],
                claims: [],
            }),
            team2: new Team({
                players: [new Player({ name: "ryan", hand: ["b"] })],
                claims: [],
            }),
            cards: _.shuffle(cards),
            move: "",
            turn: "",
        },
        {
            name: "ireland",
            team1: new Team({ players: [new Player({ name: "owen", hand: ["c"] })] }),
            team2: new Team({ players: [new Player({ name: "erin", hand: ["d"] })] }),
            cards: _.shuffle(cards),
            move: "",
            turn: "",
        },
    ];
    fakeRooms.forEach(function (room) { return ROOMS.set(room.name, new Room(room)); });
};
//initializeData();
ROOMS.set("test", new Room({ name: "test" }));
var app = express();
app.use(cors());
app.use("/graphql", graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));
app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
