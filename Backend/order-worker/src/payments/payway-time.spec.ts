import { formatPayWayRequestTime } from './payway-time';

describe('formatPayWayRequestTime', () => {
  it('formats PayWay request time in UTC', () => {
    const instant = new Date('2026-07-18T07:49:25.000Z');

    expect(formatPayWayRequestTime(instant)).toBe('20260718074925');
  });

  it('does not depend on the host timezone', () => {
    const instant = new Date('2026-07-18T18:30:00.000Z');

    expect(formatPayWayRequestTime(instant)).toBe('20260718183000');
  });
});
