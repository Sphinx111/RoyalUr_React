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
      lastRoll: this.diceRoll(4),
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

  }

  componentWillUnmount() {

  }

  render() {
    if (this.state.board != null) {
      return (
        <div>
        <StaticUrHeader />
        {this.displayBoard(this.state, this.handleClick)}
        {this.displayValidMoves(this.state)}
        <StaticUrFooter />
        </div>
      );
    }

  }

  // This is the function that updates the game state based on user's input
  handleClick =  (x, y) => {
    var nextTile = this.moveTile("official", x, y,this.state.lastRoll,this.state.curTeam)
    this.movePiece([x,y],nextTile)
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
        [[0,0],[1,0],[0,0]],
        [[0,0],[1,0],[0,0]],
        [[2,21],[1,21],[2,21]],
        [[1,21],[1,21],[1,21]]
        ]
      );
    }
  }

  startNewTurn () {
    const nextPlayer = (this.state.curTeam == 1) ? 2 : 1;
    const nextRoll = this.diceRoll(4)

    this.setState({curTeam: nextPlayer, lastRoll: nextRoll})
  }

  playerRolledZero() {
    this.startNewTurn()
  }

  // this function checks all of the player's pieces to count how many can move
  countValidMoves() {


  }

  // fnc checks if the moves are valid
  isMoveValid (startTile, endTile, team){
    if (endTile == null) {
      return false
    }
    const sy = startTile[0]
    const sx = startTile[1]
    const ey = endTile[0]
    const ex = endTile[1]
    const startTileState = this.state.board[sy][sx]
    const endTileState = this.state.board[ey][ex]

    // if the end tile already has your piece on it, return false
    if (endTileState[1] == startTileState[1]) {
      return false
    } else {
      // if the endTile is a "rosette", and not empty, return false
      if (endTileState[0] == 2 && endTileState[1] != 0) {
        return false
      }
    }

    // if the player doesn't have a piece where they're clicking, return false
    if (startTileState[2] != team) {
      return false
    }

    // if none of the special states so far apply, return true, can move there
    return true
  }

  movePiece(startTile, endTile) {
    if (this.isMoveValid(startTile,endTile)) {
      const sy = startTile[0]
      const sx = startTile[1]
      const ey = endTile[0]
      const ex = endTile[1]

      if (sx == ex && sy == ey) {
        this.startNewTurn()
        return
      }

      var boardState = this.state.board
      var startTileState = boardState[sy][sx]
      var endTileState = boardState[ey][ex]
      // if the end tile is occupied by an enemy piece, return it to the owner
      if (endTileState[1] != startTileState[1]) {
        this.returnToken(endTileState[1])
      }

      // if endTile is the last square, increment score
      var pointsState = {}
      if (ey == 5) {
        if (ex == 0) {
          endTileState[1] = 0
          pointsState = this.scorePoint(1)
        } else if (ex == 2) {
          endTileState[1] = 0
          pointsState = this.scorePoint(2)
        }
      } else {
        pointsState = this.state.points
      }

      // Update the state of the start and end tiles to show new values
      endTileState[1] = startTileState[1]
      startTileState[1] = 0
      boardState[sy][sx] = startTileState
      boardState[ey][ex] = endTileState

      boardState = this.setupStartTokens(boardState)

      //update the board's state, forcing re-render of new positions and points
      this.setState({board: boardState, points: pointsState})

      // if the end Tile is a "rosette", player gets another go
      if (endTileState[0] == 2) {
        this.anotherGo()
      } else {
        this.startNewTurn()
      }
    }
  }

  // Returns the new state for score values as {points: {team1: n, team2: n}}
  scorePoint(team) {
    var state = this.state
    if (team == 1) {
      state.points.team1 += 1
    } else {
      state.points.team2 += 1
    }
    return state.points
  }

  anotherGo() {
    const player = (this.state.curTeam == 1) ? 2 : 1
    this.setState({lastRoll: this.diceRoll(4)})
  }

  // This function returns a new board state after adding any starter tokens
  setupStartTokens (inputBoard) {
    var boardState = inputBoard
    var team1 = this.state.tokens.team1
    var team2 = this.state.tokens.team2
    console.log("tokens IN is: " + team2)

    // if team 1 has tokens available, check their start squares
    if (team1 > 0) {
      var startTile = boardState[4][0]
      if (startTile[1] != 1) {
        // if start square empty, place a token ready to go, reduce total avail
        startTile[1] = 1
        this.state.tokens.team1 -= 1
      }
      boardState[4][0] = startTile
    }

    if (team2 > 0) {
      var startTile = boardState[4][2]
      if (startTile[1] != 2) {
        // same as above, but for team 2
        startTile[1] = 2
        this.state.tokens.team2 -= 1
        console.log("Tokens OUT is: " + this.state.tokens.team2)
      }
      boardState[4][2] = startTile
    }
    return boardState
  }

  returnToken(team) {
    if (team == 1) {
      this.state.tokens.team1 += 1
    } else if (team == 2){
      this.state.tokens.team2 += 1
    }
  }

  diceRoll(num) {
      var total = 0;
      for (let i = 0; i < num; i++) {
        total += Math.floor((Math.random() * 2))
      }
      if (total == 0) {
        this.playerRolledZero()
        return null
      }
      return total
    }

  displayValidMoves() {
    return
  }
  // takes input tile (coords), and returns the tile coordinates n moves forwards
  // returns null if no tile at endPos
  moveTile (ruleSet, x, y, n, team) {
    // StartTile is an array with [y,x] coordinates for tile
    var tileOrder = [[]]
    if (ruleSet == "official") {
      if (team == 1) {
        tileOrder = [[4,0],[3,0],[2,0],[1,0],[0,0],[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[7,0],[6,0],[5,0]]
      } else {
        tileOrder = [[4,2],[3,2],[2,2],[1,2],[0,2],[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[7,2],[6,2],[5,2]]
      }

      var startPos = -1
      for (let i = 0; i < 16; i++) {
          if (tileOrder[i][0] == x && tileOrder[i][1] == y){
            startPos = i;
          }
      }
      if (startPos < 0) {
        console.log("invalid start coordinates were passed to MoveTile")
        return null
      }

      var endPos = startPos + n
      if (endPos >= 16 ) {
        // end position is off of the board
        return null
      }
      var endTile = tileOrder[endPos]
      return endTile
    }
    console.log("chosen ruleset not implemented yet")
    return null
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
    var tokensText1 = "Player1: " + this.state.tokens.team1
    var tokensText2 = "Player2: " + this.state.tokens.team2

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
        <p>Tokens:</p>
        <p>{tokensText1}</p>
        <p>{tokensText2}</p>
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
            <TokenButton team={cell[1]} handleClick={handleClick} x={rowid} y={colid} />
          </div>
   );
 } else if (cell[0] == 2){
   return (
          <div style={cellStyleSpecial}>
             <TokenButton team={cell[1]} handleClick={handleClick} x={rowid} y={colid}/>
          </div>
   );
 } else if (cell[0] == 3) {
   return <div style={cellStyleNone}>
            <TokenButton team={cell[1]} handleClick={handleClick} x={rowid} y={colid}/>
          </div>
 } else {
   return <div style={cellStyleNone}>
          </div>
 }
}

