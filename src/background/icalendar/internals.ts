export function vEvent(
    date : Date,
) : string {
  const tokens = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    'T',
    date.getHours(),
    date.getMinutes(),
    0,
  ];

  const isIntegral = (value : string | number) => /^\d+$/.test(value as string);

  return tokens
      .map((value) => isIntegral(value) && value < 10 ?
        '0'.concat(value as string) :
        value.toString())
      .join('');
}
