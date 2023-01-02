const mancala = require("./mancala");
const player = (name) => {
  return {
    think: (state) => Math.floor(Math.random() * 6),
    punish: () => console.log('--bad move'),
    name,
  };
};

mancala.run(player, player);
