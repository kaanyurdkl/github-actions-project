// This file will give us a reusable way of making
// any endpoint paginated

// In mongo is we pass 0 as the page limit, mongo will
// return all of the documents in the collection
const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_LIMIT = 0;

function getPagination(query) {
  // Value that comes back from the controller in our
  // req.query object is a string
  // abs() returns the absolute value of a number. If
  // you pass a string it will convert that string into a number as well
  const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER; // Default page number is 1
  // If the limit is not set, all of the documents will be returned on the first
  // page
  const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;
  const skip = (page - 1) * limit;
  return {
    skip,
    limit,
  };
}

module.exports = { getPagination };