function TokenButton ({team, handleClick, x, y}) {
  var curStyle = {}
  switch (team) {
    case 0:
      // if the square doesn't have a token on it, don't draw a button
      return null
    break
    case 1:
      curStyle = buttonTeam1
    break
    case 2:
      curStyle = buttonTeam2
    break
  }

  return (
    <button type="button" style={curStyle} onClick={() => handleClick(x,y)}>
    </button>
  )
}

function StaticUrHeader () {
    return (
      <>
        <div className="py-5">
          <main className="container">
            <Link to="/" className="btn btn-link">
              Home
            </Link>
            <a
              className='btn btn-link'
              href="https://github.com/Sphinx111/RoyalUr_React"
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

function StaticUrFooter () {
  return (
  <section>
    <div className="container py-5">
      <h3>How to play</h3>
        <p>
        Read the <a href="https://a4games.company/the-royal-game-of-ur-rules-route-and-layout/" >rules for Royal Ur</a> to understand the rules.
        </p>
        <p>
        To begin the game, click on the blue token (left player). The turns will automatically move on, unless you land on a "rosette" square (the darker spaces).
        The winner is the first player to get 7 pieces to the finish line. You can place a new token on the board by selecting the black start square.
        </p>
        <p>
        Features remaining to be added outside of the 24hr codejam window:
        </p>
        <ul>
          <li>Edge case handling, for when the player has no valid moves (currently, this requires a reset/refresh)</li>
          <li>Introduce AI</li>
          <li>Improved gamestate Handling, including reset button</li>
          <li>Visual Dice Rolls</li>
        </ul>
    </div>
  </section>
  );
}
