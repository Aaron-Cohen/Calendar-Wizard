import {monthMapping, yearOffset} from '../constants';
import {Duration} from '../../shared/models';

/*
 * Various functions to return date pairs based off of
 * a valid RegEx match
 */

export function singleDayEventDate(
    date : string,
    regex : RegExp,
) : Duration {
  const captureGroups = regex.exec(date)?.slice(1)!;
  const [
    _month,
    day,
    startHour,
    startMinutes,
    finishHour,
    finishMinutes,
  ] = captureGroups
      .filter(isIntegral)
      .map((num) => parseInt(num));
  const [
    start,
    finish,
  ] = captureGroups.filter(isNotIntegral);

  const year = new Date().getFullYear();
  const month = _month! - 1;
  const startOffset = (start === 'pm' && startHour !== 12) ? 12 : 0;
  const finishOffset = (finish === 'pm' && finishHour !== 12) ? 12 : 0;

  return {
    start: new Date(year!, month, day, startHour! + startOffset, startMinutes),
    end: new Date(year!, month, day, finishHour! + finishOffset, finishMinutes),
  };
}

export function singleDayEventPageDate(
    date : string,
    regex : RegExp,
) : Duration {
  const captureGroups = regex.exec(date)?.slice(1)!;
  const [
    day,
    year,
    startHour,
    startMinutes,
    finishHour,
    finishMinutes,
  ] = captureGroups
      .filter(isIntegral)
      .map((num) => parseInt(num));
  const [
    _month,
    start,
    finish,
  ] = captureGroups.filter(isNotIntegral);

  const month = monthMapping.get(_month)!;
  const startOffset = (start === 'pm' && startHour !== 12) ? 12 : 0;
  const finishOffset = (finish === 'pm' && finishHour !== 12) ? 12 : 0;

  return {
    start: new Date(year!, month, day, startHour! + startOffset, startMinutes),
    end: new Date(year!, month, day, finishHour! + finishOffset, finishMinutes),
  };
}

export function multiDayEventDate(
    date : string,
    regex : RegExp,
) : Duration {
  const captureGroups = regex.exec(date)!.slice(1);
  const [
    _startMonth,
    startDay,
    startHour,
    startMinutes,
    _finishMonth,
    finishDay,
    finishHour,
    finishMinutes,
  ] = captureGroups
      .filter(isIntegral)
      .map((num) => parseInt(num));
  const [
    start,
    finish,
  ] = captureGroups.filter(isNotIntegral);

  const year = new Date().getFullYear();
  const startMonth = _startMonth! - 1;
  const finishMonth = _finishMonth !- 1;

  const startOffset = (start === 'pm' && startHour !== 12) ? 12 : 0;
  const finishOffset = (finish === 'pm' && finishHour !== 12) ? 12 : 0;

  return {
    start: new Date(year!, startMonth, startDay, startHour! + startOffset, startMinutes),
    end: new Date(year!, finishMonth, finishDay, finishHour! + finishOffset, finishMinutes),
  };
}

export function multiDayEventPageDate(
    date : string,
    regex : RegExp,
) : Duration {
  const captureGroups = regex.exec(date)!.slice(1);
  const [
    startDay,
    startYear,
    startHour,
    startMinutes,
    finishDay,
    finishYear,
    finishHour,
    finishMinutes,
  ] = captureGroups
      .filter(isIntegral)
      .map((num) => parseInt(num));
  const [
    _startMonth,
    start,
    _finishMonth,
    finish,
  ] = captureGroups.filter(isNotIntegral);

  const startMonth = monthMapping.get(_startMonth)!;
  const finishMonth = monthMapping.get(_finishMonth)!;


  const startOffset = (start === 'pm' && startHour !== 12) ? 12 : 0;
  const finishOffset = (finish === 'pm' && finishHour !== 12) ? 12 : 0;

  return {
    start: new Date(startYear!, startMonth, startDay, startHour! + startOffset, startMinutes),
    end: new Date(finishYear!, finishMonth, finishDay, finishHour! + finishOffset, finishMinutes),
  };
}

export function multiYearEventDate(
    date : string,
    regex : RegExp,
) : Duration {
  const captureGroups = regex.exec(date)!.slice(1);
  const [
    _startMonth,
    startDay,
    startYear,
    startHour,
    startMinutes,
    _finishMonth,
    finishDay,
    finishYear,
    finishHour,
    finishMinutes,
  ] = captureGroups
      .filter(isIntegral)
      .map((num) => parseInt(num));
  const [
    start,
    finish,
  ] = captureGroups.filter(isNotIntegral);

  const startMonth = _startMonth! - 1;
  const finishMonth = _finishMonth !- 1;

  const startOffset = (start === 'pm' && startHour !== 12) ? 12 : 0;
  const finishOffset = (finish === 'pm' && finishHour !== 12) ? 12 : 0;

  return {
    start: new Date(startYear! + yearOffset, startMonth, startDay, startHour! + startOffset, startMinutes),
    end: new Date(finishYear! + yearOffset, finishMonth, finishDay, finishHour! + finishOffset, finishMinutes),
  };
}

export function nextYearEventDate(
    date : string,
    regex : RegExp,
) : Duration {
  const captureGroups = regex.exec(date)!.slice(1);
  const [
    _month,
    startDay,
    year,
    startHour,
    startMinutes,
    finishHour,
    finishMinutes,
  ] = captureGroups
      .filter(isIntegral)
      .map((num) => parseInt(num));
  const [
    start,
    finish,
  ] = captureGroups.filter(isNotIntegral);

  const month = _month! - 1;

  const startOffset = (start === 'pm' && startHour !== 12) ? 12 : 0;
  const finishOffset = (finish === 'pm' && finishHour !== 12) ? 12 : 0;

  return {
    start: new Date(year! + yearOffset, month, startDay, startHour! + startOffset, startMinutes),
    end: new Date(year! + yearOffset, month, startDay, finishHour! + finishOffset, finishMinutes),
  };
}

export function isIntegral(
    value : string | number,
) : boolean {
  return /^\d+$/.test(value as string);
};

export function isNotIntegral(
    value : string | number,
) : boolean {
  return !isIntegral(value);
};
