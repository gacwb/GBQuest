import React, { useState, useRef, useEffect, useMemo } from 'react';

export interface GrupoBlocoItem {
  key: string;
  blocoNome: string;
  materiaNome: string;
  totalQuestoes: number;
}

export interface GrupoBloco {
  blocoNome: string;
  totalQuestoes: number;
  materias: GrupoBlocoItem[];
}

interface FiltroHierarquicoBlocosProps {
  tituloDropdown?: string;
  grupos: GrupoBloco[];
  blocosSelecionados: string[];
  materiasSelecionadas: string[];
  onToggleBloco: (blocoNome: string) => void;
  onToggleMateria: (blocoNome: string, materiaKey: string) => void;
  onMarcarTodas: () => void;
  onDesmarcarTodas: () => void;
  className?: string;
}

export const FiltroHierarquicoBlocos: React.FC<FiltroHierarquicoBlocosProps> = ({
  tituloDropdown = 'Filtro de Matérias',
  grupos,
  blocosSelecionados,
  materiasSelecionadas,
  onToggleBloco,
  onToggleMateria,
  onMarcarTodas,
  onDesmarcarTodas,
  className = '',
}) => {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalItens = useMemo(() => {
    let count = 0;
    grupos.forEach((g) => {
      if (g.materias.length > 0) count += g.materias.length;
      else count += 1;
    });
    return count;
  }, [grupos]);

  const totalItensSelecionados = useMemo(() => {
    let count = 0;
    grupos.forEach((g) => {
      if (g.materias.length > 0) {
        g.materias.forEach((m) => {
          if (materiasSelecionadas.includes(m.key)) count++;
        });
      } else {
        if (blocosSelecionados.includes(g.blocoNome)) count++;
      }
    });
    return count;
  }, [grupos, blocosSelecionados, materiasSelecionadas]);

  const todosItensSelecionados = totalItens > 0 && totalItensSelecionados === totalItens;

  const gruposFiltrados = useMemo(() => {
    if (!busca.trim()) return grupos;
    const termo = busca.trim().toLowerCase();
    return grupos
      .map((g) => {
        const blocoMatch = g.blocoNome.toLowerCase().includes(termo);
        const materiasFiltradas = g.materias.filter((m) => m.materiaNome.toLowerCase().includes(termo));
        if (blocoMatch) return g;
        if (materiasFiltradas.length > 0) {
          return {
            ...g,
            materias: materiasFiltradas,
          };
        }
        return null;
      })
      .filter((g): g is GrupoBloco => g !== null);
  }, [grupos, busca]);

  const isBlocoMarcado = (blocoNome: string) => blocosSelecionados.includes(blocoNome);
  const isMateriaMarcada = (key: string) => materiasSelecionadas.includes(key);

  const getTextoBotao = () => {
    if (totalItens === 0) return 'Nenhum bloco/matéria';
    if (todosItensSelecionados) return `Todos os Blocos (${totalItens})`;
    if (totalItensSelecionados === 0) return 'Nenhuma selecionada (0)';
    if (totalItensSelecionados === 1) {
      const g = grupos.find(
        (grupo) => grupo.materias.some((m) => isMateriaMarcada(m.key)) || isBlocoMarcado(grupo.blocoNome)
      );
      return g?.blocoNome || '1 selecionada';
    }
    return `${totalItensSelecionados} de ${totalItens} selecionadas`;
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Botão de Disparo */}
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="input-field text-sm w-full flex items-center justify-between text-left cursor-pointer hover:border-blue-500/80 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 py-2.5 shadow-sm"
        aria-expanded={aberto}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          <i className="fa-solid fa-layer-group text-blue-400 text-xs shrink-0"></i>
          <span className="truncate text-gray-200">{getTextoBotao()}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 font-semibold">
            {totalItensSelecionados}/{totalItens}
          </span>
          <i
            className={`fa-solid fa-chevron-down text-xs text-gray-400 transition-transform duration-200 ${
              aberto ? 'rotate-180 text-blue-400' : ''
            }`}
          ></i>
        </div>
      </button>

      {/* Painel Flutuante do Dropdown */}
      {aberto && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[300px] sm:min-w-[360px] z-50 bg-[#0d1424] border border-[#23324d] rounded-xl shadow-2xl p-3 text-sm animate-fadeIn flex flex-col space-y-2.5 max-h-[380px]">
          {/* Cabeçalho com Ações Rápidas */}
          <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
            <div className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
              <i className="fa-solid fa-filter text-amber-400 text-[11px]"></i>
              <span>{tituloDropdown}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={onMarcarTodas}
                className="text-blue-400 hover:text-blue-300 hover:underline font-medium cursor-pointer"
              >
                Marcar Todas
              </button>
              <span className="text-gray-600">|</span>
              <button
                type="button"
                onClick={onDesmarcarTodas}
                className="text-gray-400 hover:text-rose-400 hover:underline font-medium cursor-pointer"
              >
                Desmarcar Todas
              </button>
            </div>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar bloco ou matéria..."
              className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg pl-7 pr-7 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {/* Lista com Checkboxes */}
          <div className="overflow-y-auto pr-1 space-y-2 max-h-[250px] custom-scrollbar">
            {gruposFiltrados.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400">
                Nenhum bloco ou matéria encontrado.
              </div>
            ) : (
              gruposFiltrados.map((grupo) => {
                const blocoMarcado = isBlocoMarcado(grupo.blocoNome);
                const temMaterias = grupo.materias.length > 0;

                return (
                  <div
                    key={grupo.blocoNome}
                    className="bg-[#090e1a]/90 border border-[#1b263b] rounded-lg p-2 space-y-1.5 transition-colors hover:border-[#2a3c5d]"
                  >
                    {/* Linha do Bloco */}
                    <label className="flex items-center justify-between cursor-pointer group select-none">
                      <div className="flex items-center space-x-2.5 truncate">
                        <input
                          type="checkbox"
                          checked={blocoMarcado}
                          onChange={() => onToggleBloco(grupo.blocoNome)}
                          className="w-4 h-4 rounded text-blue-600 bg-[#0f172a] border-gray-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="font-semibold text-white text-xs truncate group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                          <i className="fa-solid fa-cubes text-blue-400 text-[11px]"></i>
                          {grupo.blocoNome}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono bg-[#141d2e] px-1.5 py-0.5 rounded border border-[#23324d] shrink-0 ml-2">
                        {temMaterias ? `${grupo.materias.length} mat.` : `${grupo.totalQuestoes} q.`}
                      </span>
                    </label>

                    {/* Sub-itens: Matérias individuais sob o Bloco */}
                    {temMaterias && (
                      <div className="pl-5 border-l-2 border-[#1e293b] ml-2 space-y-1 pt-1">
                        {grupo.materias.map((mat) => {
                          const matMarcada = isMateriaMarcada(mat.key);
                          return (
                            <label
                              key={mat.key}
                              className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded hover:bg-[#131d31] transition-colors select-none group"
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <input
                                  type="checkbox"
                                  checked={matMarcada}
                                  onChange={() => onToggleMateria(grupo.blocoNome, mat.key)}
                                  className="w-3.5 h-3.5 rounded text-amber-500 bg-[#0a0f1d] border-gray-600 focus:ring-amber-500 cursor-pointer"
                                />
                                <span
                                  className={`text-xs truncate transition-colors ${
                                    matMarcada ? 'text-gray-200 group-hover:text-white' : 'text-gray-500 line-through'
                                  }`}
                                >
                                  <i className="fa-solid fa-book-bookmark text-amber-400 text-[10px] mr-1.5"></i>
                                  {mat.materiaNome}
                                </span>
                              </div>
                              {mat.totalQuestoes > 0 && (
                                <span className="text-[10px] text-gray-500 font-mono shrink-0 ml-2">
                                  {mat.totalQuestoes} q.
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Rodapé informativo */}
          <div className="pt-1.5 border-t border-[#1e293b] flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <i className="fa-solid fa-circle-check text-[10px]"></i> Pré-selecionadas por padrão
            </span>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="text-xs text-blue-400 hover:text-white font-medium cursor-pointer"
            >
              Pronto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
