const expect = require('expect');
const ratio = require('../lib/ratio.js');

describe('Ratio.js', () => {

    context('one empty, one auto value', () => {
        it('should only provide the width', () => {
            expect(ratio({ width: 'auto' }, { width: '100', height: '100' }))
                .toEqual({ width: '100', height: null });
        });

        it('should only provide the height', () => {
            expect(ratio({ height: 'auto' }, { width: '500', height: '500' }))
                .toEqual({ width: null, height: '500' });
        });
    });

    context('one pixel, one auto value', () => {
        it('should convert width auto via ratio aspect when height defined', () => {
            expect(ratio({ width: 'auto', height: '50' }, { width: '100', height: '100' }))
                .toEqual({ width: '50', height: '50' });
        });

        it('should convert height auto via ratio aspect when width defined', () => {
            expect(ratio({ width: '100', height: 'auto' }, { width: '500', height: '500' }))
                .toEqual({ width: '100', height: '100' });
        });
    });

    context('one pixel, one percent value', () => {
        it('should pass through both values', () => {
            expect(ratio({ width: '50', height: '50%' }, { width: '100', height: '100' }))
                .toEqual({ width: '50', height: '50%' });
        });
    });

    context('one auto, one percent value', () => {
        it('should copy the width when a precent height is defined', () => {
            expect(ratio({ width: 'auto', height: '50%' }, { width: '500', height: '500' }))
                .toEqual({ width: '50%', height: '50%' });
        });

        it('should copy the height when a precent width is defined', () => {
            expect(ratio({ width: '80%', height: 'auto' }, { width: '500', height: '500' }))
                .toEqual({ width: '80%', height: '80%' });
        });
    });

    context('two auto values', () => {
        it('should convert autos to pixels', () => {
            expect(ratio({ width: 'auto', height: 'auto' }, { width: '100', height: '100' }))
                .toEqual({ width: '100', height: '100' });

            expect(ratio({ width: 'auto', height: 'auto' }, { width: '1024', height: '1024' }))
                .toEqual({ width: '1024', height: '1024' });
        });
    });

    context('two pixel values', () => {
        it('should pass through pixel values', () => {
            expect(ratio({ width: '90', height: '110' }, { width: '100', height: '100' }))
                .toEqual({ width: '90', height: '110' });

            expect(ratio({ width: '1024', height: '1024' }, { width: '1024', height: '1024' }))
                .toEqual({ width: '1024', height: '1024' });
        });
    });

    context('two percent values', () => {
        it('should pass through two percent values', () => {
            expect(ratio({ width: '50%', height: '50%' }, { width: '500', height: '500' }))
                .toEqual({ width: '50%', height: '50%' });

            expect(ratio({ width: '50%', height: '100%' }, { width: '500', height: '500' }))
                .toEqual({ width: '50%', height: '100%' });
        });
    });

    context('two empty values', () => {
        it('should pass through nothing', () => {
            expect(ratio({ width: null, height: null }, { width: '500', height: '500' }))
                .toEqual({ width: null, height: null });
        });
    });
});
