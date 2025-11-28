const { getSectionContinuedTitle } = require('../../../src/pdf/renderStorageNote');

describe('section-title-utils', () => {
    describe('getSectionContinuedTitle', () => {
        describe('section number formatting', () => {
            test('should correctly format single digit section numbers', () => {
                const result = getSectionContinuedTitle('3', 'arrival');
                expect(result).toMatch(/^3\.\s{4}/);
            });

            test('should handle section number as string', () => {
                const result = getSectionContinuedTitle('5', 'departure');
                expect(result).toContain('5.');
            });
        });

        describe('consistency', () => {
            test('should include "continued" suffix in all titles', () => {
                expect(getSectionContinuedTitle('3', 'arrival')).toContain('continued');
                expect(getSectionContinuedTitle('5', 'departure')).toContain('continued');
            });

            test('should include "Consignment details" in all titles', () => {
                expect(getSectionContinuedTitle('3', 'arrival')).toContain('Consignment details');
                expect(getSectionContinuedTitle('5', 'departure')).toContain('Consignment details');
            });

            test('should include "place of storage" in all titles', () => {
                expect(getSectionContinuedTitle('3', 'arrival')).toContain('place of storage');
                expect(getSectionContinuedTitle('5', 'departure')).toContain('place of storage');
            });
        });

        describe('complete title validation', () => {
            test('arrival section should have exact expected format', () => {
                const sectionNumber = '3';
                const type = 'arrival';
                const result = getSectionContinuedTitle(sectionNumber, type);
                
                const expected = `${sectionNumber}.    Consignment details (upon arrival to the place of storage) continued`;
                expect(result).toBe(expected);
            });

            test('departure section should have exact expected format', () => {
                const sectionNumber = '5';
                const type = 'departure';
                const result = getSectionContinuedTitle(sectionNumber, type);
                
                const expected = `${sectionNumber}.    Consignment details (upon departure from the place of storage) continued`;
                expect(result).toBe(expected);
            });
        });
    });
});
