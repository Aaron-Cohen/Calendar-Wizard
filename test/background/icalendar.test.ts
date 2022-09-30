import {createIcsCalendar} from '../../src/background/icalendar';
import {vEvent} from '../../src/background/icalendar/vevent';

jest.mock('../../src/shared/browser', () => require('sinon-chrome/webextensions'));

describe('iCalendar file generation', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date());
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('VEVENT string created correctly', ()=>{
    const actual = vEvent(new Date(2000, 0, 13));
    const expected = ['2000', '01', '13', 'T000000'].join('');
    expect(actual).toEqual(expected);
  });

  test('.ics file is valid', () => {
    jest.spyOn(require('../../src/background/icalendar/vevent'), 'vEvent')
        .mockImplementation((date : Date) => date.toString());
    const events = [
      {
        title: 't1',
        url: 'url1',
        date: {
          start: new Date(2022, 0, 13),
          end: new Date(2022, 0, 14),
        },
        equipment: 'e1',
      },
      {
        title: 't2',
        url: 'url2',
        date: {
          start: new Date(2022, 1, 13),
          end: new Date(2022, 1, 14),
        },
        equipment: 'e2',
      },
      {
        title: 't3',
        url: 'url3',
        date: {
          start: new Date(2022, 2, 13),
          end: new Date(2022, 2, 14),
        },
        equipment: 'e3',
      },
    ];
    const id = 123;
    const tab : browser.tabs.Tab = {
      id,
      index: 0,
      highlighted: false,
      active: false,
      pinned: false,
      incognito: false,
    };
    const today = new Date();
    const sendMessage = jest.spyOn(require('sinon-chrome/webextensions').tabs, 'sendMessage');
    const expectedOutput =
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//COHEN//NONSGML Calendar Wizard//EN',
      ...events.map((event) => [
        'BEGIN:VEVENT',
        `UID:${event.url}`,
        `DTSTAMP:${today}`,
        `DTSTART:${event.date.start}`,
        `DTEND:${event.date.end}`,
        `SUMMARY:${event.title}`,
        `LOCATION:${event.equipment}`,
        `DESCRIPTION:${event.url}`,
        'END:VEVENT',
      ]).flatMap((element) => element),
      'END:VCALENDAR',
    ].join(`\r\n`);

    createIcsCalendar(events, tab);
    expect(sendMessage).toHaveBeenCalledOnce();
    expect(sendMessage).toHaveBeenLastCalledWith(id, {
      flavor: 'fileDownload',
      args: [expectedOutput],
    });
  });
});
