import test from 'node:test';
import assert from 'node:assert/strict';
import { base64ParaBlob } from './documentDownload';

test('base64ParaBlob converte base64 simples para Blob', async () => {
  // "Hello World" em base64: SGVsbG8gV29ybGQ=
  const base64 = 'SGVsbG8gV29ybGQ=';
  const blob = base64ParaBlob(base64, 'text/plain');

  assert.equal(blob.type, 'text/plain');
  assert.equal(blob.size, 11);

  const text = await blob.text();
  assert.equal(text, 'Hello World');
});

test('base64ParaBlob lida com data URI prefix', async () => {
  const dataUri = 'data:application/pdf;base64,SGVsbG8gV29ybGQ=';
  const blob = base64ParaBlob(dataUri, 'application/pdf');

  assert.equal(blob.type, 'application/pdf');
  assert.equal(blob.size, 11);
});

test('base64ParaBlob lida com bytes binarios simulando PDF', async () => {
  // Simulação de cabeçalho "%PDF-1.4"
  // "%PDF-1.4" em base64: JVBERi0xLjQ=
  const pdfBase64 = 'JVBERi0xLjQ=';
  const blob = base64ParaBlob(pdfBase64, 'application/pdf');

  assert.equal(blob.type, 'application/pdf');
  assert.equal(blob.size, 8);

  const text = await blob.text();
  assert.equal(text, '%PDF-1.4');
});
