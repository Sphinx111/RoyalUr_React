import React from "react";
import { Component } from "react";
import { Link } from "react-router-dom";

export default class UrGame extends React.Component {
  // This is the wrapper class that holds the game state and manages rendering
  // It also controls the top level game logic, passing props to sub-logic components
  state = null

  constructor(props) {
    super(props);
    this.state = {
      ruleset: "official",
      board: this.setupGameBoard("official"),
      curTeam: 1,
      lastRoll: diceRoll(4),
      tokens: {
        team1: 7,
        team2: 7
      },
      points: {
        team1: 0,
        team2: 0
      }
    }
  }

  componentDidMount() {
    // newBoard = setupGameBoard("official");
    /* this.state = {
      ruleset: this.state.ruleset,
      board: newBoard
    } */
  }

  componentWillUnmount() {

  }

  render() {
    if (this.state.board != null) {
      return (
        <div>
        <StaticUrHeader />
        {this.displayBoard(this.state, this.handleClick)}
        <StaticUrFooter />
        </div>
      );
    }

  }


  handleClick =  (col,row) => {
    console.log("input is y:" + col + ", x:" + row)
    var nextTile = this.moveTile("official",col,row,this.state.lastRoll,this.state.curTeam)
    this.confirmMove([col,row],nextTile, this.state.curTeam)
    console.log("next tile is: " + nextTile)
  }

  setupGameBoard (ruleSet) {
    // returns a blank game board as an array, each tile contains 2 values
    // [0,0] = No tile here
    // [1,0] = Standard Tile, no token on it
    // [2,0] = Bonus tile, no token on it
    // [1,11] = Standard Tile with one team 1 token on it
    // [1,21] = Standard Tile with team 2 token on it
    // [2,23] = Standard Tile with 3 Team 2 tokens on it
    if (ruleSet == "official") {
      return (
        [
        [[2,0],[1,0],[2,0]],
        [[1,0],[1,0],[1,0]],
        [[1,0],[1,0],[1,0]],
        [[1,0],[2,0],[1,0]],
        [[3,1],[1,0],[3,2]],
        [[0,0],[1,0],[0,0]],
        [[2,0],[1,0],[2,0]],
        [[1,0],[1,0],[1,0]]
        ]
      );
    } else if (ruleSet == "defenders") {
      return (
        [
        [[2,11],[1,11],[1,11]],
        [[1,11],[1,11],[1,11]],
        [[1,11],[1,11],[1,11]],
        [[1,0],[2,0],[1,0]],
        [[3,0],[1,0],[3,0]],
        [[0,0],[1,0],[0,0]],
        [[2,21],[1,21],[2,21]],
        [[1,21],[1,21],[1,21]]
        ]
      );
    }
  }

  isMoveValid (endTile, team){
    var y = endTile[0]
    var x = endTile[1]
    var tileState = this.state.board[y][x]
    if (endTile == null) {
      return false
    }

    if (team == 1) {
      // Tiles numbered 20 upwards are the enemy team, and valid landing spots
      if (tileState[1] == 1) {
        return false
        // if the landing square is an occupied rosette, move is invalid
      } else if (tileState[1] == 2 && tileState[0] == 2) {
        return false
      }
      // repeat the steps for team 2
    } else {
      if (tileState[1] == 2) {
        return false
      } else {
        //if the landing square is an occupied rosette, move is invalid
        if (tileState[0] == 2 && tileState[1] == 1) {
          return false
        }
      }
    }
    // if the move isn't invalid, return true
    return true;
  }

  confirmMove(startTile, endTile, team) {
    if (endTile == null) {
      return
    }
    const oldX = startTile[0]
    const oldY = startTile[1]
    const y = endTile[0]
    const x = endTile[1]
    var oldState = this.state
    var oldBoardState = oldState.board
    var oldTileState = oldBoardState[y][x]
    if (oldTileState[1] != team) {
      this.returnToken(oldTileState[1])
    }
    if (oldTileState[0] == 2) {
      this.anotherGo()
    }
    var newTileState = [oldTileState[0],team]
    oldBoardState[y][x] = newTileState
    var oldTileState = oldBoardState[oldY][oldX]
    oldTileState[1] = 0
    oldBoardState[oldY][oldX] = oldTileState
    var newRoll = diceRoll(4)

    if (y == 5) {
      if (x == 0) {
        this.scorePoint(1)
      } else if (x == 2) {
        this.scorePoint(2)
      }
    }

    if (oldState.curTeam == 1) {
      this.setState({board: oldBoardState, curTeam: 2, lastRoll: newRoll })
    } else {
      this.setState({board: oldBoardState, curTeam: 1, lastRoll: newRoll })
    }
  }

