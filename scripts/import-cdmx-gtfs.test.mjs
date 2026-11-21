import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildRoutes,
  fareCentsForRoute,
  fixtureDir,
  modeFor,
  normalizeColor,
  parseCsv,
  pickRepresentativeTrip,
  priceToCents,
  readGtfsDirectory,
} from './import-cdmx-gtfs.mjs';

describe('parser GTFS', () => {
  it('respeta comillas y comas dentro de un campo', () => {
    const rows = parseCsv('nombre,nota\n"Indios, Verdes","linea ""1"""\n');
    assert.equal(rows[0].nombre, 'Indios, Verdes');
    assert.equal(rows[0].nota, 'linea "1"');
  });

  it('normaliza el color GTFS y rechaza valores que no son hex', () => {
    assert.equal(normalizeColor('d40d0d'), '#D40D0D');
    assert.equal(normalizeColor('#aabbcc'), '#AABBCC');
    assert.equal(normalizeColor(''), null);
    assert.equal(normalizeColor('rojo'), null);
  });

  it('clasifica Metrobús como brt aunque el route_type sea bus', () => {
    assert.equal(modeFor('Metrobús', '3'), 'brt');
    assert.equal(modeFor('Red de Transporte de Pasajeros', '3'), 'bus');
    assert.equal(modeFor('Sistema de Transporte Colectivo Metro', '1'), 'metro');
    assert.equal(modeFor('Cablebus', '6'), 'other');
  });

  it('pasa la tarifa a centavos solo si hay una sola tarifa de ruta exacta', () => {
    assert.equal(priceToCents('6'), 600);
    assert.equal(priceToCents('6.5'), 650);
    assert.equal(priceToCents('6.50'), 650);
    assert.equal(priceToCents('6.501'), undefined);
    assert.equal(priceToCents(''), undefined);
    const attributes = [{ fare_id: 'mb', price: '6.00' }];
    const rules = [{ fare_id: 'mb', route_id: 'L1', origin_id: '', destination_id: '', contains_id: '' }];
    assert.equal(fareCentsForRoute('L1', attributes, rules), 600);
    assert.equal(fareCentsForRoute('L1', [], []), undefined);
    assert.equal(
      fareCentsForRoute('L1', attributes, [
        ...rules,
        { fare_id: 'otra', route_id: 'L1', origin_id: '', destination_id: '', contains_id: '' },
      ]),
      undefined,
    );
  });

  it('en empate de paradas elige el trip_id menor', () => {
    const counts = new Map([
      ['B_03300L1000_1', 46],
      ['B_03100L1000_0', 46],
    ]);
    const trip = pickRepresentativeTrip(
      [
        { trip_id: 'B_03300L1000_1', shape_id: 's1' },
        { trip_id: 'B_03100L1000_0', shape_id: 's0' },
      ],
      counts,
    );
    assert.equal(trip.trip_id, 'B_03100L1000_0');
  });
});

describe('fixture recortado del GTFS de SEMOVI', () => {
  it('arma la línea 1 de Metrobús sin tarifa ni horarios', async () => {
    const { routes, meta } = await readGtfsDirectory(fixtureDir);
    assert.equal(routes.length, 1);
    const route = routes[0];
    assert.equal(route.externalId, 'B_CMX0300L1');
    assert.equal(route.name, 'Indios Verdes - El Caminero');
    assert.equal(route.shortName, '1');
    assert.equal(route.mode, 'brt');
    assert.equal(route.color, '#D40D0D');
    assert.equal(route.fareCents, undefined);
    assert.equal(route.representativeTripId, 'B_03100L1000_0');
    assert.equal(route.geometry.type, 'LineString');
    assert.equal(route.geometry.coordinates.length, 131);
    assert.ok(Math.abs(route.geometry.coordinates[0][0] - Number('-99.11959059316032')) < 1e-9);
    assert.ok(Math.abs(route.geometry.coordinates[0][1] - Number('19.4967783996861')) < 1e-9);
    assert.ok(route.geometry.coordinates[0][0] < -90);
    assert.ok(route.geometry.coordinates[0][1] > 0);
    assert.equal(route.stops.length, 46);
    assert.equal(route.stops[0].name, 'Indios Verdes');
    assert.equal(route.stops[0].externalId, 'B_0300L1-INDIOSVERDES');
    assert.equal(route.stops[0].sequence, 1);
    assert.equal(route.stops.at(-1).name, 'El Caminero');
    assert.equal(route.stops.at(-1).sequence, 46);
    assert.equal('arrivalTime' in route.stops[0], false);
    assert.equal(meta.retrievedAt, '2026-11-21T02:50:00.000Z');
    assert.match(meta.license, /CC BY 4\.0/);
    assert.match(meta.license, /creativecommons\.org\/licenses\/by\/4\.0/);
  });

  it('no inventa un trazo si falta el shape del viaje elegido', () => {
    assert.throws(
      () => buildRoutes({
        agency: [{ agency_id: 'MB', agency_name: 'Metrobús' }],
        routes: [{ route_id: 'R', agency_id: 'MB', route_short_name: '1', route_long_name: 'A - B', route_type: '3', route_color: '' }],
        trips: [{ route_id: 'R', trip_id: 'T', shape_id: 'S' }],
        stopTimes: [
          { trip_id: 'T', stop_id: 'P1', stop_sequence: '1' },
          { trip_id: 'T', stop_id: 'P2', stop_sequence: '2' },
        ],
        stops: [
          { stop_id: 'P1', stop_name: 'Uno', stop_lat: '19.5', stop_lon: '-99.1' },
          { stop_id: 'P2', stop_name: 'Dos', stop_lat: '19.4', stop_lon: '-99.2' },
        ],
        shapes: [],
        fareAttributes: [],
        fareRules: [],
      }),
      /no tiene trazo/,
    );
  });
});
