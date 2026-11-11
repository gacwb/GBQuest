import test from 'node:test';
import assert from 'node:assert/strict';
import { Questao, SessaoCriada } from '../types';
import {
  obterMateriasDoBloco,
  validarParEap,
  reclassificarQuestaoNaLista,
  persistirReclassificacaoQuestao,
} from './reclassificarQuestaoEap';
import { BLOCOS_CANONICOS_EAP, LISTA_34_MATERIAS_CANONICAS } from './recategorizadorEap';
import { STORAGE_KEYS } from '../services/supabaseClient';
import { STORAGE_KEY_PROVAS_CUSTOMIZADAS } from './uploadProvaUtils';

test('REGRA ANTI-REGRESSÃO: obterMateriasDoBloco particiona estritamente as 34 matérias nos 7 blocos', () => {
  const b1 = obterMateriasDoBloco(1);
  const b2 = obterMateriasDoBloco(2);
  const b3 = obterMateriasDoBloco(3);
  const b4 = obterMateriasDoBloco(4);
  const b5 = obterMateriasDoBloco(5);
  const b6 = obterMateriasDoBloco(6);
  const b7 = obterMateriasDoBloco(7);

  assert.equal(b1.length, 5, 'Bloco 1 deve ter exatamente 5 matérias (101 a 105)');
  assert.equal(b2.length, 5, 'Bloco 2 deve ter exatamente 5 matérias (206 a 210)');
  assert.equal(b3.length, 6, 'Bloco 3 deve ter exatamente 6 matérias (311 a 316)');
  assert.equal(b4.length, 6, 'Bloco 4 deve ter exatamente 6 matérias (417 a 422)');
  assert.equal(b5.length, 4, 'Bloco 5 deve ter exatamente 4 matérias (523 a 526)');
  assert.equal(b6.length, 4, 'Bloco 6 deve ter exatamente 4 matérias (627 a 630)');
  assert.equal(b7.length, 4, 'Bloco 7 deve ter exatamente 4 matérias (731 a 734)');

  const total = b1.length + b2.length + b3.length + b4.length + b5.length + b6.length + b7.length;
  assert.equal(total, 34, 'Total de matérias no EAP deve ser rigorosamente 34');

  // Suporte a busca por string de nome
  const b2PorNome = obterMateriasDoBloco('Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)');
  assert.equal(b2PorNome.length, 5);
  assert.equal(b2PorNome[1].nome, '207_Planejamento_da_Contratacao');
});

test('REGRA ANTI-REGRESSÃO: validarParEap valida rigorosamente as combinações oficiais', () => {
  assert.equal(
    validarParEap(
      'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
      '207_Planejamento_da_Contratacao'
    ),
    true
  );

  assert.equal(
    validarParEap(
      'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
      '315_Concreto_Armado'
    ),
    true
  );

  // Par inválido ou com bloco inexistente
  assert.equal(
    validarParEap('Bloco Inexistente', '207_Planejamento_da_Contratacao'),
    false
  );
  assert.equal(
    validarParEap(
      'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
      'Assunto_Inventado'
    ),
    false
  );
});

