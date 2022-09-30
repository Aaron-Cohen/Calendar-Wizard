import {getEnrolledEvents, showConflicts} from '../../src/content';
import {when} from 'jest-when';
jest.mock('../../src/shared/browser', () => ( require('sinon-chrome/webextensions')));
jest.mock('../../src/content/toast', () => jest.fn());

describe('Table parsing', () => {
  test('Array of objects with event data created from homepage table', () => {
    jest.spyOn(document, 'querySelector').mockImplementation((selector) => {
      switch (selector) {
        case 'tbody':
          return createNewTable();
        default:
          throw Error('Unexpected querySelector choice.');
      }
    });

    const actual = getEnrolledEvents();
    const expected = [{
      url: 'http://url/',
      title: 'event',
      date: 'date',
      equipment: 'equipment',
    }];
    expect(actual).toEqual(expected);
  });

  test('Conflicts added to already existed event-messaging div', () => {
    const appendChild = jest.fn();
    const _appendChild = jest.fn();
    when(_appendChild)
        .calledWith('div.event-messages')
        .mockReturnValue({appendChild});
    jest.spyOn(document, 'querySelector')
        .mockImplementation(_appendChild);

    // @ts-ignore
    showConflicts([{items: []}]);

    expect(appendChild).toHaveBeenCalled();
  });

  test('Conflicts creates event-messaging div if missing', () => {
    const appendChild = jest.fn();
    const fn = jest.fn();
    when(fn).calledWith('div.event-messages').mockReturnValue(null);
    when(fn).calledWith('#content').mockReturnValue({appendChild});

    jest.spyOn(document, 'querySelector')
        .mockImplementation(fn);

    // @ts-ignore
    showConflicts([{items: []}]);

    expect(appendChild).toHaveBeenCalled();
  });
});

function createNewTable() {
  const table = document.createElement('tbody');
  const newRow = table.insertRow();
  const [name, date, equipment] = [newRow.insertCell(), newRow.insertCell(), newRow.insertCell()];
  const url = document.createElement('a');
  url.href = 'http://url/';
  name.textContent = 'event';
  date.textContent = 'date';
  equipment.textContent = 'equipment';
  name.appendChild(url);
  return table;
};
