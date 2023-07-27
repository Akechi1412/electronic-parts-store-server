function getOffset(currentPage = 1, limit) {
  return (currentPage - 1) * [limit];
}

function emptyOrRows(results) {
  if (!results) {
    return [];
  }
  return results;
}

function createRandomString(length) {
  return Math.random()
    .toString(36)
    .substring(2, length - 2);
}

module.exports = {
  getOffset,
  emptyOrRows,
  createRandomString,
};
