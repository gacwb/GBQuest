import React, { useState, useMemo } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { Questao, SessaoCriada } from '../types';
import { callGeminiExtrairProvaPdf } from '../services/geminiService';
import {
  MetadadosProvaImportada,
  QuestaoExtraidaRaw,
  normalizarTextoGabaritoParaMapa,
  formatarQuestoesExtraidasParaAcervo,
  criarSessaoProvaImportada,
} from '../utils/uploadProvaUtils';
import { registrarNovasProvasAnteriores } from '../utils/provasAnterioresRegistry';
import { obterCatalogoAssuntosOficiais } from '../utils/escopoConcurso';

interface ModalUploadProvaPdfProps {
  isOpen: boolean;
  onClose: () => void;
  onProvaSalva: (novasQuestoes: Questao[], novaSessao: SessaoCriada) => void;
}

export function ModalUploadProvaPdf({
  isOpen,
  onClose,
  onProvaSalva,
}: ModalUploadProvaPdfProps) {
  const [etapa, setEtapa] = useState<'upload' | 'revisao'>('upload');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [banca, setBanca] = useState('Fundação FAFIPA');
  const [ano, setAno] = useState('2024');
  const [orgao, setOrgao] = useState('Prefeitura de Curitiba');
  const [cargo, setCargo] = useState('Engenheiro Civil');
  const [gabaritoTexto, setGabaritoTexto] = useState('');

  const [carregando, setCarregando] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  // Questões extraídas em estado de revisão
  const [questoesRevisao, setQuestoesRevisao] = useState<QuestaoExtraidaRaw[]>([]);
  const [questaoAbertaIndex, setQuestaoAbertaIndex] = useState<number | null>(0);
  const [ignorarForaEscopo, setIgnorarForaEscopo] = useState(true);

  // Catálogo oficial dos 34 assuntos da banca / edital
  const catalogoOficial = useMemo(() => obterCatalogoAssuntosOficiais(), []);

  // Mapa ao vivo do gabarito digitado
  const mapaGabarito = useMemo(() => {
    return normalizarTextoGabaritoParaMapa(gabaritoTexto);
  }, [gabaritoTexto]);

  // Contagens dinâmicas de escopo
  const totalQuestoes = questoesRevisao.length;
  const questoesNoEscopo = questoesRevisao.filter((q) => q.noEscopo !== false);
  const questoesForaEscopo = questoesRevisao.filter((q) => q.noEscopo === false);

  const questoesEfetivasParaSalvar = questoesRevisao.filter((q) => {
    if (q.desconsiderada) return false;
    if (ignorarForaEscopo && q.noEscopo === false) return false;
    return true;
  });

  if (!isOpen) return null;

  const handleArquivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArquivo(e.target.files[0]);
      setErro(null);
    }
  };

  const handleExtrair = async () => {
    if (!arquivo) {
      setErro('Selecione um arquivo PDF de prova.');
      return;
    }
    if (!banca.trim() || !cargo.trim()) {
      setErro('Preencha os campos de Banca e Cargo.');
      return;
    }

    try {
      setCarregando(true);
      setErro(null);
      setStatusMsg('Iniciando processamento da prova...');

      const extraidas = await callGeminiExtrairProvaPdf({
        file: arquivo,
        banca: banca.trim(),
        ano: ano.trim(),
        orgao: orgao.trim(),
        cargo: cargo.trim(),
        gabaritoTexto: gabaritoTexto.trim(),
        onProgress: (msg) => setStatusMsg(msg),
      });

      if (!extraidas || extraidas.length === 0) {
        throw new Error('Nenhuma questão pôde ser extraída do documento.');
      }

      setQuestoesRevisao(extraidas);
      setEtapa('revisao');
    } catch (err: any) {
      console.error('Falha na extração:', err);
      setErro(err.message || 'Falha ao analisar o PDF da prova.');
    } finally {
      setCarregando(false);
      setStatusMsg('');
    }
  };

  const handleAlterarCorreta = (qIdx: number, novaCorreta: number) => {
    setQuestoesRevisao((prev) =>
      prev.map((q, idx) => (idx === qIdx ? { ...q, correta: novaCorreta } : q))
    );
  };

  const handleToggleDesconsiderar = (qIdx: number) => {
    setQuestoesRevisao((prev) =>
      prev.map((q, idx) => (idx === qIdx ? { ...q, desconsiderada: !q.desconsiderada } : q))
    );
  };

  const handleVincularAssuntoOficial = (qIdx: number, codigoPdf: string) => {
    const item = catalogoOficial.find((c) => c.codigo === codigoPdf);
    if (!item) return;
    setQuestoesRevisao((prev) =>
      prev.map((q, idx) =>
        idx === qIdx
          ? {
              ...q,
              disciplina: item.blocoNome,
              assunto: item.nome,
              blocoNome: item.blocoNome,
              blocoNumero: item.blocoNumero,
              codigoPdf: item.codigo,
              noEscopo: true,
              desconsiderada: false,
              motivoForaEscopo: undefined,
            }
          : q
      )
    );
  };

  const handleAlterarCampo = (
    qIdx: number,
    campo: 'disciplina' | 'assunto' | 'enunciado',
    valor: string
  ) => {
    setQuestoesRevisao((prev) =>
      prev.map((q, idx) => (idx === qIdx ? { ...q, [campo]: valor } : q))
    );
  };

  const handleSalvarDefinitivo = () => {
    if (questoesEfetivasParaSalvar.length === 0) {
      setErro('Nenhuma questão válida do escopo selecionada para salvar no acervo.');
      return;
    }

    const meta: MetadadosProvaImportada = {
      banca: banca.trim(),
      ano: ano.trim(),
      orgao: orgao.trim(),
      cargo: cargo.trim(),
      gabaritoTexto: gabaritoTexto.trim(),
    };

    const questoesFormatadas = formatarQuestoesExtraidasParaAcervo(
      questoesEfetivasParaSalvar,
      meta,
      mapaGabarito
    );

    const novaSessao = criarSessaoProvaImportada(meta, questoesFormatadas);

    // Registra canonicamente no registro de provas anteriores
    registrarNovasProvasAnteriores(questoesFormatadas, [novaSessao]);

    onProvaSalva(questoesFormatadas, novaSessao);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Upload Inteligente de Prova Oficial (PDF)
              </h2>
              <p className="text-xs text-slate-400">
                Extração estruturada de questões e gabarito assistida por IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {erro && (
            <div className="flex items-start gap-3 p-3.5 bg-red-950/40 border border-red-800/50 rounded-lg text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{erro}</span>
            </div>
          )}

          {etapa === 'upload' ? (
            <div className="space-y-5">
              {/* File upload zone */}
              <div className="border border-dashed border-slate-700/80 hover:border-blue-500/50 rounded-xl p-6 text-center transition-colors bg-slate-950/40">
                <input
                  type="file"
                  id="pdf-prova-input"
                  accept="application/pdf"
                  onChange={handleArquivoChange}
                  className="hidden"
                />
                <label
                  htmlFor="pdf-prova-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-400 hover:underline">
                      {arquivo ? arquivo.name : 'Clique para selecionar o PDF da Prova'}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {arquivo
                        ? `${(arquivo.size / (1024 * 1024)).toFixed(2)} MB · Arquivo pronto`
                        : 'Cadernos de questões oficiais em formato PDF'}
                    </p>
                  </div>
                </label>
              </div>

              {/* Metadata Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Banca Examinadora
                  </label>
                  <input
                    type="text"
                    value={banca}
                    onChange={(e) => setBanca(e.target.value)}
                    placeholder="Ex: Fundação FAFIPA"
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Ano da Prova
                  </label>
                  <input
                    type="text"
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    placeholder="Ex: 2024"
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Órgão / Ente
                  </label>
                  <input
                    type="text"
                    value={orgao}
                    onChange={(e) => setOrgao(e.target.value)}
                    placeholder="Ex: Prefeitura de Curitiba"
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Cargo Concorrido
                  </label>
                  <input
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="Ex: Engenheiro Civil"
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Gabarito Oficial Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Gabarito Oficial (Opcional - mas recomendado)
                  </label>
                  {mapaGabarito.size > 0 && (
                    <span className="text-xs font-mono text-emerald-400 tabular-nums">
                      {mapaGabarito.size} respostas mapeadas
                    </span>
                  )}
                </div>
                <textarea
                  value={gabaritoTexto}
                  onChange={(e) => setGabaritoTexto(e.target.value)}
                  rows={3}
                  placeholder="Cole aqui o gabarito oficial se disponível (ex: 1-A, 2-C, 3-D, 4-B... ou 01: Letra B, 02: Letra A...)"
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Se fornecido, o gabarito oficial é fixado com precisão matemática em cada questão.
                </p>
              </div>

              {carregando && (
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-xs text-slate-300 font-mono">{statusMsg}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Revision Top Summary & Escopo do Edital */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-100 font-mono tabular-nums">
                      {totalQuestoes} questões
                    </span>
                    <span>extraídas da prova</span>
                    <span>·</span>
                    <span className="text-slate-400">
                      {banca} ({ano}) - {cargo}
                    </span>
                  </div>
                  <button
                    onClick={() => setEtapa('upload')}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Subir Outro Arquivo
                  </button>
                </div>

                {/* Filtro e Indicador de Alinhamento com o Edital */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>{questoesNoEscopo.length} no escopo do edital</span>
                    </span>

                    {questoesForaEscopo.length > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/80 text-amber-300 font-medium flex items-center gap-1.5" title="Questões de matérias alheias ao edital do concurso (ex: Matemática Básica)">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span>{questoesForaEscopo.length} fora do edital (ex: Matemática Básica)</span>
                      </span>
                    )}
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white transition">
                    <input
                      type="checkbox"
                      checked={ignorarForaEscopo}
                      onChange={(e) => setIgnorarForaEscopo(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px] font-medium text-slate-300">
                      Ignorar automaticamente questões fora do edital ao salvar
                    </span>
                  </label>
                </div>
              </div>

              {/* Questions list accordion */}
              <div className="space-y-2">
                {questoesRevisao.map((q, idx) => {
                  const estaAberta = questaoAbertaIndex === idx;
                  const numDisplay = q.numero || idx + 1;
                  const estaNoEscopo = q.noEscopo !== false;
                  const estaDesconsiderada = q.desconsiderada || (ignorarForaEscopo && !estaNoEscopo);

                  return (
                    <div
                      key={idx}
                      className={`border rounded-lg overflow-hidden transition-all ${
                        estaDesconsiderada
                          ? 'border-slate-800/60 bg-slate-950/30 opacity-70'
                          : estaNoEscopo
                          ? 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                          : 'border-amber-900/40 bg-amber-950/10'
                      }`}
                    >
                      <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                          {/* Checkbox para incluir ou ignorar a questão */}
                          <input
                            type="checkbox"
                            checked={!estaDesconsiderada}
                            onChange={() => handleToggleDesconsiderar(idx)}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer shrink-0"
                            title={estaDesconsiderada ? 'Clique para incluir no salvamento' : 'Clique para ignorar esta questão'}
                          />

                          <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono font-medium text-slate-300 tabular-nums shrink-0">
                            Q{numDisplay}
                          </span>

                          <div className="flex items-center gap-2 truncate">
                            {estaNoEscopo ? (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 font-semibold shrink-0">
                                {q.blocoNome ? `Bloco ${q.blocoNumero}` : 'No Escopo'}
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/80 text-amber-300 font-semibold shrink-0" title={q.motivoForaEscopo || 'Matéria alheia ao edital'}>
                                Fora do Edital
                              </span>
                            )}

                            <span className="text-xs text-slate-300 truncate">
                              {q.disciplina || 'Geral'} · <strong className="font-medium text-slate-200">{q.assunto || 'Tema'}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono text-blue-400 tabular-nums">
                            Gabarito: {String.fromCharCode(65 + q.correta)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuestaoAbertaIndex(estaAberta ? null : idx)}
                            className="p-1 text-slate-400 hover:text-slate-200"
                          >
                            {estaAberta ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {estaAberta && (
                        <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-3 bg-slate-900/30">
                          {/* Banner de aviso se for fora do escopo */}
                          {!estaNoEscopo && (
                            <div className="p-2.5 bg-amber-950/30 border border-amber-800/50 rounded-lg flex items-center justify-between gap-2 text-xs text-amber-200">
                              <span className="flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>{q.motivoForaEscopo || 'Esta matéria não faz parte do edital deste concurso e não será salva no acervo.'}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleDesconsiderar(idx)}
                                className="text-[11px] underline text-amber-300 hover:text-amber-100 cursor-pointer"
                              >
                                {estaDesconsiderada ? 'Incluir mesmo assim' : 'Desconsiderar'}
                              </button>
                            </div>
                          )}

                          {/* Seletor Rápido de Assunto Oficial do Edital */}
                          <div className="pt-2">
                            <label className="text-[11px] font-semibold text-blue-400 flex items-center gap-1 mb-1">
                              <span>Vincular ao Catálogo Oficial do Edital (34 Assuntos da Banca):</span>
                            </label>
                            <select
                              value={q.codigoPdf || ''}
                              onChange={(e) => handleVincularAssuntoOficial(idx, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700/80 rounded text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                              <option value="">-- Selecione para vincular diretamente ao escopo oficial --</option>
                              {catalogoOficial.map((cat) => (
                                <option key={cat.codigo} value={cat.codigo}>
                                  [{cat.codigo}] Bloco {cat.blocoNumero}: {cat.nome}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Disciplina & Assunto Inputs Customizados */}
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">
                                Disciplina / Bloco
                              </label>
                              <input
                                type="text"
                                value={q.disciplina || ''}
                                onChange={(e) =>
                                  handleAlterarCampo(idx, 'disciplina', e.target.value)
                                }
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">
                                Assunto / Tema
                              </label>
                              <input
                                type="text"
                                value={q.assunto || ''}
                                onChange={(e) =>
                                  handleAlterarCampo(idx, 'assunto', e.target.value)
                                }
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200"
                              />
                            </div>
                          </div>

                          {/* Enunciado */}
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">
                              Enunciado
                            </label>
                            <textarea
                              value={q.enunciado}
                              onChange={(e) =>
                                handleAlterarCampo(idx, 'enunciado', e.target.value)
                              }
                              rows={3}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 resize-none font-sans"
                            />
                          </div>

                          {/* Alternativas & Gabarito selector */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] text-slate-400 block mb-1">
                              Alternativas (Clique na letra para definir o Gabarito Oficial):
                            </label>
                            {q.alternativas.map((alt, aIdx) => {
                              const ehCorreta = q.correta === aIdx;
                              const letra = String.fromCharCode(65 + aIdx);

                              return (
                                <div
                                  key={aIdx}
                                  onClick={() => handleAlterarCorreta(idx, aIdx)}
                                  className={`flex items-start gap-2.5 p-2 rounded cursor-pointer border transition-colors ${
                                    ehCorreta
                                      ? 'bg-blue-500/10 border-blue-500/40 text-blue-200'
                                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`w-5 h-5 rounded flex items-center justify-center text-xs font-mono font-medium shrink-0 ${
                                      ehCorreta
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {letra}
                                  </span>
                                  <span className="text-xs leading-relaxed">{alt}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Comentário */}
                          {q.comentario && (
                            <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-xs text-slate-400">
                              <span className="font-semibold text-slate-300 block mb-0.5">
                                Comentário Justificativo:
                              </span>
                              {q.comentario}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancelar
          </button>

          {etapa === 'upload' ? (
            <button
              onClick={handleExtrair}
              disabled={carregando || !arquivo}
              className="flex items-center gap-2 px-5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {carregando ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <BookOpen className="w-3.5 h-3.5" />
                  Extrair e Revisar Questões
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSalvarDefinitivo}
              disabled={questoesEfetivasParaSalvar.length === 0}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Prova no Acervo ({questoesEfetivasParaSalvar.length} Questões Válidas)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
