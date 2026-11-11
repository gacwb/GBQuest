import React, { useState } from 'react';

export interface PontoDesempenhoDiario {
  chave: string; // 'DD/MM/AAAA'
  label: string; // 'DD/MM'
  acertos: number;
  erros: number;
  totalQuestoes: number;
  taxaAcerto: number; // 0 a 100
}

interface GraficoEvolucaoDesempenhoProps {
  dados: PontoDesempenhoDiario[];
  titulo?: string;
  subtitulo?: string;
  badge?: string;
  labelAcertos?: string;
  labelErros?: string;
  labelTaxa?: string;
}

export const GraficoEvolucaoDesempenho: React.FC<GraficoEvolucaoDesempenhoProps> = ({
  dados,
  titulo = 'Evolução de acertos e erros por dia',
  subtitulo = 'Colunas (volume diário) com linha sobreposta de assertividade (0-100%).',
  badge = 'Eixo Duplo',
  labelAcertos = 'Acertos',
  labelErros = 'Erros',
  labelTaxa = 'Taxa de Acerto (%)',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Dimensões do canvas SVG
  const svgWidth = 640;
  const svgHeight = 250;
  const padLeft = 42; // Eixo Y Principal (Esquerdo - Volume)
  const padRight = 44; // Eixo Y Secundário (Direito - % Taxa)
  const padTop = 24;
  const padBottom = 38;

  const chartX = padLeft;
  const chartY = padTop;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;
  const chartBottom = chartY + chartH;

  // Cálculo da escala do Eixo Y Principal (Volume bruto diário)
  const maiorVolume = Math.max(
    ...dados.map((d) => Math.max(d.acertos, d.erros)),
    4
  );
  // Arredonda para um teto estético agradável
  const tetoVolume = maiorVolume <= 5 ? 5 : maiorVolume <= 10 ? 10 : Math.ceil(maiorVolume / 4) * 4;

  // 5 Linhas de grade horizontais correspondentes ao Eixo Principal (0%, 25%, 50%, 75%, 100%)
  const passosGrade = [0, 0.25, 0.5, 0.75, 1];

  const totalDias = Math.max(dados.length, 1);
  const slotWidth = chartW / totalDias;

  // Coordenadas calculadas para as barras e pontos da linha
  const pontosCalculados = dados.map((d, i) => {
    const slotCenterX = chartX + (i + 0.5) * slotWidth;

    // Dimensões das colunas agrupadas
    const barWidth = Math.max(7, Math.min(22, slotWidth * 0.34));
    const gap = Math.max(2, Math.min(6, barWidth * 0.2));

    const hAcertos = tetoVolume > 0 ? (d.acertos / tetoVolume) * chartH : 0;
    const yAcertos = chartBottom - hAcertos;
    const xAcertos = slotCenterX - barWidth - gap / 2;

    const hErros = tetoVolume > 0 ? (d.erros / tetoVolume) * chartH : 0;
    const yErros = chartBottom - hErros;
    const xErros = slotCenterX + gap / 2;

    // Coordenada Y da linha (Eixo Secundário com escala fixa de 0 a 100%)
    const yTaxa = chartBottom - (Math.min(100, Math.max(0, d.taxaAcerto)) / 100) * chartH;

    return {
      ...d,
      slotCenterX,
      slotLeft: chartX + i * slotWidth,
      barWidth,
      xAcertos,
      yAcertos,
      hAcertos,
      xErros,
      yErros,
      hErros,
      xTaxa: slotCenterX,
      yTaxa,
    };
  });

  // Caminho SVG da linha da taxa de acerto
  const caminhoLinhaTaxa =
    pontosCalculados.length > 0
      ? `M ${pontosCalculados.map((p) => `${p.xTaxa},${p.yTaxa}`).join(' L ')}`
      : '';

  const pontoAtivo = hoverIndex !== null && pontosCalculados[hoverIndex] ? pontosCalculados[hoverIndex] : null;

  return (
    <div className="relative w-full select-none">
      {/* Cabeçalho do Gráfico com Título e Legenda Clara */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">{titulo}</h3>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/60 text-blue-300">
              {badge}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {subtitulo}
          </p>
        </div>

        {/* Legenda Clara: Acertos/Recuperadas, Erros/Reincidentes e Taxa (%) */}
        <div className="flex items-center flex-wrap gap-3.5 text-xs">
          <span className="flex items-center gap-1.5 text-gray-300" title={`Eixo esquerdo: total de ${labelAcertos.toLowerCase()} diários`}>
            <span className="w-3 h-3 rounded-sm bg-green-500 shadow-sm inline-block"></span>
            <span>{labelAcertos}</span>
          </span>
          <span className="flex items-center gap-1.5 text-gray-300" title={`Eixo esquerdo: total de ${labelErros.toLowerCase()} diários`}>
            <span className="w-3 h-3 rounded-sm bg-red-500 shadow-sm inline-block"></span>
            <span>{labelErros}</span>
          </span>
          <span
            className="flex items-center gap-1.5 text-amber-300 font-medium"
            title={`Eixo direito: ${labelTaxa} (escala fixa 0-100%)`}
          >
            <span className="relative flex items-center justify-center w-4 h-3">
              <span className="w-4 h-0.5 bg-yellow-400 rounded-full inline-block"></span>
              <span className="absolute w-2 h-2 rounded-full bg-yellow-400 border border-[#131b2e]"></span>
            </span>
            <span>{labelTaxa}</span>
          </span>
        </div>
      </div>

      {/* Área do Gráfico */}
      <div className="relative w-full overflow-hidden pt-2">
        <svg
          className="w-full h-auto overflow-visible"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Definições de gradiente e sombra para estética premium */}
          <defs>
            <linearGradient id="gradientAcerto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="gradientErro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.85" />
            </linearGradient>
            <filter id="glowTaxa" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#eab308" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Grade de fundo horizontal apenas no eixo principal */}
          {passosGrade.map((ratio, idx) => {
            const y = chartBottom - ratio * chartH;
            const valorEsquerdo = Math.round(ratio * tetoVolume);
            const valorDireito = `${Math.round(ratio * 100)}%`;

            return (
              <g key={idx}>
                {/* Linha tracejada da grade */}
                <line
                  x1={chartX}
                  y1={y}
                  x2={chartX + chartW}
                  y2={y}
                  stroke={idx === 0 ? '#334155' : '#1e293b'}
                  strokeDasharray={idx === 0 ? 'none' : '3 3'}
                  strokeWidth="1"
                />

                {/* Eixo Y Principal (Esquerdo - Volume de Questões) */}
                <text
                  x={chartX - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {valorEsquerdo}
                </text>

                {/* Eixo Y Secundário (Direito - Taxa de Acerto com escala fixa 0 a 100%) */}
                <text
                  x={chartX + chartW + 8}
                  y={y + 3.5}
                  textAnchor="start"
                  fill="#eab308"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {valorDireito}
                </text>
              </g>
            );
          })}

          {/* Destaque sutil da coluna ativa em hover */}
          {hoverIndex !== null && pontosCalculados[hoverIndex] && (
            <g>
              <rect
                x={pontosCalculados[hoverIndex].slotLeft}
                y={chartY}
                width={slotWidth}
                height={chartH}
                fill="rgba(255, 255, 255, 0.04)"
                rx="4"
              />
              <line
                x1={pontosCalculados[hoverIndex].slotCenterX}
                y1={chartY}
                x2={pontosCalculados[hoverIndex].slotCenterX}
                y2={chartBottom}
                stroke="#eab308"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.6"
              />
            </g>
          )}

          {/* 1. Colunas Agrupadas (Acertos & Erros) */}
          {pontosCalculados.map((p, idx) => {
            const isHovered = hoverIndex === idx;
            const opacidade = hoverIndex === null || isHovered ? 1 : 0.65;

            return (
              <g key={idx} opacity={opacidade} className="transition-opacity duration-150">
                {/* Coluna de Acertos (Verde) */}
                {p.hAcertos > 0 && (
                  <rect
                    x={p.xAcertos}
                    y={p.yAcertos}
                    width={p.barWidth}
                    height={p.hAcertos}
                    fill="url(#gradientAcerto)"
                    rx="3"
                    className="transition-all duration-200"
                  />
                )}

                {/* Coluna de Erros (Vermelha) */}
                {p.hErros > 0 && (
                  <rect
                    x={p.xErros}
                    y={p.yErros}
                    width={p.barWidth}
                    height={p.hErros}
                    fill="url(#gradientErro)"
                    rx="3"
                    className="transition-all duration-200"
                  />
                )}
              </g>
            );
          })}

          {/* 2. Eixo Y Secundário: Linha sobreposta da Taxa de Acerto (%) */}
          {caminhoLinhaTaxa && (
            <path
              d={caminhoLinhaTaxa}
              fill="none"
              stroke="#eab308"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowTaxa)"
            />
          )}

          {/* Marcadores circulares da linha da Taxa de Acerto */}
          {pontosCalculados.map((p, idx) => {
            const isHovered = hoverIndex === idx;

            return (
              <g key={idx}>
                <circle
                  cx={p.xTaxa}
                  cy={p.yTaxa}
                  r={isHovered ? 6 : 3.5}
                  fill="#eab308"
                  stroke="#0b1329"
                  strokeWidth={isHovered ? 2.5 : 2}
                  className="transition-all duration-150"
                />
                {isHovered && (
                  <circle
                    cx={p.xTaxa}
                    cy={p.yTaxa}
                    r={9}
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="1"
                    opacity="0.7"
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}

          {/* Eixo X: Rótulos das Datas (formato DD/MM) */}
          {pontosCalculados.map((p, idx) => {
            const isHovered = hoverIndex === idx;
            return (
              <text
                key={idx}
                x={p.slotCenterX}
                y={chartBottom + 18}
                textAnchor="middle"
                fill={isHovered ? '#f8fafc' : '#94a3b8'}
                fontSize="11"
                fontWeight={isHovered ? '700' : '500'}
                fontFamily="sans-serif"
                className="transition-colors duration-150"
              >
                {p.label}
              </text>
            );
          })}

          {/* Zonas transparentes de captura de mouse por coluna para acionamento do Tooltip */}
          {pontosCalculados.map((p, idx) => (
            <rect
              key={idx}
              x={p.slotLeft}
              y={chartY}
              width={slotWidth}
              height={chartH + padBottom}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}
        </svg>

        {/* Tooltip Interativo Flutuante com os Valores Exatos ao Passar o Mouse */}
        {pontoAtivo && (
          <div
            className={`absolute z-30 pointer-events-none transition-all duration-150 ease-out ${
              pontoAtivo.slotCenterX < 130
                ? 'translate-x-2'
                : pontoAtivo.slotCenterX > svgWidth - 130
                ? '-translate-x-[calc(100%-8px)]'
                : '-translate-x-1/2'
            }`}
            style={{
              left: `${(pontoAtivo.slotCenterX / svgWidth) * 100}%`,
              top: '8px',
            }}
          >
            <div className="bg-[#0b1222]/95 backdrop-blur-md border border-amber-500/40 rounded-xl shadow-2xl p-3 text-xs min-w-[190px]">
              {/* Data do dia */}
              <div className="flex items-center justify-between pb-1.5 border-b border-[#1e293b] mb-2 font-mono">
                <span className="text-gray-400 flex items-center gap-1">
                  <i className="fa-regular fa-calendar text-blue-400 text-[11px]"></i>
                  {pontoAtivo.chave || pontoAtivo.label}
                </span>
                <span className="font-bold text-amber-400 bg-amber-950/80 border border-amber-700/60 px-1.5 py-0.5 rounded text-[10px]">
                  {pontoAtivo.taxaAcerto}%
                </span>
              </div>

              {/* Valores Detalhados */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-green-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block"></span>
                    {labelAcertos}:
                  </span>
                  <span className="font-mono font-bold text-green-400">
                    {pontoAtivo.acertos}{' '}
                    <span className="text-[10px] text-gray-400 font-normal">
                      ({pontoAtivo.totalQuestoes > 0 ? Math.round((pontoAtivo.acertos / pontoAtivo.totalQuestoes) * 100) : 0}%)
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-red-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block"></span>
                    {labelErros}:
                  </span>
                  <span className="font-mono font-bold text-red-400">
                    {pontoAtivo.erros}{' '}
                    <span className="text-[10px] text-gray-400 font-normal">
                      ({pontoAtivo.totalQuestoes > 0 ? Math.round((pontoAtivo.erros / pontoAtivo.totalQuestoes) * 100) : 0}%)
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#1e293b]/70">
                  <span className="text-gray-400 flex items-center gap-1">
                    <i className="fa-solid fa-list-check text-[10px] text-gray-500"></i> Total resolvidas:
                  </span>
                  <span className="font-mono font-bold text-white">{pontoAtivo.totalQuestoes}</span>
                </div>

                <div className="flex items-center justify-between bg-yellow-950/40 border border-yellow-800/40 rounded px-1.5 py-1 text-yellow-300 font-medium">
                  <span className="flex items-center gap-1 text-[11px]">
                    <i className="fa-solid fa-percent text-[10px]"></i> {labelTaxa}:
                  </span>
                  <span className="font-mono font-bold">{pontoAtivo.taxaAcerto}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
