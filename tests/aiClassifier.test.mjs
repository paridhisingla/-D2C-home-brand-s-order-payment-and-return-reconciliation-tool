/**
 * Unit Tests for AI Tamil Translation & Issue Categorization Engine
 * Tests real factory floor Tamil phrases, Tanglish, low-confidence edge cases, and human review flags.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyTamilNote, PRODUCTION_REASON_CATEGORIES } from '../src/lib/aiClassifier.mjs';

test('Translates and classifies machine breakdown correctly', () => {
  const note = 'தையல் மெஷின் மோட்டார் பழுதாகிவிட்டது, மெக்கானிக் வந்து சரிசெய்கிறார்';
  const result = classifyTamilNote(note);

  assert.equal(result.predictedCategory, 'Machine Breakdown');
  assert.ok(result.confidence >= 0.90);
  assert.equal(result.needsReview, false);
  assert.ok(result.englishTranslation.toLowerCase().includes('motor'));
});

test('Translates and classifies needle shortage correctly', () => {
  const note = 'நீடில் உடைந்துவிட்டது, புதிய ஊசி வர தாமதம்';
  const result = classifyTamilNote(note);

  assert.equal(result.predictedCategory, 'Needle / Trims Shortage');
  assert.ok(result.confidence >= 0.90);
  assert.ok(result.englishTranslation.toLowerCase().includes('needle'));
});

test('Translates and classifies subcontract printing/washing delay', () => {
  const note = 'பிரிண்டிங் ஸ்கிரீன் மை காய நேரம் எடுக்கிறது, வானிலை ஈரமாக உள்ளது';
  const result = classifyTamilNote(note);

  assert.equal(result.predictedCategory, 'Subcontract Printing / Washing Delay');
  assert.ok(result.confidence >= 0.85);
});

test('Translates power outage floor note', () => {
  const note = 'மின்வெட்டு காரணமாக 2 மணி நேரம் வேலை நின்றது';
  const result = classifyTamilNote(note);

  assert.equal(result.predictedCategory, 'Power Outage / Utilities');
  assert.ok(result.confidence >= 0.90);
});

test('Identifies Tanglish inputs from supervisor floor notes', () => {
  const note = 'stitching machine motor repair looper broken';
  const result = classifyTamilNote(note);

  assert.equal(result.predictedCategory, 'Machine Breakdown');
  assert.ok(result.confidence > 0.70);
});

test('When AI is unsure or encounters unknown note, it flags needsReview and offers alternatives', () => {
  const ambiguousNote = 'இன்று விசித்திரமான சத்தம் கேட்கிறது, புரியவில்லை';
  const result = classifyTamilNote(ambiguousNote);

  // Confidence should be low (< 0.75) and flagged for merchandiser review
  assert.ok(result.confidence < 0.75);
  assert.equal(result.needsReview, true);
  assert.ok(result.alternativeCategories.length > 0);
  assert.ok(result.explanation.includes('confidence'));
});

test('Empty note returns Normal Production with no review needed', () => {
  const result = classifyTamilNote('');
  assert.equal(result.predictedCategory, 'Normal Production / No Issue');
  assert.equal(result.needsReview, false);
});
