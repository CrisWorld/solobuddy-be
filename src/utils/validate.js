const allowedOperators = [
  // Comparison
  '$eq',
  '$ne',
  '$gt',
  '$gte',
  '$lt',
  '$lte',
  '$in',
  '$nin',
  // Logical
  '$and',
  '$or',
  '$nor',
  '$not',
  // Element
  '$exists',
  '$type',
  // Evaluation
  '$regex',
  '$options',
  '$expr',
  // Array
  '$elemMatch',
  '$size',
  '$all',
];

function validateFilter(filter) {
  Object.keys(filter).forEach((key) => {
    const value = filter[key];

    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.keys(value).forEach((op) => {
        if (!allowedOperators.includes(op)) {
          throw new Error(`Operator "${op}" is not allowed in filter`);
        }
      });
    } else if (Array.isArray(value)) {
      // validate phần tử trong array
      value.forEach((v) => {
        if (typeof v !== 'string' && typeof v !== 'number') {
          throw new Error(`Invalid array value in field "${key}"`);
        }
      });
    }
  });
  return true;
}

module.exports = { validateFilter, allowedOperators };