test('REGRA ANTI-REGRESSÃO: reclassificarQuestaoNaLista atualiza de forma imutável a questão alvo', () => {
  const questoesMock: Questao[] = [
    {
      id: 101,
      banca: 'FAFIPA',
      disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
      assunto: '101_Lei_Organica_e_Organizacao_Administrativa',
      cargo: 'Engenheiro Civil',
      enunciado: 'Enunciado da questão 101',
      alternativas: ['A', 'B', 'C', 'D'],
      correta: 0,
      comentario: 'Comentário 101',
      artigo: 'Art. 1',
    },
    {
      id: 202,
      banca: 'FAFIPA',
      disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
      assunto: '417_Geologia_e_Mecanica_dos_Solos',
      cargo: 'Engenheiro Civil',
      enunciado: 'Enunciado da questão 202',
      alternativas: ['A', 'B', 'C', 'D'],
      correta: 1,
      comentario: 'Comentário 202',
      artigo: '',
    },
  ];

  const novaLista = reclassificarQuestaoNaLista(
    questoesMock,
    101,
    'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    '207_Planejamento_da_Contratacao',
    'Engenheiro civil fiscal de obras'
  );

  assert.equal(novaLista.length, 2);
  const qAtualizada = novaLista.find((q) => q.id === 101)!;
  assert.equal(
    qAtualizada.disciplina,
    'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)'
  );
  assert.equal(qAtualizada.assunto, '207_Planejamento_da_Contratacao');
  assert.equal(qAtualizada.cargo, 'Engenheiro civil fiscal de obras');
  assert.equal(qAtualizada.enunciado, 'Enunciado da questão 101'); // preservado
  assert.equal(qAtualizada.correta, 0); // preservado

  // Questão 202 não foi alterada
  const qIntocada = novaLista.find((q) => q.id === 202)!;
  assert.equal(
    qIntocada.disciplina,
    'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)'
  );
});

test('REGRA ANTI-REGRESSÃO: persistirReclassificacaoQuestao atualiza localStorage e snapshots de sessões', async () => {
  // Mock localStorage
  const storageMock: Record<string, string> = {};
  (globalThis as any).window = {
    dispatchEvent: () => {},
  };
  (globalThis as any).localStorage = {
    getItem: (key: string) => storageMock[key] || null,
    setItem: (key: string, val: string) => {
      storageMock[key] = val;
    },
    removeItem: (key: string) => {
      delete storageMock[key];
    },
  };

  const questaoInicial: Questao = {
    id: 'fafipa_2016_cm_1',
    banca: 'FAFIPA',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '101_Lei_Organica_e_Organizacao_Administrativa',
    cargo: 'Engenheiro Civil',
    enunciado: 'Enunciado da prova',
    alternativas: ['A', 'B', 'C', 'D'],
    correta: 2,
    comentario: '',
    artigo: '',
  };

  const sessaoInicial: SessaoCriada = {
    id: 1,
    codigo: 'SESSAO-TESTE',
    dataHora: new Date().toISOString(),
    banca: 'FAFIPA',
    disciplina: 'Bloco 1',
    assunto: '101',
    quantidade: 1,
    questaoIds: ['fafipa_2016_cm_1'],
    questoesSnap: [{ ...questaoInicial }],
    tipo: 'sessao',
    concluida: false,
  };

  storageMock[STORAGE_KEYS.QUESTOES] = JSON.stringify([questaoInicial]);
  storageMock[STORAGE_KEYS.SESSOES] = JSON.stringify([sessaoInicial]);
  storageMock[STORAGE_KEY_PROVAS_CUSTOMIZADAS] = JSON.stringify({
    questoes: [questaoInicial],
    sessoes: [sessaoInicial],
  });

  const res = await persistirReclassificacaoQuestao(
    'fafipa_2016_cm_1',
    'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    '207_Planejamento_da_Contratacao',
    'Engenheiro Fiscal'
  );

  assert.equal(res.success, true);

  // Verifica que atualizou no STORAGE_KEYS.QUESTOES
  const salvas = JSON.parse(storageMock[STORAGE_KEYS.QUESTOES]);
  assert.equal(salvas[0].disciplina, 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)');
  assert.equal(salvas[0].assunto, '207_Planejamento_da_Contratacao');
  assert.equal(salvas[0].cargo, 'Engenheiro Fiscal');

  // Verifica que atualizou no snapshot das sessões
  const sessoesSalvas = JSON.parse(storageMock[STORAGE_KEYS.SESSOES]);
  assert.equal(
    sessoesSalvas[0].questoesSnap[0].disciplina,
    'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)'
  );
  assert.equal(
    sessoesSalvas[0].questoesSnap[0].assunto,
    '207_Planejamento_da_Contratacao'
  );
});
