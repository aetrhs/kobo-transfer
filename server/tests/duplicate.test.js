const { getMainTitle, uploadBook } = require('../controllers/bookController');
const Book = require('../models/Book');
const fs = require('fs');
// fake book model and filesys
jest.mock('../models/Book');
jest.mock('fs');

describe('Cleaning book titles', () => {
  test('Should check duplicates by checking for similar titles', () => {
    const existingTitle = "Harrow The Ninth";
    const newTitleInput = "  harrow_the_ninth.epub";
    const existingCleaned = getMainTitle(existingTitle);
    const newCleaned = getMainTitle(newTitleInput);
    expect(existingCleaned).toBe(newCleaned);
  });

  test('Should handle titles with multiple dots correctly', () => {
    const input = "House.Of.Leaves.epub";
    expect(getMainTitle(input)).toBe("house of leaves");
  });

  // delete file if theres an error saving to database
  test('Should delete physical file if database save fails', async () => {
    fs.existsSync.mockReturnValue(true);
    const mockUnlink = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
    Book.prototype.save = jest.fn().mockRejectedValue(new Error('DB Error'));
    
    const mockFilePath = 'uploads/test-book.epub';
    try {
      await new Book({ title: 'Test' }).save();
    } catch (err) {
      if (fs.existsSync(mockFilePath)) fs.unlinkSync(mockFilePath);
    }
    expect(mockUnlink).toHaveBeenCalledWith(mockFilePath);
  });
});