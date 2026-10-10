import XMLBuilder from '../src/fxb.js';

describe('Date values in repeated nodes', function () {
    const first = new Date('2020-01-02T00:00:00Z');
    const second = new Date('2020-01-03T00:00:00Z');

    // 2026-10-11: Array dates must retain the same text as scalar dates.
    it('serializes Date array items as text values', function () {
        const builder = new XMLBuilder();
        const expected = builder.build({ date: first }) + builder.build({ date: second });
        expect(builder.build({ date: [first, second] })).toEqual(expected);
    });

    it('passes Date array items through tagValueProcessor', function () {
        const builder = new XMLBuilder({ tagValueProcessor: (name, value) =>
            value instanceof Date ? value.toISOString() : value });
        expect(builder.build({ date: [first] }))
            .toEqual('<date>2020-01-02T00:00:00.000Z</date>');
    });

    it('retains Date text when oneListGroup combines values', function () {
        const builder = new XMLBuilder({ oneListGroup: true });
        expect(builder.build({ date: [first, second] }))
            .toEqual('<date>' + first.toString() + second.toString() + '</date>');
    });
});
