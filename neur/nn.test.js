const test = require("node:test");
const assert = require("node:assert");

const nnTools = require("./nn");

test("folds", (t) => {
  const tools = nnTools({ inputSize: 3 });

  assert.deepEqual(
    [[1, 2, 3], [4, 5, 6], [7, 8, 9], [0]],
    tools.foldNN([1, 2, 3, 4, 5, 6, 7, 8, 9, 0])
  );
});

test("flattens", (t) => {
  const tools = nnTools({ inputSize: 3 });

  assert.deepEqual(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],

    tools.flatteNN([[1, 2, 3], [4, 5, 6], [7, 8, 9], [0]])
  );
});

test("alltogethernow", (t) => {
  const tools = nnTools({ inputSize: 3 });
  const net = tools.randomNN(15);

  assert.deepEqual(net, tools.foldNN(tools.flatteNN(net)));
});
