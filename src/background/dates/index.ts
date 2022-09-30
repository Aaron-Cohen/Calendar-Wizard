import {Duration} from '../../shared/models';
import * as parsers from './internals';

// Beautiful RegEx hell
export function tokenizeDates(
    date : string,
) : Duration {
  const regexes = [
    {
      description: 'Single day current year',
      example: 'Mon 1/13 5:30 pm - 8:30 pm',
      regex: () => /^[a-zA-Z]{3} (\d\d?)\/(\d\d?) (\d\d?):(\d\d?) ([a|p]m) - (\d\d?):(\d\d?) ([a|p]m)$/,
      execute: parsers.singleDayEventDate,
    },
    {
      description: 'Multiple days current year',
      example: 'Sat 9/24 9:30 pm - Sun 9/25 12:30 am',
      regex: () => /^[a-zA-Z]{3} (\d\d?)\/(\d\d?) (\d\d?):(\d\d?) ([a|p]m) - [a-zA-Z]{3} (\d\d?)\/(\d\d?) (\d\d?):(\d\d?) ([a|p]m)$/,
      execute: parsers.multiDayEventDate,
    },
    {
      description: 'A single day in non current year',
      example: 'Fri 1/13/23 9:00 am - 10:00 am',
      regex: () => /^[a-zA-Z]{3} (\d\d?)\/(\d\d?)\/(\d\d?) (\d\d?):(\d\d?) ([a|p]m) - (\d\d?):(\d\d?) ([a|p]m)$/,
      execute: parsers.nextYearEventDate,
    },
    {
      description: 'Across a Year or Multiple Days Next Year',
      example: 'Fri 12/30/22 9:00 am - Fri 1/13/23 9:00 am',
      regex: () => /^[a-zA-Z]{3} (\d\d?)\/(\d\d?)\/(\d\d?) (\d\d?):(\d\d?) ([a|p]m) - [a-zA-Z]{3} (\d\d?)\/(\d\d?)\/(\d\d?) (\d\d?):(\d\d?) ([a|p]m)$/,
      execute: parsers.multiYearEventDate,
    },
    {
      description: 'Single day event page',
      example: 'Friday, Jan 13, 2023 (9:00 am - 10:00 am)',
      regex: () => /^[a-zA-z]*, ([A-z][a-z]{2}) (\d\d?), (\d{4}) \((\d\d?):(\d\d?) ([a|p]m) - (\d\d?):(\d\d?) ([a|p]m)\)$/,
      execute: parsers.singleDayEventPageDate,
    },
    {
      description: 'Multi day event page',
      example: 'Wednesday, Jan 4, 2023 - 9:00 am through Friday, Jan 13, 2023 - 9:00 am',
      regex: () => /^[a-zA-z]*, ([A-z][a-z]{2}) (\d\d?), (\d{4}) - (\d\d?):(\d\d?) ([a|p]m) through [a-zA-z]*, ([A-z][a-z]{2}) (\d\d?), (\d{4}) - (\d\d?):(\d\d?) ([a|p]m)$/,
      execute: parsers.multiDayEventPageDate,
    },
    {
      description: 'Error',
      regex: () => /^.*$/,
      execute: (date: any) => {
        throw new Error(`No matching RegEx for ${date}}`);
      },
    },
  ];

  const match = regexes.find((format) => format.regex().test(date))!;
  return match.execute(date, match.regex());
}
