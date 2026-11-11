import React, { useState, useEffect, useMemo } from 'react';
import { Questao } from '../types';
import { BLOCOS_CANONICOS_EAP, LISTA_34_MATERIAS_CANONICAS } from '../utils/recategorizadorEap';
import { TABELA_PDFS_ESTUDO, ItemPdfEstudo } from '../utils/simuladoPonderado';
import { obterMateriasDoBloco } from '../utils/reclassificarQuestaoEap';

interface ModalReclassificarQuestaoEapProps {
  isOpen: boolean;
  questao: Questao | null;
  onClose: () => void;
  onSalvar: (novoBloco: string, novoAssunto: string, novoCargo?: string) => Promise<void> | void;
}

export const ModalReclassificarQuestaoEap: React.FC<ModalReclassificarQuestaoEapProps> = ({
  isOpen,
  questao,
  onClose,
  onSalvar,
}) => {
  const [blocoSelecionado, setBlocoSelecionado] = useState<string>('');
  const [assuntoSelecionado, setAssuntoSelecionado] = useState<string>('');
  const [cargoEditado, setCargoEditado] = useState<string>('');
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [salvando, setSalvando] = useState<boolean>(false);
  const [sucesso, setSucesso] = useState<boolean>(false);

  // Inicializa a seleção com os dados atuais da questão ao abrir
  useEffect(() => {
    if (questao && isOpen) {
      setBlocoSelecionado(questao.disciplina || BLOCOS_CANONICOS_EAP[1]);
      setAssuntoSelecionado(questao.assunto || '');
      setCargoEditado(questao.cargo || '');
      setTermoBusca('');
      setSalvando(false);
      setSucesso(false);
    }
  }, [questao, isOpen]);

  // Tecla Escape para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !salvando) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, salvando, onClose]);

  // Lista de matérias do bloco ativo
  const materiasDoBlocoAtivo = useMemo(() => {
    if (!blocoSelecionado) return [];
    return obterMateriasDoBloco(blocoSelecionado);
  }, [blocoSelecionado]);

  // Se o usuário digitou uma busca, filtra em todas as 34 matérias
  const materiasFiltradasPorBusca = useMemo(() => {
    const termo = termoBusca.trim().toLowerCase();
    if (!termo) return null;

    return TABELA_PDFS_ESTUDO.filter((p) => {
      const matchNome = p.nome.toLowerCase().includes(termo);
      const matchCod = p.codigo.toLowerCase().includes(termo);
      const matchBloco = p.blocoNome.toLowerCase().includes(termo);
      const matchTopicos = (p.topicosFundamentais || []).some((t) =>
        t.toLowerCase().includes(termo)
      );
      return matchNome || matchCod || matchBloco || matchTopicos;
    });
  }, [termoBusca]);

  if (!isOpen || !questao) return null;

  const handleSelecionarMateria = (item: ItemPdfEstudo) => {
    setBlocoSelecionado(item.blocoNome);
    setAssuntoSelecionado(item.nome);
  };

  const handleSalvar = async () => {
    if (!blocoSelecionado || !assuntoSelecionado || salvando) return;
    setSalvando(true);
    try {
      await onSalvar(blocoSelecionado, assuntoSelecionado, cargoEditado.trim() || undefined);
      setSucesso(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (e) {
      console.error('Erro ao salvar classificação:', e);
      setSalvando(false);
    }
  };

  const houveAlteracao =
    blocoSelecionado !== questao.disciplina ||
    assuntoSelecionado !== questao.assunto ||
    cargoEditado.trim() !== (questao.cargo || '').trim();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !salvando) onClose();
      }}
    >
      <div
        className="w-full max-w-xl bg-[#0d1322] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-eap-title"
      >
        {/* Cabeçalho */}
        <div className="bg-[#11192d] border-b border-[#1e293b] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <i className="fa-solid fa-sitemap text-sm"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="modal-eap-title" className="text-sm font-semibold text-white">
                  Classificar Questão no EAP
                </h3>
                <span className="text-[11px] font-mono text-blue-400 bg-blue-950/80 border border-blue-800/60 px-1.5 py-0.2 rounded">
                  #{questao.id}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Selecione manualmente o Bloco e a Matéria da FAFIPA
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
            title="Fechar (Esc)"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Preview do Enunciado */}
          <div className="bg-[#090e1a] border border-[#1a2333] rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-semibold text-gray-300">Enunciado da Questão:</span>
              <span className="text-blue-400/80 font-mono text-[10px]">{questao.banca || 'FAFIPA'}</span>
            </div>
            <p className="text-gray-300 text-xs line-clamp-2 italic leading-relaxed">
              "{questao.enunciado}"
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-gray-500">Atual:</span>
              <span className="bg-[#19243d] text-gray-300 px-2 py-0.5 rounded border border-[#2563eb]/30">
                📚 {questao.disciplina || '(Sem bloco)'}
              </span>
              <span className="bg-[#121727] text-gray-300 px-2 py-0.5 rounded border border-emerald-800/40">
                📜 {questao.assunto || '(Sem matéria)'}
              </span>
            </div>
          </div>

          {/* Busca Rápida */}
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-gray-500 text-xs"></i>
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Buscar assunto ou código (ex: 207, licitação, concreto, solos...)"
              className="w-full pl-8 pr-8 py-2 bg-[#090e1a] border border-[#1e293b] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {termoBusca && (
              <button
                type="button"
                onClick={() => setTermoBusca('')}
                className="absolute right-2.5 top-2.5 text-gray-500 hover:text-white"
              >
                <i className="fa-solid fa-circle-xmark text-xs"></i>
              </button>
            )}
          </div>

          {/* Se estiver buscando, mostra lista global de matérias filtradas */}
          {materiasFiltradasPorBusca !== null ? (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-gray-400 flex items-center justify-between">
                <span>Resultados da busca ({materiasFiltradasPorBusca.length}):</span>
                <span className="text-blue-400 font-normal">Clique para selecionar</span>
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                {materiasFiltradasPorBusca.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 bg-[#090e1a] rounded-lg border border-[#1a2333]">
                    Nenhum assunto encontrado para "{termoBusca}".
                  </div>
                ) : (
                  materiasFiltradasPorBusca.map((item) => {
                    const isSelected = assuntoSelecionado === item.nome;
                    return (
                      <button
                        key={item.codigo}
                        type="button"
                        onClick={() => handleSelecionarMateria(item)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-blue-950/60 border-blue-500 text-white shadow-md'
                            : 'bg-[#090e1a] hover:bg-[#121a2d] border-[#1a2333] text-gray-300'
                        }`}
                      >
                        <span className="bg-blue-900/60 text-blue-300 border border-blue-700/50 text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0">
                          {item.codigo}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs truncate">{item.nome}</div>
                          <div className="text-[10px] text-gray-400 truncate">{item.blocoNome}</div>
                        </div>
                        {isSelected && (
                          <i className="fa-solid fa-circle-check text-blue-400 mt-1 shrink-0"></i>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Passo 1: Seleção de Bloco (7 Blocos) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Selecione o Bloco (7 Blocos Oficiais FAFIPA):</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {BLOCOS_CANONICOS_EAP.map((blocoNome, idx) => {
                    const numBloco = idx + 1;
                    const isSelected = blocoSelecionado === blocoNome;
                    // Resumo curto do nome do bloco para o botão
                    const partes = blocoNome.split('—');
                    const tituloCurto = partes.length > 1 ? partes[1].trim() : blocoNome;

                    return (
                      <button
                        key={blocoNome}
                        type="button"
                        onClick={() => {
                          setBlocoSelecionado(blocoNome);
                          // Se a matéria atualmente selecionada não pertencer a este bloco, reseta
                          const mats = obterMateriasDoBloco(blocoNome);
                          if (!mats.some((m) => m.nome === assuntoSelecionado)) {
                            setAssuntoSelecionado(mats[0]?.nome || '');
                          }
                        }}
                        className={`text-left p-2 rounded-lg border transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-blue-950/60 border-blue-500 text-white font-medium shadow-sm ring-1 ring-blue-500/50'
                            : 'bg-[#090e1a] hover:bg-[#121a2d] border-[#1a2333] text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : 'bg-[#1e293b] text-gray-400'
                            }`}
                          >
                            {numBloco}
                          </span>
                          <span className="truncate text-[11px]">{tituloCurto}</span>
                        </div>
                        {isSelected && (
                          <i className="fa-solid fa-check text-blue-400 text-xs shrink-0 ml-1"></i>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Passo 2: Seleção de Matéria dentro do Bloco */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-gray-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>Selecione a Matéria / Assunto:</span>
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {materiasDoBlocoAtivo.length} matérias disponíveis
                  </span>
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {materiasDoBlocoAtivo.map((item) => {
                    const isSelected = assuntoSelecionado === item.nome;
                    return (
                      <button
                        key={item.codigo}
                        type="button"
                        onClick={() => setAssuntoSelecionado(item.nome)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                            : 'bg-[#090e1a] hover:bg-[#121a2d] border-[#1a2333] text-gray-300'
                        }`}
                      >
                        <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0">
                          {item.codigo}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs truncate">{item.nome}</div>
                          {item.topicosFundamentais && item.topicosFundamentais.length > 0 && (
                            <div className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                              {item.topicosFundamentais.slice(0, 2).join(' • ')}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <i className="fa-solid fa-circle-check text-emerald-400 mt-1 shrink-0"></i>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Campo Opcional de Cargo */}
          <div className="space-y-1 pt-1 border-t border-[#1e293b]">
            <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5">
              <i className="fa-solid fa-briefcase text-[10px] text-amber-400"></i>
              <span>Cargo (Opcional):</span>
            </label>
            <input
              type="text"
              value={cargoEditado}
              onChange={(e) => setCargoEditado(e.target.value)}
              placeholder="Ex: Engenheiro Civil, Engenheiro fiscal..."
              className="w-full px-3 py-1.5 bg-[#090e1a] border border-[#1e293b] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          {/* Resumo da Nova Classificação */}
          <div className="bg-[#131c31] border border-[#1e2e4e] rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block mb-0.5">
                Nova Classificação Selecionada:
              </span>
              <div className="text-xs text-white font-medium truncate">
                {blocoSelecionado ? blocoSelecionado.split('—')[0].trim() : 'Nenhum'} ➔{' '}
                <span className="text-emerald-300 font-bold">{assuntoSelecionado || 'Selecione a matéria'}</span>
              </div>
            </div>
            {houveAlteracao && (
              <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded font-mono shrink-0">
                Modificado
              </span>
            )}
          </div>
        </div>

        {/* Rodapé / Ações */}
        <div className="bg-[#11192d] border-t border-[#1e293b] px-5 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="px-3.5 py-1.5 rounded-lg border border-[#1e293b] text-gray-300 hover:text-white hover:bg-slate-800/60 text-xs transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSalvar}
            disabled={!blocoSelecionado || !assuntoSelecionado || salvando || !houveAlteracao}
            className="btn-primary text-xs flex items-center gap-2 px-4 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          >
            {salvando ? (
              <>
                <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                <span>Salvando no Banco...</span>
              </>
            ) : sucesso ? (
              <>
                <i className="fa-solid fa-check text-xs"></i>
                <span>Salvo com Sucesso!</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk text-xs"></i>
                <span>Salvar no Banco de Dados</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
