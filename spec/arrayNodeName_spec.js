import XMLBuilder from '../src/fxb.js';

describe('Top-level array node names', function () {
    // 2026-10-11: A valid one-character name must wrap each array item.
    it('uses a single-character arrayNodeName', function () {
        const builder = new XMLBuilder({ arrayNodeName: 'x' });
        expect(builder.build(['a', 'b'])).toEqual('<x>a</x><x>b</x>');
        expect(builder.build([{ value: 1 }])).toEqual('<x><value>1</value></x>');
    });

    it('keeps longer names and unnamed arrays unchanged', function () {
        expect(new XMLBuilder({ arrayNodeName: 'item' }).build(['a']))
            .toEqual('<item>a</item>');
        expect(new XMLBuilder({ arrayNodeName: '' }).build(['a']))
            .toEqual('<0>a</0>');
    });
});
