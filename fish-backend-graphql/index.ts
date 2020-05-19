let _ = require("underscore");

// all the cards in the game, a 54 card deck
const cards = [
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

class Room {
  constructor(data) {
    Object.assign(this, data);
  }
  // returns the next hand of cards in this room's deck (nine cards)
  getNextHand() {
    let hand = [];
    for (let i = 0; i < 9; i += 1) {
      let card = this.cards.pop();
      hand.push(card);
    }
    return hand;
  }

  // adds a player to this room
  addPlayer(playerName) {
    let team1players = this.team1.players;
    console.log(team1players);
    let team1size = Object.keys(team1players).length;
    console.log(team1size);

    let team2players = this.team2.players;
    console.log(team2players);
    let team2size = Object.keys(team2players).length;
    console.log(team2size);
    let teamAdded;

    if (team1size > 2 && team2size > 2) {
      console.log("Both teams full");
    } else {
      console.log(`adding player ${playerName}`);
      let hand = this.getNextHand();
      // randomly put the new player into a team, except if one team is full
      if (Math.random() < 0.5) {
        console.log("want to add to team 1");
        // want to add to team 1
        if (team1size > 2) {
          console.log(`adding player ${playerName} to team2`);
          this.team2.addPlayer(playerName, hand);
          team2size += 1;
          teamAdded = "team2";
        } else {
          console.log(`adding player ${playerName} to team1`);
          this.team1.addPlayer(playerName, hand);
          team1size += 1;
          teamAdded = "team1";
        }
      } else {
        console.log("want to add to team 2");
        if (team2size > 2) {
          console.log(this.team1.players);
          this.team1.addPlayer(playerName, hand);
          team1size += 1;
          teamAdded = "team1";
        } else {
          console.log(this.team2.players);
          this.team2.addPlayer(playerName, hand);
          team2size += 1;
          teamAdded = "team2";
        }
      }
      this.turn = playerName;
    }
  }
}

class Team {
  constructor(data) {
    Object.assign(this, data);
  }

  // adds a player with the given name and hand to this team
  addPlayer(playerName, hand) {
    console.log(`adding player ${playerName} to team in team method`);
    this.players.push(new Player(playerName, hand));
  }
}

class Player {
  constructor(data) {
    Object.assign(this, data);
  }
}

const express = require("express");
const cors = require("cors");
const graphqlHTTP = require("express-graphql");
const gql = require("graphql-tag");
const { buildASTSchema } = require("graphql");

const schema = buildASTSchema(gql`
  type Query {
    rooms: [Room]
    room(name: String!): Room
  }

  type Mutation {
    addPlayer(roomName: String, playerName: String): Room
  }

  type Room {
    name: String
    team1: Team
    team2: Team
    cards: [String]!
    move: String!
    turn: String!
  }

  type Team {
    players: [Player]
  }

  type Player {
    name: String
    hand: [String]
  }
`);

const ROOMS = new Map();

const root = {
  rooms: () => ROOMS.values(),
  room: ({ name }) => {
    return ROOMS.get(name);
  },
  addPlayer: ({ roomName, playerName }) => {
    let room = ROOMS.get(roomName);
    room.addPlayer(playerName);
    return ROOMS.get(roomName);
  },
};

const initializeData = () => {
  const fakeRooms = [
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

  fakeRooms.forEach((room) => ROOMS.set(room.name, new Room(room)));
};

initializeData();

let app = express();
app.use(cors());
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);
app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
