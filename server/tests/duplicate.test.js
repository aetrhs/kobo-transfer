const { getMainTitle } = require('../controllers/bookController');

describe('Cleaning book titles', () => {
  test('Should check duplicates by removing extensions and parenthesis', () => {
    const input = "Harrow_The_Ninth (Tamsyn Muir).mobi";
    const expected = "harrow the ninth";
    expect(getMainTitle(input)).toBe(expected);
  });

  test('Should handle titles with multiple dots correctly', () => {
    const input = "House.Of.Leaves.epub";
    expect(getMainTitle(input)).toBe("house of leaves");
  });
});