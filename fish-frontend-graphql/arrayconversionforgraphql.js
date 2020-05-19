const convertArray = (arr) => {
  let arrString = "";
  arr.forEach((elem) => {
    arrString += `\"${elem}\", `;
  });
  return arrString.slice(0, -2);
};

console.log(`array: [${convertArray(["a", "b"])}]`);
