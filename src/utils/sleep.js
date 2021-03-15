function sleep(sec) {
  console.log("Waiting...");
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

export default sleep;
