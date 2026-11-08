import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRecommendedSize,
  getSizeChart,
  inchesToCm,
  cmToInches,
} from './size-guide-utils';

describe('Size Guide & Recommendation Engine', () => {
  it('converts inches to cm and vice versa accurately', () => {
    assert.equal(inchesToCm(10), 25.4);
    assert.equal(cmToInches(25.4), 10);
  });

  it('recommends Medium for a 39-inch chest with standard fit', () => {
    const result = calculateRecommendedSize({
      chest: 39,
      unit: 'in',
      fitPreference: 'regular',
    });

    assert.equal(result.recommendedSize, 'M');
    assert.ok(result.matchScore >= 90);
    assert.ok(result.fitVerdict.includes('Size M'));
  });

  it('recommends Large when chest is 42 inches in standard fit', () => {
    const result = calculateRecommendedSize({
      chest: 42,
      unit: 'in',
      fitPreference: 'regular',
    });

    assert.equal(result.recommendedSize, 'L');
  });

  it('adjusts up to next size when relaxed fit is preferred on border', () => {
    const result = calculateRecommendedSize({
      chest: 40,
      unit: 'in',
      fitPreference: 'relaxed',
    });

    assert.equal(result.recommendedSize, 'L');
    assert.ok(result.fitVerdict.includes('generous'));
  });

  it('handles metric centimeter inputs correctly', () => {
    // 98 cm is ~38.6 inches -> Medium
    const result = calculateRecommendedSize({
      chest: 98,
      unit: 'cm',
      fitPreference: 'regular',
    });

    assert.equal(result.recommendedSize, 'M');
    assert.ok(result.chestRange.includes('cm'));
  });

  it('handles waist overflow by sizing up for comfort', () => {
    // 39 inch chest would normally be M, but 39 inch waist exceeds M max waist (34)
    const result = calculateRecommendedSize({
      chest: 39,
      waist: 39,
      unit: 'in',
      fitPreference: 'regular',
    });

    assert.equal(result.recommendedSize, 'L');
    assert.ok(result.alternativeExplanation?.includes('waistband'));
  });

  it('returns valid size chart rows for both in and cm', () => {
    const chartIn = getSizeChart('in');
    assert.equal(chartIn.length, 5);
    assert.equal(chartIn[0].size, 'XS');
    assert.ok(chartIn[0].chest.includes('"'));

    const chartCm = getSizeChart('cm');
    assert.equal(chartCm.length, 5);
    assert.ok(chartCm[0].chest.includes('cm'));
  });
});
