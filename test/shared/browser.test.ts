import browser from '../../src/shared/browser';
jest.mock('../../src/shared/browser', () => ( require('sinon-chrome/webextensions')));

describe('Browser Instance', () => {
  test('browser exists is mocked with sinon-chrome/webextensions', async () => {
    expect(browser).toBe(require('sinon-chrome/webextensions'));
  });
});
