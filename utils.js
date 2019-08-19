module.exports = {
  randomString: function () {
    return Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);
  }
}