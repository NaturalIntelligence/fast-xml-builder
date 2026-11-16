import XMLBuilder from '../src/fxb.js';

describe('Date values in repeated nodes', function () {
    const first = new Date('2020-01-02T00:00:00Z');
    const second = new Date('2020-01-03T00:00:00Z');

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

describe('Date arrays with other builder options', function () {
    const date = new Date('2020-01-02T00:00:00Z');
    const isoDate = date.toISOString();
    const processValue = (name, value) => value instanceof Date ? value.toISOString() : value;

    it('preserves attributes on an object containing repeated Date values', function () {
        const builder = new XMLBuilder({
            ignoreAttributes: false,
            tagValueProcessor: processValue,
            attributeValueProcessor: (name, value) => 'attr-' + value,
        });
        expect(builder.build({ root: { '@_id': 'a&b', date: [date, date] } }))
            .toEqual('<root id="attr-a&amp;b"><date>' + isoDate + '</date><date>' + isoDate + '</date></root>');
    });

    it('keeps grouped attributes and object entries when combining Date values', function () {
        const builder = new XMLBuilder({
            ignoreAttributes: false,
            attributesGroupName: 'attrs',
            oneListGroup: true,
            tagValueProcessor: processValue,
        });
        expect(builder.build({ root: [date, { attrs: { id: 'a&b' }, child: 'value' }, date] }))
            .toEqual('<root id="a&amp;b">' + isoDate + '<child>value</child>' + isoDate + '</root>');
    });

    it('keeps raw stop-node strings and Date values without applying the value processor', function () {
        const processor = jasmine.createSpy('tagValueProcessor').and.returnValue('processed');
        const builder = new XMLBuilder({ stopNodes: ['root.item'], tagValueProcessor: processor });
        expect(builder.build({ root: { item: [date, '<b>raw & text</b>', date] } }))
            .toEqual('<root><item>' + date.toString() + '</item><item><b>raw & text</b></item><item>'
                + date.toString() + '</item></root>');
        expect(processor).not.toHaveBeenCalled();
    });

    it('preserves mixed primitive, object and null entry order', function () {
        const builder = new XMLBuilder({ ignoreAttributes: false, tagValueProcessor: processValue });
        expect(builder.build({ item: [date, null, undefined, 'a&b', 0, false, { '@_id': 'x', child: 'text' }, date] }))
            .toEqual('<item>' + isoDate + '</item><item/><item>a&amp;b</item><item>0</item><item>false</item>'
                + '<item id="x"><child>text</child></item><item>' + isoDate + '</item>');
    });

    it('uses the existing empty-node handling when a Date processor returns empty text', function () {
        const builder = new XMLBuilder({ suppressEmptyNode: true, tagValueProcessor: () => '' });
        expect(builder.build({ date: [date] })).toEqual('<date/>');
    });
});
