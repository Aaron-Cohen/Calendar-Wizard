import {toastMessageDuration} from '../../src/content/constants';
import {toast} from '../../src/content/toast';

jest.useFakeTimers();

describe('Toast message', () => {
  test('Toast appears when toast function is called', () => {
    toast('');
    expect(document.getElementById('toast')).toBeDefined();
  });

  test('Toast has timeout set for correct duration', () => {
    jest.spyOn(global, 'setTimeout');
    toast('');
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(
        expect.any(Function),
        toastMessageDuration,
    );
  });

  test('Toast message lasts for entire timeout', () => {
    jest.spyOn(global, 'setTimeout');
    toast('');
    jest.advanceTimersByTime(toastMessageDuration - 1);
    expect(document.getElementById('toast')).toBeDefined();
  });

  test('Toast message disappears after timeout duration', () => {
    jest.spyOn(global, 'setTimeout');
    toast('');
    jest.advanceTimersByTime(toastMessageDuration);
    expect(document.getElementById('toast')).toBeNull();
  });
});