  scorePoint(team) {
    var oldState = this.state
    if (team == 1) {
      oldState.points.team1 += 1
      oldState.board[5][0] = 0
    } else {
      oldState.points.team2 += 1
      oldState.board[5][2] = 0
    }
    this.setState(oldState)
  }

  anotherGo() {
    if (this.state.curTeam == 1) {
      this.state.curTeam = 2
    } else {
      this.state.curTeam = 1
    }
  }

  returnToken(team) {
    if (team == 1) {
      var numTokens = this.state.tokens.team1 + 1
      var replaceState = this.state
      replaceState.tokens.team1 = replaceState
      this.setState(replaceState)
    } else {
      var numTokens = this.state.tokens.team2 + 1
      var replaceState = this.state
      replaceState.tokens.team2 = replaceState
      this.setState(replaceState)
    }
  }

  moveTile (ruleSet, y, x, n, team) {
    // StartTile is an array with [y,x] coordinates for tile
    var tileOrder = [[]]
    if (ruleSet == "official") {
      if (team == 1) {
        tileOrder = [[4,0],[3,0],[2,0],[1,0],[0,0],[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[7,0],[6,0],[5,0]]
      } else {
        tileOrder = [[4,2],[3,2],[2,2],[1,2],[0,2],[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[7,2],[6,2],[5,2]]
      }

      console.log("testTile is: " + y + ":" + x)
      var startPos = -1
      for (let i = 0; i < 16; i++) {
          if (tileOrder[i][0] == x && tileOrder[i][1] == y){
            startPos = i;
          }
      }
      if (startPos < 0) {
        return null
      } else if (startPos != 0) {
        //Check that it's valid to start a move There
        if (!(this.isStartPosValid(tileOrder[startPos]))) {
          return null
        }
      }
      var endPos = startPos + n
      var endTile = tileOrder[endPos]
      if (endPos >= 16 ) {
        return null
      } else {
        // Check that the move is valid
        if (this.isMoveValid(endTile, team)) {
            return endTile
        } else {
          return null
        }
      }
    }
  }

  isStartPosValid(startPos) {
    var y = startPos[0]
    var x = startPos[1]
    if (this.state.board[y][x][1] == this.state.curTeam) {
      console.log("startPos is Valid")
      return true
    } else {
      console.log("startPos is not Valid")
      return false
    }

  }

    displayBoard ({board}) {
    console.log(board);
    var turnText = ""
    if (this.state.curTeam == "1") {
      turnText += "It is the left player's turn"
    } else {
      turnText += "It is the right player's turn"
    }
    var turnText2 = " - You have rolled a " + this.state.lastRoll
    var scoreText1 = "Player 1: " + this.state.points.team1
    var scoreText2 = "Player 2: " + this.state.points.team2

    return (
      // Wrapping the grid with a div of inline-block means that the grid
      // takes up only the space defined by the size of the cells, while
      // still allowing us to use fractional values for the grid-template-*
      // properties
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col col-lg-2">
          <p>Turn information:</p>
          <p>{turnText}</p>
          <p>{turnText2}</p>
          </div>
          <div className="col-md-auto">
            <div style={{ display: 'inline-block'}}>
              <div
                style={{
                  // We set a background color to be revealed as the lines
                  // of the board with the `grid-gap` property
                  backgroundColor: '#000',
                  display: 'grid',
                  // Our rows are equal to the length of our grid
                  gridTemplateRows: 'repeat(8, 1fr)',
                  // Our columns are equal to the length of a row
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gridGap: 2,
                }}
              >
                {board.map((row, rowIdx) =>
                  row.map((cell, colIdx) => (
                    // We put the colIdx first because that is our X-axis value
                    // and the rowIdx second because that is our Y-axis value
                    // Getting in the habit makes using 2d grids much easier
                    <Cell key={`${colIdx}-${rowIdx}`} cell={cell} rowid={rowIdx} colid={colIdx} handleClick={this.handleClick}/>
                  ))
                )}
              </div>
            </div>

          </div>
        <div className="col col-lg-2">
        <p>Scores:</p>
        <p>{scoreText1}</p>
        <p>{scoreText2}</p>
        </div>
      </div>
    </div>
    )
  }
}

const cellStyleStandard = {
  backgroundColor: '#faf298',
  height: 60,
  width: 60,
}

const cellStyleSpecial = {
  backgroundColor: '#e6d07c',
  height: 60,
  width: 60,
}

const cellStyleNone = {
  backgroundColor: '#000',
  height: 60,
  width: 60,
}

const buttonStyleNone = {
  backgroundColor: 'rgba(255,255,255,0)',
  height: 60,
  width: 60,
  border: 'none',
  outline: 'none'
}

const buttonTeam1 = {
  background: 'lightblue',
  borderRadius: 30,
  width: 60,
  height: 60
}

const buttonTeam2 = {
  background: 'lightgreen',
  borderRadius: 30,
  width: 60,
  height: 60
}

function Cell({cell, rowid, colid, handleClick}) {
  var curStyle = {}
  if (cell[1] == 0) {
    curStyle = buttonStyleNone
  } else if (cell[1] == 1) {
    curStyle = buttonTeam1
  } else if (cell[1] == 2) {
    curStyle = buttonTeam2
  }
  if (cell[0] == 1 ) {
  return (
          <div style={cellStyleStandard}>
            <button type="button" style={curStyle} onClick={() => handleClick(colid,rowid)}>

            </button>
          </div>
   );
 } else if (cell[0] == 2){
   return (
          <div style={cellStyleSpecial}>
             <button type="button" style={curStyle} onClick={() => handleClick(colid,rowid)}>

             </button>
          </div>
   );
 } else if (cell[0] == 3) {
   return <div style={cellStyleNone}>
             <button type="button" style={curStyle} onClick={() => handleClick(colid,rowid)}>
             </button>
          </div>
 } else {
   return <div style={cellStyleNone}>
          </div>
 }
}

function StaticUrHeader () {
    console.log("rendering the header")
    return (
      <>
        <div className="py-5">
          <main className="container">
            <Link to="/" className="btn btn-link">
              Home
            </Link>
            <a
              className='btn btn-link'
              href="https://github.com/Sphinx111/RoyalUr"
              target='_blank'
              rel="noopener"
              aria-label='Github'
              >
              Source Code
            </a>
          </main>
        </div>
        <section className="jumbotron jumbotron-fluid text-center">
          <div className="container py-5">
            <h2 className="display-4">Royal Ur in React</h2>
            <p className="lead">
              Technology Used: React Native
            </p>
            <p className="lead text-muted">
              "Royal Ur" is one of the oldest games in existence. The rules for the game were deciphered from Cuneiform tablets.
              The interactive display below is a recreation in React made in 24 hours. (AI has yet to be implemented, so it's a 2-player hot-seat for now!)
            </p>
          </div>
        </section>
      </>
    );
  }


function diceRoll(num) {
    var total = 0;
    for (let i = 0; i < num; i++) {
      total += Math.floor((Math.random() * 2))
    }
    return total
  }

function StaticUrFooter () {
  return (
  <section>
    <div className="container py-5">
      <h3>How to play</h3>
        <p>
        Read the <a href="https://a4games.company/the-royal-game-of-ur-rules-route-and-layout/" >rules for Royal Ur</a> to understand the rules.
        </p>
        <p>
        To begin the game, click on the blue token (left player), or green token (right player). The turns will automatically move on, unless you land on a "rosette" square (the darker spaces).
        The winner is the first player to get 7 pieces to the finish line. If you roll a zero, you can only move play on using the "start" square.
        </p>
        <p>
        Features remaining to be added outside of the 24hr codejam window:
        </p>
        <ul>
          <li>Edge case handling, for when the player has no valid moves, or rolls a zero with pieces on board.</li>
          <li>Introduce AI</li>
          <li>Improved gamestate Handling, including reset button</li>
        </ul>
    </div>
  </section>
  );
}
