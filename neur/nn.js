const arr = (length) => Array(length).fill();

module.exports = function nnTools({ inputSize }) {
  // why should I hardcode any layers, let the net figure out its own architecture
  // so each neuron is using whatever N inputs or intermediate neurons defined before it, therefore the net is simply an array of any length of arrays of N weights
  // N has to be equal to input size so that it all makes sense :D
  const randomNN = (neuronCount) =>
    arr(neuronCount).map(() => arr(inputSize).map(() => Math.random()));

  const think = (input, nn) => {
    // for a good measure
    input = input.flat();
    // I don't really need all the intermediate values as I go on and the order of stuff doesn't need to be chronological in any way, so I can go and overwrite the oldest value, whatever that means about the input.
    // yes, it makes one end of the input much less likely to affect stuff, but looks like the weights are gonna need to make up for it.

    const thinkingSpace = [...input];
    //nn can be of any length, so gotta hold on to the last item
    let last;
    nn.forEach((weights, index) => {
      last = weights.reduce((acc, w, i) => acc + w * thinkingSpace[i], 0);
      thinkingSpace[index % thinkingSpace.length] = last;
    });

    return Math.floor(last);
  };

  const flatteNN = (nn) => nn.flat();
  const foldNN = (flat) => {
    const nn = [];
    let start = 0;
    while (start < flat.length) {
      nn.push(flat.slice(start, start + inputSize));
      start += inputSize;
    }
    return nn
  };
  return {
    randomNN,
    flatteNN,
    foldNN,
    think,
  };
};
