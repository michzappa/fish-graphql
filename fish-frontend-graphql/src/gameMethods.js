const fetch = require("node-fetch");
// converts an array into a string for use in GraphQL queries
const convertArray = (arr) => {
  let arrString = "";
  arr.forEach((elem) => {
    arrString += `\"${elem}\", `;
  });
  return arrString.slice(0, -2);
};

// deletes the specified card from the player specified by room, team, and name
// cards is an array of cards (strings)
function deleteCards(room, team, playerName, cards) {
  return getPlayerHand(room, team, playerName, (playerHand) => {
    cards.forEach((card) => {
      let cardIndex = playerHand.indexOf(card);
      if (cardIndex > -1) {
        playerHand.splice(cardIndex, 1);
      } else {
        //does nothing to the player's hand as this card was not in it
      }
      const query = `
      mutation{
        setPlayerHand(roomName: "${room}", teamName: "${team}", playerName: "${playerName}", hand: [${convertArray(
        playerHand
      )}]){
          hand
        }
      }`;
      console.log(query);
      return fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query }),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log(`hand after deleting ${card}`);
          console.log(res);
        });
    });
  });
}

// adds the specified card to the hand of the player specified by room, team, and name
function addCard(room, team, playerName, card) {
  return getPlayerHand(room, team, playerName, (playerHand) => {
    playerHand.push(card);
    const query = `
      mutation{
        setPlayerHand(roomName: "${room}", teamName: "${team}", playerName: "${playerName}", hand: [${convertArray(
      playerHand
    )}]){
          hand
        }
      }`;
    console.log(query);
    return fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(`hand after adding ${card}`);
        console.log(res);
      });
  });
}

// performs the action of asking for a card from a player, and the card changing hands
// if the player asked has it
function askForCard(room, teamAsking, playerAsking, playerAsked, card) {
  // is the player asking for this card able to ask for this card
  getPlayerHand(room, teamAsking, playerAsking, (hand) => {
    let canAsk = hand.reduce((acc, cardInHand) => {
      /* console.log(
        cardInHand + "   " + card + "   " + inSameHalfSuit(cardInHand, card)
      ); */
      return acc || inSameHalfSuit(cardInHand, card);
    }, false);
    //console.log(canAsk);
    if (canAsk === false) {
      alert(`You cannot ask for ${card}`);
    } else {
      let teamAsked = teamAsking === "team1" ? "team2" : "team1";

      // does the player being asked have the desired card?
      getPlayerHand(room, teamAsked, playerAsked, (hand) => {
        // find out if the askedPlayer's hand contains the desired card
        let contains = hand.reduce((acc, cardInHand) => {
          return acc || cardInHand === card;
        }, false);

        if (contains) {
          deleteCards(room, teamAsked, playerAsked, [card]);
          addCard(room, teamAsking, playerAsking, card);

          let moveString = `${playerAsking} asked for the ${card} from ${playerAsked}, and received it.`;
          const changeMoveQuery = `
          mutation{
            changeMove(roomName: "${room}", move: "${moveString}"){
              move
            }
          }`;
          fetch("http://localhost:4000/graphql", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: changeMoveQuery }),
          });

          const changeTurnQuery = `
          mutation{
            changeTurn(roomName: "${room}", move: "${playerAsking}"){
              turn
            }
          }`;

          // setting the next turn to be for playerAsking
          fetch("http://localhost:4000/graphql", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: changeTurnQuery }),
          });
        } else {
          let moveString = `${playerAsking} asked for the ${card} from ${playerAsked}, but ${playerAsked} did not have it.`;
          const changeMoveQuery = `
          mutation{
            changeMove(roomName: "${room}", move: "${moveString}"){
              move
            }
          }`;
          fetch("http://localhost:4000/graphql", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: changeMoveQuery }),
          });

          // setting the next turn to be for the player asked, as they didn't have the requested card
          const changeTurnQuery = `
          mutation{
            changeTurn(roomName: "${room}", turn: "${playerAsked}"){
              turn
            }
          }`;

          // setting the next turn to be for playerAsking
          fetch("http://localhost:4000/graphql", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: changeTurnQuery }),
          });
        }
      });
    }
  });
}

// gets the hand of the specified player and performs the given callback function on it
function getPlayerHand(room, team, playerName, callBack) {
  const query = `
  {
    getPlayer(roomName: "${room}", teamName: "${team}", playerName: "${playerName}") {
      hand
    }
  }`;
  return fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: query }),
  })
    .then((res) => res.json())
    .then((res) => {
      let playerHand = res.data.getPlayer.hand;
      //console.log(playerHand);
      callBack(playerHand);
    });
}

// checks the validity of the given claim, and if it is valid submits the claim
// claims is a list of [playerName, card] pairs, or a name:, card: object
function makeClaim(room, team, claims) {
  // checking to see if all the cards are in the same half suit, and there are six of them,
  // as in a valid claim
  let cardsInClaim = [];
  claims.forEach((claim) => {
    claim[1].forEach((card) => {
      cardsInClaim.push(card);
    });
  });

  console.log(cardsInClaim);

  // if all the cards could be a valid claim, then we check if each player has what they
  // are said to have and if the claim consists of six cards
  if (allInSameHalfSuit(cardsInClaim) && cardsInClaim.length === 6) {
    // calling the helper, and duplicating the claims array for the accumulator
    makeClaimHelp(room, team, claims, claims.slice());
  } else {
    alert("That was not a valid claim");
  }
}

