const renderExportCert = require('../../../src/pdf/renderExportCert');

describe('Transport Appendix Helper Functions - Pages 6 & 7', () => {
    
    describe('getTransportModes', () => {
        test('should extract transportations array with multiple modes', () => {
            const data = {
                transportations: [
                    { vehicle: 'truck', registrationNumber: 'ABC123' },
                    { vehicle: 'plane', flightNumber: 'BA456' }
                ]
            };
            const result = renderExportCert.getTransportModes(data);
            expect(result).toHaveLength(2);
            expect(result[0].vehicle).toBe('truck');
            expect(result[1].vehicle).toBe('plane');
        });

        test('should convert single transport object to array', () => {
            const data = {
                transport: { vehicle: 'truck', registrationNumber: 'XYZ789' }
            };
            const result = renderExportCert.getTransportModes(data);
            expect(result).toHaveLength(1);
            expect(result[0].vehicle).toBe('truck');
        });

        test('should return empty array when no transport data', () => {
            const data = {};
            const result = renderExportCert.getTransportModes(data);
            expect(result).toEqual([]);
        });
    });

    describe('getVcDetails - Vessel name and flag', () => {
        test('should extract vessel details from containerVessel', () => {
            const data = {
                transportations: [
                    { vehicle: 'containerVessel', vesselName: 'MV Test', flagState: 'GB' },
                    { vehicle: 'containerVessel', vesselName: 'MV Test2', flagState: 'NL' }
                ]
            };
            const result = renderExportCert.getVcDetails(data);
            expect(result).toBe('MV Test GB, MV Test2 NL');
        });

        test('should extract vessel details from directLanding', () => {
            const data = {
                transportations: [
                    { vehicle: 'directLanding', vesselName: 'FV Fisher', flagState: 'FR' }
                ]
            };
            const result = renderExportCert.getVcDetails(data);
            expect(result).toBe('FV Fisher FR');
        });

        test('should handle up to 5 vessels as per requirements', () => {
            const data = {
                transportations: [
                    { vehicle: 'containerVessel', vesselName: 'Vessel1', flagState: 'UK' },
                    { vehicle: 'containerVessel', vesselName: 'Vessel2', flagState: 'FR' },
                    { vehicle: 'containerVessel', vesselName: 'Vessel3', flagState: 'DE' },
                    { vehicle: 'containerVessel', vesselName: 'Vessel4', flagState: 'ES' },
                    { vehicle: 'containerVessel', vesselName: 'Vessel5', flagState: 'IT' }
                ]
            };
            const result = renderExportCert.getVcDetails(data);
            const vessels = result.split(', ');
            expect(vessels).toHaveLength(5);
            expect(result).toContain('Vessel1');
            expect(result).toContain('Vessel5');
        });

        test('should handle missing vessel name or flag', () => {
            const data = {
                transportations: [
                    { vehicle: 'containerVessel', vesselName: 'MV Test' },
                    { vehicle: 'containerVessel', flagState: 'GB' }
                ]
            };
            const result = renderExportCert.getVcDetails(data);
            expect(result).toBe('MV Test, GB');
        });

        test('should fallback to exportPayload for directLanding', () => {
            const data = {
                transport: { vehicle: 'directLanding' },
                exportPayload: {
                    items: [{
                        landings: [{
                            model: {
                                vessel: {
                                    vesselName: 'FV Fallback',
                                    pln: 'PLN123'
                                }
                            }
                        }]
                    }]
                }
            };
            const result = renderExportCert.getVcDetails(data);
            expect(result).toBe('FV Fallback (PLN123)');
        });
    });

    describe('getFlightDetails - Flight numbers', () => {
        test('should extract flight numbers from plane transport', () => {
            const data = {
                transportations: [
                    { vehicle: 'plane', flightNumber: 'BA123' },
                    { vehicle: 'plane', flightNumber: 'LH456' }
                ]
            };
            const result = renderExportCert.getFlightDetails(data);
            expect(result).toBe('BA123, LH456');
        });

        test('should handle multiple flight numbers', () => {
            const data = {
                transportations: [
                    { vehicle: 'plane', flightNumber: 'F1' },
                    { vehicle: 'plane', flightNumber: 'F2' },
                    { vehicle: 'plane', flightNumber: 'F3' }
                ]
            };
            const result = renderExportCert.getFlightDetails(data);
            expect(result).toBe('F1, F2, F3');
        });

        test('should ignore non-plane vehicles', () => {
            const data = {
                transportations: [
                    { vehicle: 'truck', flightNumber: 'IGNORE' },
                    { vehicle: 'plane', flightNumber: 'BA789' }
                ]
            };
            const result = renderExportCert.getFlightDetails(data);
            expect(result).toBe('BA789');
        });

        test('should return empty string when no planes', () => {
            const data = {
                transportations: [
                    { vehicle: 'truck', registrationNumber: 'ABC123' }
                ]
            };
            const result = renderExportCert.getFlightDetails(data);
            expect(result).toBe('');
        });
    });

    describe('getTruckDetails - Nationality and registration', () => {
        test('should extract truck nationality and registration', () => {
            const data = {
                transportations: [
                    { vehicle: 'truck', nationalityOfVehicle: 'GB', registrationNumber: 'ABC123' }
                ]
            };
            const result = renderExportCert.getTruckDetails(data);
            expect(result).toBe('GB ABC123');
        });

        test('should handle registration only', () => {
            const data = {
                transportations: [
                    { vehicle: 'truck', registrationNumber: 'XYZ789' }
                ]
            };
            const result = renderExportCert.getTruckDetails(data);
            expect(result).toBe('XYZ789');
        });

        test('should handle nationality only', () => {
            const data = {
                transportations: [
                    { vehicle: 'truck', nationalityOfVehicle: 'FR' }
                ]
            };
            const result = renderExportCert.getTruckDetails(data);
            expect(result).toBe('FR');
        });

        test('should handle multiple trucks', () => {
            const data = {
                transportations: [
                    { vehicle: 'truck', nationalityOfVehicle: 'UK', registrationNumber: 'T1' },
                    { vehicle: 'truck', nationalityOfVehicle: 'FR', registrationNumber: 'T2' },
                    { vehicle: 'truck', nationalityOfVehicle: 'DE', registrationNumber: 'T3' }
                ]
            };
            const result = renderExportCert.getTruckDetails(data);
            const trucks = result.split(', ');
            expect(trucks).toHaveLength(3);
        });

        test('should skip trucks with no nationality or registration', () => {
            const data = {
                transportations: [
                    { vehicle: 'truck', nationalityOfVehicle: 'GB', registrationNumber: 'ABC' },
                    { vehicle: 'truck' }
                ]
            };
            const result = renderExportCert.getTruckDetails(data);
            expect(result).toBe('GB ABC');
        });
    });

    describe('getRailwayBillNumber - Train bill numbers', () => {
        test('should extract railway bill numbers', () => {
            const data = {
                transportations: [
                    { vehicle: 'train', railwayBillNumber: 'RAIL123' },
                    { vehicle: 'train', railwayBillNumber: 'RAIL456' }
                ]
            };
            const result = renderExportCert.getRailwayBillNumber(data);
            expect(result).toBe('RAIL123, RAIL456');
        });

        test('should ignore non-train vehicles', () => {
            const data = {
                transportations: [
                    { vehicle: 'truck', railwayBillNumber: 'IGNORE' },
                    { vehicle: 'train', railwayBillNumber: 'RAIL123' }
                ]
            };
            const result = renderExportCert.getRailwayBillNumber(data);
            expect(result).toBe('RAIL123');
        });
    });

    describe('getFreightBillNumber - Freight bill numbers', () => {
        test('should extract freight bill numbers', () => {
            const data = {
                transportations: [
                    { vehicle: 'truck', freightBillNumber: 'FBN123' },
                    { vehicle: 'plane', freightBillNumber: 'FBN456' }
                ]
            };
            const result = renderExportCert.getFreightBillNumber(data);
            expect(result).toBe('FBN123, FBN456');
        });

        test('should work across any vehicle type', () => {
            const data = {
                transportations: [
                    { vehicle: 'truck', freightBillNumber: 'FBN-TRK' },
                    { vehicle: 'plane', freightBillNumber: 'FBN-AIR' },
                    { vehicle: 'train', freightBillNumber: 'FBN-RAIL' }
                ]
            };
            const result = renderExportCert.getFreightBillNumber(data);
            expect(result).toBe('FBN-TRK, FBN-AIR, FBN-RAIL');
        });
    });

    describe('getContainerIdentificationNumber - Container IDs', () => {
        test('should extract containerIdentificationNumber', () => {
            const data = {
                transportations: [
                    { vehicle: 'containerVessel', containerIdentificationNumber: 'CONT123' },
                    { vehicle: 'containerVessel', containerIdentificationNumber: 'CONT456' }
                ]
            };
            const result = renderExportCert.getContainerIdentificationNumber(data);
            expect(result).toBe('CONT123, CONT456');
        });

        test('should fallback to containerNumber', () => {
            const data = {
                transportations: [
                    { vehicle: 'containerVessel', containerNumber: 'CN789' }
                ]
            };
            const result = renderExportCert.getContainerIdentificationNumber(data);
            expect(result).toBe('CN789');
        });

        test('should handle mixed containerIdentificationNumber and containerNumber', () => {
            const data = {
                transportations: [
                    { containerIdentificationNumber: 'C1' },
                    { containerNumber: 'C2' },
                    { containerIdentificationNumber: 'C3' }
                ]
            };
            const result = renderExportCert.getContainerIdentificationNumber(data);
            const containers = result.split(', ');
            expect(containers).toHaveLength(3);
            expect(result).toBe('C1, C2, C3');
        });
    });

    describe('getDeparturePlace - Port/airport/departure point', () => {
        test('should extract departure places', () => {
            const data = {
                transportations: [
                    { vehicle: 'plane', departurePlace: 'Heathrow' },
                    { vehicle: 'truck', departurePlace: 'Dover' }
                ]
            };
            const result = renderExportCert.getDeparturePlace(data);
            expect(result).toBe('Heathrow, Dover');
        });

        test('should handle CMR special case', () => {
            const data = {
                transportations: [
                    { vehicle: 'truck', cmr: 'true', departurePlace: 'London' }
                ]
            };
            const result = renderExportCert.getDeparturePlace(data);
            expect(result).toBe('See attached transport documents');
        });

        test('should deduplicate departure places', () => {
            const data = {
                transportations: [
                    { departurePlace: 'London' },
                    { departurePlace: 'London' },
                    { departurePlace: 'Manchester' }
                ]
            };
            const result = renderExportCert.getDeparturePlace(data);
            expect(result).toBe('London, Manchester');
        });

        test('should fallback to single transport object', () => {
            const data = {
                transport: { departurePlace: 'London Heathrow' }
            };
            const result = renderExportCert.getDeparturePlace(data);
            expect(result).toBe('London Heathrow');
        });
    });

    describe('getOtherTransportDocuments - Other documents', () => {
        test('should extract documents from array format', () => {
            const data = {
                transportations: [
                    {
                        transportDocuments: [
                            { name: 'Bill of Lading', reference: 'BOL123' },
                            { name: 'CMR', reference: 'CMR456' }
                        ]
                    }
                ]
            };
            const result = renderExportCert.getOtherTransportDocuments(data);
            expect(result).toContain('Bill of Lading - BOL123');
            expect(result).toContain('CMR - CMR456');
        });

        test('should extract documents from string format', () => {
            const data = {
                transportations: [
                    {
                        transportDocuments: 'DOC-001\nDOC-002\nDOC-003'
                    }
                ]
            };
            const result = renderExportCert.getOtherTransportDocuments(data);
            expect(result).toBe('DOC-001\nDOC-002\nDOC-003');
        });

        test('should handle documents field as alternative', () => {
            const data = {
                transportations: [
                    {
                        documents: [
                            { name: 'Air Waybill', reference: 'AWB789' }
                        ]
                    }
                ]
            };
            const result = renderExportCert.getOtherTransportDocuments(data);
            expect(result).toContain('Air Waybill - AWB789');
        });

        test('should limit to 25 documents', () => {
            const docs = [];
            for (let i = 1; i <= 30; i++) {
                docs.push({ name: `Doc${i}`, reference: `REF${i}` });
            }
            const data = {
                transportations: [
                    { transportDocuments: docs }
                ]
            };
            const result = renderExportCert.getOtherTransportDocuments(data);
            const lines = result.split('\n');
            expect(lines).toHaveLength(25);
        });

        test('should maintain insertion order', () => {
            const data = {
                transportations: [
                    {
                        transportDocuments: [
                            { name: 'Zebra', reference: 'Z1' },
                            { name: 'Alpha', reference: 'A1' },
                            { name: 'Beta', reference: 'B1' }
                        ]
                    }
                ]
            };
            const result = renderExportCert.getOtherTransportDocuments(data);
            const lines = result.split('\n');
            expect(lines[0]).toContain('Zebra');
            expect(lines[1]).toContain('Alpha');
            expect(lines[2]).toContain('Beta');
        });

        test('should join with newline separator', () => {
            const data = {
                transportations: [
                    {
                        transportDocuments: [
                            { name: 'Doc1', reference: 'R1' },
                            { name: 'Doc2', reference: 'R2' }
                        ]
                    }
                ]
            };
            const result = renderExportCert.getOtherTransportDocuments(data);
            expect(result.includes('\n')).toBe(true);
        });
    });

    describe('getVehicleType - Legacy single transport', () => {
        test('should extract vehicle type from transport object', () => {
            const data = {
                transport: { vehicle: 'TRUCK' }
            };
            const result = renderExportCert.getVehicleType(data);
            expect(result).toBe('TRUCK');
        });

        test('should return empty string when no transport', () => {
            const data = {};
            const result = renderExportCert.getVehicleType(data);
            expect(result).toBe('');
        });

        test('should convert to uppercase', () => {
            const data = {
                transport: { vehicle: 'plane' }
            };
            const result = renderExportCert.getVehicleType(data);
            expect(result).toBe('PLANE');
        });
    });
});
