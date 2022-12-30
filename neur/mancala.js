const stateSample = [
  // board
  [4, 4, 4, 5, 5, 5], // their
  [4, 4, 4, 4, 0, 5], // mine
  [0, 0], // scores their,mine
  [-1, -1, -1, 5], // prev 4 moves, -1 denotes undefined
  1,
];

const getInitialState = () => [
  [4, 4, 4, 4, 4, 4], // their
  [4, 4, 4, 4, 4, 4], // mine
  [0, 0], // scores their,mine
  [-1, -1, -1, -1], // position on my board side
  0,
];

const NEXT = ([row, col]) => {
  const direction = row ? 1 : -1;
  col += direction;
  if (col > 5) {
    row = 0;
    col = 5;
  }
  if (col < 0) {
    row = 1;
    col = 0;
  }
  return [row, col];
};

//tools
const sumr = (acc, i) => acc + i;

const game = (state, players) => {
  const rotateBoard = () => {
    const t = state[0];
    state[0] = state[1].reverse();
    state[1] = t.reverse();
    state[2] = state[2].reverse();
    players.reverse();
  };

  const rememberMove = (field) => {
    console.log({ state });
    state[3].shift();
    state[3].push(field);
  };
  const checkScores = () => {
    if ([state[0], state[1], state[2]].flat().reduce(sumr) !== 2 * 24) {
      throw Error("Conservation of sumtotal failure");
    }
    if (state[2][1] > 24 || state[0].reduce(sumr) === 0) {
      throw Error("I win");
    }
  };

  function distribute(pointer, stash = 0) {
    console.error({ pointer, stash });
    if (stash === 0) {
      return pointer;
    }
    state[pointer[0]][pointer[1]] += 1;
    return distribute(NEXT(pointer), stash - 1);
  }

  function score(pointer) {
    if (pointer[0] === 1 || pointer[1] > 5) return;
    const grab = state[pointer[0]][pointer[1]];
    if (grab === 3 || grab === 2) {
      state[pointer[0]][pointer[1]] = 0;
      state[2][1] += grab;
      score([0, pointer[1] + 1]);
    }
  }

  const move = (field) => {
    rememberMove(field);
    const stash = state[1][field];
    console.log({ field, stash });
    state[1][field] = 0;
    const end = distribute(NEXT([1, field]), stash);
    score(end);
    checkScores();
  };

  const turn = () => {
    rotateBoard();
    const field = players[1].think(state);
    move(field);
    state[4] += 1;
  };

  const print = () => {
    console.log(`________________________________________ ${state[4]}
 ${players[0].name}${state[2][0]}\t${state[0].join("\t")}
 ${players[1].name}${state[2][1]}\t${state[1].join("\t")}
  `);
  };

  return {
    turn,
    print,
  };
};

const player = (name) => {
  return {
    think: (state) => Math.floor(Math.random() * 6),
    name,
  };
};

function run() {
  const state = getInitialState();
  const game1 = game(state, [player("A"), player("B")]);

  // setInterval(() => {
  //   draw(state);
  //   game1.turn();
  // }, 5000);
  try {
    while (true) {
      game1.turn();
      game1.print();
    }
  } catch (e) {
    console.log("WIN");
    game1.print();
  }
}
run();