// checks the validity of a claim, keeping track of which [player, cards]
// have yet to be checked, and maintaing the original list of claims for
// processing should they all be valid claims
function makeClaimHelp(room, team, claims, claimsLeft) {
  let currentPair = claimsLeft.pop();

  if (currentPair) {
    let playerName = currentPair[0];

    let cards = currentPair[1];

    getPlayerHand(room, team, playerName, (initHand) => {
      // find out if the askedPlayer's hand contains the desired card
      let contains;
      if (cards) {
        contains = cards.reduce((acc, cardInHand) => {
          console.log(
            `${playerName} has card ${cardInHand}: ${initHand.indexOf(
              cardInHand > -1
            )}`
          );
          return acc || initHand.indexOf(cardInHand) > -1;
        }, false);
      }

      if (contains) {
        if (claimsLeft.length > 0) {
          makeClaimHelp(room, team, claims, claimsLeft);
        } else {
          // putting the claimed cards together, to be added to the team's claims
          let completeClaim = [];
          claims.forEach((claim) => {
            completeClaim.push(claim[1]);
          });
          // turning the completeClaim array of arrays into something to post to the database
          let completeClaimString = completeClaim.flat().toString();

          // putting the claim into the team's claim field
          const addClaimQuery = `
          mutation{
            addClaim(roomName: "${room}", teamName: "${team}", claim: "${completeClaimString}"){
              claims
            }
          }`;
          fetch("http://localhost:4000/graphql", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: addClaimQuery }),
          });

          claims.forEach((claim) => {
            let curPlayerName = claim[0];
            let curCards = claim[1];
            deleteCards(room, team, curPlayerName, curCards);
          });

          // setting the last move to be this claim being made
          let moveString = `${team} made the claim ${completeClaimString}.`;
          const changeMoveQuery = `
          mutation{
            changeMove(roomName: "${room}", move: "${moveString}"){
              move
            }
          }`;
          fetch("http://localhost:4000/graphql", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: changeMoveQuery }),
          });
        }
      } else {
        alert("The claim was not correct");
      }
    });
  }
}

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

// are these two cards in the same half suit, and thus the owner
// of one can ask for the other. But it returns false if the two
// cards are the same card
function inSameHalfSuit(card1, card2) {
  let card1Index = cards.indexOf(card1);
  let card2Index = cards.indexOf(card2);

  //console.log(card1Index / 6 + "  " + card2Index / 6);
  if (card1Index === card2Index) {
    return false;
  }
  return Math.floor(card1Index / 6) === Math.floor(card2Index / 6);
}

// are all of the cards in the given list in the same half suit?
function allInSameHalfSuit(cards) {
  let lastCard = cards.pop();
  //console.log("Last card: " + lastCard);

  let allInSameHalfSuit = cards.reduce((acc, card) => {
    //console.log("card being checked: " + card);
    return acc && inSameHalfSuit(lastCard, card);
  }, true);
  //console.log(allInSameHalfSuit);
  return allInSameHalfSuit;
}
/* 
// updates the state of the hand, which is given to the ShowHand component
function updateHand() {
  fetch(
    "https://fish-backend.herokuapp.com/rooms/" +
      this.state.roomName +
      "/teams/" +
      this.state.teamName +
      "/users/" +
      this.state.playerName
  )
    .then((res) => res.json())
    .then((res) => {
      // sorting cards by suit
      let sortedBySuit = res.hand.sort((first, second) => {
        return first.slice(-1).localeCompare(second.slice(-1));
      });
      // sorting by card number, preserving order of suits
      let sortedByNumber = sortedBySuit.sort((first, second) => {
        if (first.slice(-1).localeCompare(second.slice(-1)) === 0) {
          return first.slice(0, 2).localeCompare(second.slice(0, 2));
        }
        return first.slice(-1).localeCompare(second.slice(-1));
      });
      let handString = sortedByNumber.join(", ");
      this.setState({ hand: handString });
    });
}

// sets a state field to an array of this player's teammates
function getTeammates() {
  fetch(
    "https://fish-backend.herokuapp.com/rooms/" +
      this.state.roomName +
      "/teams/" +
      this.state.teamName
  )
    .then((res) => res.json())
    .then((res) => {
      let players = Object.keys(res.players);
      let score = res.claims.length;
      this.setState({ teammates: players, teamScore: score });
    });
}

// sets a state field to an array of this player's opponents
function getOpponents() {
  let opponentTeam;
  if (this.state.teamName === "team1") {
    opponentTeam = "team2";
  } else {
    opponentTeam = "team1";
  }
  fetch(
    "https://fish-backend.herokuapp.com/rooms/" +
      this.state.roomName +
      "/teams/" +
      opponentTeam
  )
    .then((res) => res.json())
    .then((res) => {
      let players = Object.keys(res.players);
      let score = res.claims.length;
      this.setState({ opponents: players, opponentsScore: score });
    });
} */

module.exports = {
  askForCard,
  makeClaim,
  inSameHalfSuit,
  //updateHand,
  //getTeammates,
  //getOpponents,
};
