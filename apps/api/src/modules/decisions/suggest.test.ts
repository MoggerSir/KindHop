import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { suggest, type Candidate, type SuggestInput } from './suggest.js';

const asOf = '2026-11-21T12:00:00.000Z';

function place(partial: Partial<Candidate> & Pick<Candidate, 'id' | 'name' | 'distanceM' | 'isFree'>): Candidate {
  return {
    sourceName: 'Datos simulados de KindHop',
    asOf,
    dataStatus: 'DEMO',
    ...partial,
  };
}

function input(partial: Partial<SuggestInput> & Pick<SuggestInput, 'candidates'>): SuggestInput {
  return { originName: 'Parque de las Palapas', activeReportNearby: false, lowBudget: false, lang: 'es', ...partial };
}

describe('suggest()', () => {
  it('sin incidencia cercana ni presupuesto bajo no sugiere nada', () => {
    const result = suggest(input({
      candidates: [place({ id: '2', name: 'Otro', distanceM: 100, isFree: true })],
    }));
    assert.deepEqual(result, []);
  });

  it('con incidencia ordena por distancia y explica el desvío con confianza MEDIA', () => {
    const result = suggest(input({
      activeReportNearby: true,
      candidates: [
        place({ id: '8', name: 'Lejos', distanceM: 2000, isFree: true }),
        place({ id: '3', name: 'Cerca', distanceM: 400, isFree: false }),
      ],
    }));
    assert.deepEqual(result.map((s) => s.placeId), ['3', '8']);
    assert.equal(result[0].confidence, 'MEDIUM');
    assert.match(result[0].why, /incidencia activa a menos de 300 m de Parque de las Palapas/);
    assert.match(result[0].why, /a 400 m, sin incidencias activas a menos de 300 m/);
    assert.equal(result[0].source, 'Datos simulados de KindHop');
    assert.equal(result[0].asOf, asOf);
    assert.equal(result[0].dataStatus, 'DEMO');
    assert.equal(result[0].why.includes('Presupuesto bajo'), false);
  });

  it('presupuesto bajo pone is_free true primero y no trata NULL como gratis', () => {
    const result = suggest(input({
      lowBudget: true,
      candidates: [
        place({ id: '4', name: 'Pagado cerca', distanceM: 200, isFree: false }),
        place({ id: '5', name: 'Precio desconocido', distanceM: 300, isFree: null }),
        place({ id: '6', name: 'Gratis lejos', distanceM: 2500, isFree: true }),
      ],
    }));
    assert.deepEqual(result.map((s) => s.title), ['Gratis lejos', 'Pagado cerca', 'Precio desconocido']);
    assert.equal(result[0].confidence, 'HIGH');
    assert.match(result[0].why, /La fuente indica que es gratis/);
    assert.equal(result[1].confidence, 'LOW');
    assert.match(result[1].why, /La fuente indica que no es gratis/);
    assert.equal(result[2].confidence, 'LOW');
    assert.match(result[2].why, /no se asume que lo sea/);
    assert.equal(result[2].why.includes('indica que es gratis'), false);
  });

  it('incidencia y presupuesto bajo: la confianza es la más baja de las dos reglas', () => {
    const result = suggest(input({
      activeReportNearby: true,
      lowBudget: true,
      candidates: [
        place({ id: '2', name: 'Pagado', distanceM: 100, isFree: false }),
        place({ id: '9', name: 'Gratis', distanceM: 900, isFree: true }),
      ],
    }));
    assert.deepEqual(result.map((s) => s.placeId), ['9', '2']);
    assert.equal(result[0].confidence, 'MEDIUM');
    assert.equal(result[1].confidence, 'LOW');
    assert.match(result[0].why, /Presupuesto bajo/);
    assert.match(result[0].why, /incidencia activa/);
  });

  it('empata por id cuando la distancia es la misma y no reordena el arreglo de entrada', () => {
    const candidates = [
      place({ id: '20', name: 'B', distanceM: 100, isFree: null }),
      place({ id: '3', name: 'A', distanceM: 100, isFree: null }),
    ];
    const result = suggest(input({ lowBudget: true, candidates }));
    assert.deepEqual(result.map((s) => s.placeId), ['3', '20']);
    assert.equal(candidates[0].id, '20');
  });

  it('lang=en devuelve el texto why en inglés', () => {
    const result = suggest(
      input({
        lang: 'en',
        activeReportNearby: true,
        lowBudget: true,
        candidates: [place({ id: '1', name: 'Nearby', distanceM: 500, isFree: true })],
      }),
    );
    assert.match(result[0].why, /There is an active incident within 300 m/);
    assert.match(result[0].why, /Low budget\./);
    assert.match(result[0].why, /The source indicates it is free\./);
    assert.match(result[0].why, /500 m away/);
  });

  it('sin fila de fuente la confianza baja a LOW', () => {
    const result = suggest(input({
      lowBudget: true,
      candidates: [place({ id: '1', name: 'Gratis', distanceM: 10, isFree: true, sourceName: 'Sin fuente registrada' })],
    }));
    assert.equal(result[0].confidence, 'LOW');
    assert.equal(result[0].source, 'Sin fuente registrada');
  });
});

describe('gasto local (KH-020)', () => {
  const candidates = [
    place({ id: '5', name: 'Otra cadena', distanceM: 100, isFree: null, isChain: true }),
    place({ id: '6', name: 'Café de la esquina', distanceM: 300, isFree: null, isChain: false }),
    place({ id: '7', name: 'Sin dato', distanceM: 50, isFree: null, isChain: null }),
  ];

  it('con origen de cadena solo propone negocios sin marca y explica por qué', () => {
    const out = suggest({ originName: 'Starbucks Plaza', originIsChain: true, originBrand: 'Starbucks', activeReportNearby: false, lowBudget: false, lang: 'es', candidates });
    assert.deepEqual(out.map((s) => s.title), ['Café de la esquina']);
    assert.match(out[0].why, /Starbucks Plaza es de una cadena \(Starbucks\)/);
    assert.match(out[0].why, /probablemente es un negocio local/);
    assert.equal(out[0].confidence, 'MEDIUM');
  });

  it('combinada con presupuesto bajo y precio desconocido, gana la confianza más baja', () => {
    const out = suggest({ originName: 'Oxxo', originIsChain: true, originBrand: 'Oxxo', activeReportNearby: false, lowBudget: true, lang: 'en', candidates });
    assert.equal(out[0].confidence, 'LOW');
    assert.match(out[0].why, /chain \(Oxxo\)/);
  });

  it('sin cadena, sin incidencia y sin presupuesto bajo no sugiere nada', () => {
    assert.deepEqual(suggest({ originName: 'Taquería', originIsChain: false, activeReportNearby: false, lowBudget: false, lang: 'es', candidates }), []);
  });
});
