import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Banca,
  Bloco,
  Materia,
  Questao,
  SessaoCriada,
  HistoricoRespostasMap,
  TentativaResposta,
  UserProfile,
  RegistroTempoSessao,
} from './types';
import {
  carregarBancas,
  salvarBancaDb,
  atualizarBancaDb,
  excluirBancaDb,
  carregarBlocos,
  salvarBlocoDb,
  atualizarBlocoDb,
  excluirBlocoDb,
  carregarMaterias,
  salvarMateriaDb,
  atualizarMateriaDb,
  excluirMateriaDb,
  carregarQuestoes,
  salvarNovasQuestoesDb,
  excluirQuestaoDb,
  atualizarQuestoesDb,
  deduplicarQuestoesDb,
  normalizarEnunciadoParaDeduplicacao,
  carregarSessoes,
  salvarSessaoDb,
  excluirSessaoDb,
  purgarSimuladosTesteDb,
  atualizarSessaoDb,
  carregarHistorico,
  salvarTentativaDb,
  zerarHistoricoDb,
  carregarRegistrosTempoSessoes,
  salvarRegistroTempoSessao,
  getAppConfig,
  migrarDadosLegadosParaAdm,
  syncConfigFromServer,
  substituirNuvemComDadosLocais,
  sincronizacaoBidirecionalIncremental,
  hidratarCacheLocalDoSupabase,
  gerarBackupLocalCompleto,
  executarHardResetHistoricoESessoes,
  detectarHistoricoOuSessoesCorrompidas,
  notificarEnvioCloud,
  zerarTudoDb,
  recategorizarESincronizarAcervoEap,
  atualizarComentarioQuestaoSupabase,
  STORAGE_KEYS,
} from './services/supabaseClient';
import {
  formatarTempoMinutosSegundos,
  formatarTempoHorasMinutos,
  calcularSegundosPorQuestao,
  formatarMinutosPorQuestao,
  calcularQuestoesPorMinuto,
  formatarQuestoesPorMinuto,
  calcularResumoSessao,
  ehUltimaQuestaoRespondida,
  somarTempoSessoes,
  calcularTempoHistoricoQuestoes,
  toggleAlternativaRiscada,
  estaAlternativaRiscada,
  encontrarRegistroTempoSessao,
  obterInfoConclusaoSessao,
  InfoConclusaoSessao,
} from './utils/sessionTimer';
import { idbLimparTudo } from './services/materiaStorage';
import {
  callGeminiGenerateQuestions,
  expandirComentarioQuestao,
  extractTextFromPdf,
  readFileAsBase64,
  readFileAsText,
} from './services/geminiService';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { GraficoEvolucaoDesempenho, PontoDesempenhoDiario } from './components/GraficoEvolucaoDesempenho';
import { FiltroHierarquicoBlocos } from './components/FiltroHierarquicoBlocos';
import { EnunciadoQuestao } from './components/EnunciadoQuestao';
import { sincronizarGrifosComNuvem } from './services/grifosStorage';
import { baixarDocumentoMateria } from './utils/documentDownload';
import { garantirDistribuicaoUniforme } from './utils/gabaritoRandomizer';
import {
  getCurrentUser,
  setCurrentUser as setStorageCurrentUser,
  getOrCreateInitialUser,
  isAdmin,
  logout as authLogout,
  ADMIN_CONFIG,
} from './services/authService';
import {
  gerarCodigoSessaoPadrao,
  gerarCodigoSessaoComContagem,
  obterTipoSessao,
} from './utils/sessionCode';
import {
  obterQuestoesCadernoErros,
  filtrarCadernoPorModo,
  classificarStatusCaderno,
  sanitizarHistoricoTentativasDefensivo,
  obterMetricasCadernoErrosSanitizadas,
  calcularMetricasRecuperacao,
  calcularDiasDesdeUltimaResolucao,
  calcularLimitesPeriodo,
  PERIODO_FILTRO_PADRAO,
  ehTentativaDoCaderno,
  StatusErroCaderno,
  ModoFiltroCaderno,
  QuestaoCadernoInfo,
} from './utils/cadernoErros';
import { calcularTempoTotalTodasQuestoes } from './utils/tempoQuestoes';
import { garantirMapeamentoHistoricoCompleto } from './utils/historicoRecovery';
import {
  calcularDistribuicaoSimuladoPonderado,
  calcularMetricasViewSimulados,
  formatarSegundosEmMinutosPorQuestao,
  METRICAS_PROVA_REAL,
  TABELA_PDFS_ESTUDO,
  ResultadoDistribuicaoSimulado,
} from './utils/simuladoPonderado';
import { ModalConferenciaSimulado } from './components/ModalConferenciaSimulado';
import { PainelSimuladosDesempenho } from './components/PainelSimuladosDesempenho';
import { PainelEapPremissas } from './components/PainelEapPremissas';
import { LoadingSimulado } from './components/LoadingSimulado';
import {
  PERFIL_FAFIPA_CURITIBA,
  balancearGabaritoLoteCompleto,
  estruturarSimuladoOficialOrdenado,
  montarInstrucoesDnaBanca,
  calcularCotasTipologia,
  gerarGradeTipologiasFafipa,
  montarInstrucaoMoldeTipologia,
  classificarTipologiaQuestao,
  TipologiaQuestao,
  gerarGradeDificuldadeFafipa,
  montarInstrucaoMoldeDificuldade,
  classificarDificuldadeQuestao,
  DificuldadeQuestao,
} from './utils/dnaBancaFramework';
import { limparSintaxeLatex } from './utils/latexSanitizer';
import { BotaoFeedbackQuestao } from './components/BotaoFeedbackQuestao';
import { gerarPromptAprendizadoFeedback } from './services/feedbackService';
import {
  TipoChipFiltroBanco,
  aplicarFiltrosMultiplosBanco,
  calcularContagensChipsBanco,
  ehQuestaoSimulado,
  ehQuestaoEmEscala,
  ehQuestaoProvaAnterior,
} from './utils/bancoFiltrosMultiplos';
import { ModalGeradorLoteEscala } from './components/ModalGeradorLoteEscala';
import { ModalUploadProvaPdf } from './components/ModalUploadProvaPdf';
import { TODAS_QUESTOES_PROVAS_FAFIPA_REAIS } from './data/provasFafipaReais';
import {
  sanitizarAcervoQuestoes,
  obterQuestoesProvasAnterioresOficiais,
  ehIdDeProvaAnterior,
  encontrarQuestaoCanonicaProvaAnterior,
  registrarNovasProvasAnteriores,
} from './utils/provasAnterioresRegistry';
import {
  extrairResumoMateriasSessao,
  obterCatalogoAssuntosOficiais,
} from './utils/escopoConcurso';
import {
  migrarESanitizarProvasPassadas,
  formatarTituloVisualProva,
  formatarBadgeMinimalistaProva,
} from './utils/uploadProvaUtils';
import {
  BLOCOS_CANONICOS_EAP,
  LISTA_34_MATERIAS_CANONICAS,
  auditarERecategorizarAcervo,
} from './utils/recategorizadorEap';
import { ModalReclassificarQuestaoEap } from './components/ModalReclassificarQuestaoEap';
import {
  persistirReclassificacaoQuestao,
  reclassificarQuestaoNaLista,
} from './utils/reclassificarQuestaoEap';

export default function App() {
  // Navigation - initial welcome screen is 'desempenho'
  const [activeTab, setActiveTab] = useState<'bancas' | 'upload' | 'sessoes' | 'resolver' | 'desempenho'>('desempenho');
  const [subAbaGeracao, setSubAbaGeracao] = useState<'avulsa' | 'simulado' | 'escala'>('avulsa');
  const [isUploadProvaModalOpen, setIsUploadProvaModalOpen] = useState(false);
  const [questaoParaReclassificar, setQuestaoParaReclassificar] = useState<Questao | null>(null);

  // Authentication & User State (null if first access / unauthenticated)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Cloud & Config Settings Modal (Restricted to ADMIN)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCloudConfigured, setIsCloudConfigured] = useState(false);
  const [cloudSyncState, setCloudSyncState] = useState<{
    status: 'idle' | 'syncing' | 'saved' | 'error';
    message: string;
    time?: string;
  }>({
    status: 'saved',
    message: 'Dados enviados',
    time:
      localStorage.getItem('gb_last_cloud_sync_time') ||
      new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  });

  // App Data
  const [bancas, setBancas] = useState<Banca[]>([]);
  const [blocos, setBlocos] = useState<Bloco[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [sessoesCriadas, setSessoesCriadas] = useState<SessaoCriada[]>([]);
  const [filtroTipoSessao, setFiltroTipoSessao] = useState<'todas' | 'sessao' | 'simulado' | 'prova_anterior' | 'sessao_escala'>('todas');
  const [filtroStatusSessao, setFiltroStatusSessao] = useState<'todos' | 'em_aberto' | 'concluidas'>('todos');
  const [filtroSessaoBusca, setFiltroSessaoBusca] = useState('');
  const [filtroSessaoBloco, setFiltroSessaoBloco] = useState('');
  const [filtroSessaoAssunto, setFiltroSessaoAssunto] = useState('');
  const [sessaoExpandidaMateriasId, setSessaoExpandidaMateriasId] = useState<string | number | null>(null);
  const [isModalLoteEscalaOpen, setIsModalLoteEscalaOpen] = useState(false);
  const [historicoRespostas, setHistoricoRespostas] = useState<HistoricoRespostasMap>({});
  const [loadingData, setLoadingData] = useState(true);
  const [expandindoComentarioId, setExpandindoComentarioId] = useState<string | number | null>(null);

  const handleExpandirComentario = async (q: Questao) => {
    if (!q || !q.enunciado || expandindoComentarioId) return;
    setExpandindoComentarioId(q.id);

    try {
      const novoComentario = await expandirComentarioQuestao({
        enunciado: q.enunciado,
        alternativas: q.alternativas,
        correta: q.correta,
        artigo: q.artigo,
        disciplina: q.disciplina,
        assunto: q.assunto,
        banca: q.banca,
        comentario: q.comentario,
      });

      if (novoComentario) {
        if (sessaoAtiva && Array.isArray(sessaoAtiva.questoesSnap)) {
          const novasQ = sessaoAtiva.questoesSnap.map((item: Questao) =>
            String(item.id) === String(q.id) ? { ...item, comentario: novoComentario } : item
          );
          setSessaoAtiva({ ...sessaoAtiva, questoesSnap: novasQ });
        }

        setQuestoes((prev) =>
          prev.map((item) => (String(item.id) === String(q.id) ? { ...item, comentario: novoComentario } : item))
        );

        await atualizarComentarioQuestaoSupabase(q.id, novoComentario);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao expandir comentário com a IA.');
    } finally {
      setExpandindoComentarioId(null);
    }
  };

  const renderizarGabaritoComentadoComIa = (q: Questao) => {
    const textoLimpo = limparSintaxeLatex(q.comentario || 'Gabarito baseado na legislação.');
    const estaExpandindo = expandindoComentarioId === q.id;

    const linhas = textoLimpo
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    return (
      <div className="space-y-2 pt-1 border-t border-[#1e293b]/80 mt-2">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
          <span className="font-semibold text-[#38bdf8] text-xs flex items-center gap-1.5">
            <i className="fa-solid fa-graduation-cap text-sky-400 text-sm"></i> Gabarito Comentado (A a E)
          </span>
          <button
            type="button"
            onClick={() => handleExpandirComentario(q)}
            disabled={estaExpandindo}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium text-amber-300 hover:text-amber-100 bg-amber-950/40 border border-amber-800/60 hover:bg-amber-900/50 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
            title="Solicitar à IA que gere a análise minuciosa de cada uma das 5 alternativas (A a E)"
          >
            <i className={`fa-solid ${estaExpandindo ? 'fa-spinner fa-spin text-amber-400' : 'fa-wand-magic-sparkles text-amber-400'}`}></i>
            <span>{estaExpandindo ? 'Gerando análise A-E...' : 'Expandir Comentário com IA'}</span>
          </button>
        </div>

        <div className="space-y-1.5 text-xs text-gray-200 leading-relaxed font-normal">
          {linhas.map((linha, idx) => {
            const ehTopicoAlternativa = /^[-*•]?\s*(?:Alternativa\s+[A-E]|Opção\s+[A-E]|[A-E]\))/i.test(linha);
            const ehCorreta = /\[?CORRETA\]?|resposta correta|gabarito/i.test(linha) && ehTopicoAlternativa;

            return (
              <p
                key={idx}
                className={`${
                  ehTopicoAlternativa
                    ? ehCorreta
                      ? 'p-2 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 font-medium'
                      : 'p-2 rounded bg-[#0f172a]/80 border border-slate-800/80 text-gray-200'
                    : ''
                }`}
              >
                {linha}
              </p>
            );
          })}
        </div>
      </div>
    );
  };

  // Estado e controle do Modo Leitura nas Sessões
  const [modoLeituraSessao, setModoLeituraSessao] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gb_modo_leitura_ativo') === 'true';
    } catch {
      return false;
    }
  });

  const alternarModoLeitura = () => {
    setModoLeituraSessao((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('gb_modo_leitura_ativo', String(next));
      } catch {}
      return next;
    });
  };

  // Sub-aba em "1. Definir Premissas": 'bancas' | 'blocos' | 'materias'
  const [premissasTab, setPremissasTab] = useState<'bancas' | 'blocos' | 'materias'>('bancas');
  const [visaoPremissas, setVisaoPremissas] = useState<'eap' | 'classico'>('eap');
  const [progressoSimuladoPct, setProgressoSimuladoPct] = useState<number | undefined>(undefined);

  // Form: Cadastrar Banca
  const [bancaNome, setBancaNome] = useState('');
  const [bancaCargo, setBancaCargo] = useState('');
  const [bancaObs, setBancaObs] = useState('');
  const [bancaArquivosNomes, setBancaArquivosNomes] = useState<string[]>([]);
  const fileInputBancaRef = useRef<HTMLInputElement>(null);
  const processandoRespostaRef = useRef<Set<string>>(new Set());

  // Form: Cadastrar Bloco
  const [blocoNome, setBlocoNome] = useState('');
  const [blocoDescricao, setBlocoDescricao] = useState('');

  // Form: Cadastrar Matéria / Lei
  const [materiaBlocoId, setMateriaBlocoId] = useState<string | number>('');
  const [materiaNome, setMateriaNome] = useState('');
  const [materiaArquivo, setMateriaArquivo] = useState<File | null>(null);
  const [materiaCarregando, setMateriaCarregando] = useState(false);
  const fileInputMateriaRef = useRef<HTMLInputElement>(null);

  // Modais de Edição Minimalistas
  const [bancaEditando, setBancaEditando] = useState<Banca | null>(null);
  const [editBancaNome, setEditBancaNome] = useState('');
  const [editBancaCargo, setEditBancaCargo] = useState('');
  const [editBancaObs, setEditBancaObs] = useState('');

  const [blocoEditando, setBlocoEditando] = useState<Bloco | null>(null);
  const [modalBlocoModo, setModalBlocoModo] = useState<'editar' | 'incluir-materia'>('editar');
  const [editBlocoNome, setEditBlocoNome] = useState('');
  const [editBlocoDescricao, setEditBlocoDescricao] = useState('');
  const [novoMateriaNomeNoBloco, setNovoMateriaNomeNoBloco] = useState('');
  const [novoMateriaArquivoNoBloco, setNovoMateriaArquivoNoBloco] = useState<File | null>(null);
  const [carregandoMateriaNoBloco, setCarregandoMateriaNoBloco] = useState(false);
  const fileInputMateriaNoBlocoRef = useRef<HTMLInputElement>(null);

  const [materiaEditando, setMateriaEditando] = useState<Materia | null>(null);
  const [editMateriaNome, setEditMateriaNome] = useState('');
  const [editMateriaBlocoId, setEditMateriaBlocoId] = useState<string | number>('');

  // Form: Gerar Sessão (Aba 2) - Inicializado com FAFIPA Paramétrico unificado
  const [gerarBanca, setGerarBanca] = useState('FAFIPA Paramétrico');
  const [gerarCargo, setGerarCargo] = useState('Engenheiro Civil');
  const [gerarBlocoId, setGerarBlocoId] = useState<string | number>('');
  const [gerarMateriaId, setGerarMateriaId] = useState<string | number>('');
  const [gerarDisciplina, setGerarDisciplina] = useState('');
  const [gerarAssunto, setGerarAssunto] = useState('');
  const [gerarDirecionamento, setGerarDirecionamento] = useState('');
  const [gerarQtd, setGerarQtd] = useState(10);
  const [gerarArquivoAvulso, setGerarArquivoAvulso] = useState<File | null>(null);
  const [usarArquivoAvulso, setUsarArquivoAvulso] = useState(false);
  const fileInputLeiRef = useRef<HTMLInputElement>(null);

  const [gerandoStatus, setGerandoStatus] = useState<{
    loading: boolean;
    sucesso?: boolean;
    mensagem?: string;
    codigoSessao?: string;
    qtd?: number;
    erro?: string;
  }>({ loading: false });

  // Sessão Ativa
  const [sessaoAtiva, setSessaoAtiva] = useState<{
    titulo: string;
    questaoIds: (number | string)[];
    indice: number;
    respostasTemp: Record<string | number, { escolha: number; acertou: boolean }>;
    sessaoId?: string | number;
    codigo?: string;
    disciplina?: string;
    assunto?: string;
    banca?: string;
    questoesSnap?: Questao[];
  } | null>(null);

  // Timer e Histórico de Tempo em Sessões
  const [sessaoTempoSegundos, setSessaoTempoSegundos] = useState(0);
  const [sessaoTimerAtivo, setSessaoTimerAtivo] = useState(false);
  const [sessaoFinalizada, setSessaoFinalizada] = useState(false);
  const [registrosTempoSessoes, setRegistrosTempoSessoes] = useState<RegistroTempoSessao[]>([]);

  // Edição de Sessões / Blocos
  const [sessaoEditando, setSessaoEditando] = useState<SessaoCriada | null>(null);
  const [editCodigo, setEditCodigo] = useState('');
  const [editDisciplina, setEditDisciplina] = useState('');
  const [editAssunto, setEditAssunto] = useState('');
  const [editBanca, setEditBanca] = useState('');
  const [editCargo, setEditCargo] = useState('');
  const [editQuantidade, setEditQuantidade] = useState(10);

  // Banco de Questões (Resolver) - Suporte a Seleção Múltipla (Filter Chips)
  const [chipsFiltroBanco, setChipsFiltroBanco] = useState<TipoChipFiltroBanco[]>([]);
  const [statusFiltroBanco, setStatusFiltroBanco] = useState<
    'todas' | 'resolvidas' | 'nao-resolvidas' | 'acertei' | 'errei' | 'caderno-erros'
  >('todas');
  const [modoFiltroCaderno, setModoFiltroCaderno] = useState<ModoFiltroCaderno>('todos');
  const [chipsFiltroCaderno, setChipsFiltroCaderno] = useState<StatusErroCaderno[]>([]);
  const [filtroPalavra, setFiltroPalavra] = useState('');
  const [filtroDisciplina, setFiltroDisciplina] = useState('');
  const [bancoBlocosSelecionados, setBancoBlocosSelecionados] = useState<string[]>([]);
  const [bancoMateriasSelecionadas, setBancoMateriasSelecionadas] = useState<string[]>([]);
  const itensConhecidosBancoRef = useRef<{ blocos: Set<string>; materias: Set<string> }>({
    blocos: new Set(),
    materias: new Set(),
  });
  const [filtroAssunto, setFiltroAssunto] = useState('');
  const [filtroBanca, setFiltroBanca] = useState('');
  const [indiceBanco, setIndiceBanco] = useState(0);
  const [respostasBancoTemp, setRespostasBancoTemp] = useState<Record<string | number, { escolha: number; acertou: boolean }>>({});
  // Timer e Cronômetro em tempo real do Banco de Questões
  const [bancoTimerSegundos, setBancoTimerSegundos] = useState(0);
  const [bancoTimerAtivo, setBancoTimerAtivo] = useState(false);
  const [bancoQuestaoAtualId, setBancoQuestaoAtualId] = useState<string | number | null>(null);

  // Caderno de Erros - Feedback discreto e comentários
  const [feedbackCaderno, setFeedbackCaderno] = useState<{
    questaoId: string | number;
    status: 'recuperada' | 'reincidente';
  } | null>(null);
  const [mostrarComentarioCaderno, setMostrarComentarioCaderno] = useState(false);

  // Pop-up de 3 segundos ao lado direito do Timer (Verde: Acertei / Vermelho: Errei)
  const [popupResultadoCaderno, setPopupResultadoCaderno] = useState<{
    tipo: 'acertou' | 'errou';
    timestamp: number;
  } | null>(null);
  const popupTimeoutRef = useRef<any>(null);

  // Snapshot estável do histórico de respostas para filtragem e ordenação do Banco
  // Permite resolver e errar questões sem que a lista se reordene ou a questão suma da tela
  const [snapshotHistoricoBanco, setSnapshotHistoricoBanco] = useState<HistoricoRespostasMap>({});
  const historicoRespostasRef = useRef<HistoricoRespostasMap>(historicoRespostas);
  historicoRespostasRef.current = historicoRespostas;

  // Atualiza o snapshot para filtragem e ordenação do Banco sempre que os filtros mudarem ou ao entrar na aba
  useEffect(() => {
    setSnapshotHistoricoBanco(historicoRespostasRef.current);
  }, [
    activeTab,
    statusFiltroBanco,
    chipsFiltroBanco,
    modoFiltroCaderno,
    chipsFiltroCaderno,
    filtroPalavra,
    bancoBlocosSelecionados,
    bancoMateriasSelecionadas,
    filtroAssunto,
    filtroBanca,
  ]);

  // Feature Tesourinha: Alternativas Riscadas (Eliminadas)
  const [alternativasRiscadas, setAlternativasRiscadas] = useState<Record<string | number, Record<number, boolean>>>({});

  const alternarRiscoAlternativa = (questaoId: string | number, altIdx: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setAlternativasRiscadas((prev) => toggleAlternativaRiscada(prev, questaoId, altIdx));
  };

  // Painel de Desempenho
  const [modoVisualizacaoDesempenho, setModoVisualizacaoDesempenho] = useState<'acertos' | 'recuperacao' | 'simulados'>('recuperacao');
  const [periodoFiltro, setPeriodoFiltro] = useState<number | string>(PERIODO_FILTRO_PADRAO); // Padrão: 'hoje' ao abrir o site

  // Simulado Oficial: FAFIPA — Curitiba (Engenheiro Civil)
  const [modalSimuladoAberto, setModalSimuladoAberto] = useState(false);
  const [distribuicaoSimulado, setDistribuicaoSimulado] = useState<ResultadoDistribuicaoSimulado>(() =>
    calcularDistribuicaoSimuladoPonderado(40)
  );
  const [modoFonteSimulado, setModoFonteSimulado] = useState<'ineditas' | 'banco'>('ineditas');
  const [gerandoSimulado, setGerandoSimulado] = useState(false);
  const [progressoSimulado, setProgressoSimulado] = useState('');
  const [recompondoSimulado, setRecompondoSimulado] = useState(false);
  const [dataInicioCustom, setDataInicioCustom] = useState('');
  const [dataFimCustom, setDataFimCustom] = useState('');
  const [desempenhoFiltroDisc, setDesempenhoFiltroDisc] = useState('');
  const [desempenhoBlocosSelecionados, setDesempenhoBlocosSelecionados] = useState<string[]>([]);
  const [desempenhoMateriasSelecionadas, setDesempenhoMateriasSelecionadas] = useState<string[]>([]);
  const [dropdownBlocosAberto, setDropdownBlocosAberto] = useState(false);
  const [buscaFiltroBloco, setBuscaFiltroBloco] = useState('');
  const dropdownBlocosRef = useRef<HTMLDivElement>(null);
  const itensConhecidosFiltroRef = useRef<{ blocos: Set<string>; materias: Set<string> }>({
    blocos: new Set(),
    materias: new Set(),
  });
  const [desempenhoFiltroAssunto, setDesempenhoFiltroAssunto] = useState('');
  const [desempenhoFiltroBanca, setDesempenhoFiltroBanca] = useState('');
  const [ordemDesempenhoDisciplina, setOrdemDesempenhoDisciplina] = useState<'asc' | 'desc' | null>(null);
  const [ordemDesempenhoAssunto, setOrdemDesempenhoAssunto] = useState<'asc' | 'desc' | null>(null);
  const [recarregandoMetricas, setRecarregandoMetricas] = useState(false);

  // Atualização pontual das métricas que busca os dados mais recentes do banco sem alterar nenhum filtro selecionado
  const atualizarMetricasSemResetarFiltros = async () => {
    if (recarregandoMetricas) return;
    setRecarregandoMetricas(true);
    try {
      const [h, reg, s, q, b, bl, mat] = await Promise.all([
        carregarHistorico(),
        carregarRegistrosTempoSessoes(),
        carregarSessoes(),
        carregarQuestoes(),
        carregarBancas(),
        carregarBlocos(),
        carregarMaterias(),
      ]);
      const todasCandidatas: Questao[] = [...q];
      s.forEach((sessao) => {
        if (Array.isArray(sessao.questoesSnap)) {
          sessao.questoesSnap.forEach((sq) => {
            if (sq && sq.id != null) todasCandidatas.push(sq);
          });
        }
      });
      const { questoesLimpass } = sanitizarAcervoQuestoes(todasCandidatas, {
        emailUsuario: currentUser?.email || undefined,
        historicoParaRemapear: h,
      });
      const { sessoesAtualizadas, questoesAtualizadas } = migrarESanitizarProvasPassadas(s, questoesLimpass);
      setHistoricoRespostas(h);
      setSnapshotHistoricoBanco(h);
      setRegistrosTempoSessoes(reg);
      setSessoesCriadas(sessoesAtualizadas);
      setQuestoes(questoesAtualizadas);
      setBancas(b);
      setBlocos(bl);
      setMaterias(mat);
    } catch (err) {
      console.warn('Erro ao atualizar métricas:', err);
    } finally {
      setTimeout(() => {
        setRecarregandoMetricas(false);
      }, 350);
    }
  };

  const [sessaoInicialLote, setSessaoInicialLote] = useState<number>(1);

  const handleAbrirGeradorLoteCompleto = () => {
    setSessaoInicialLote(1);
    setIsModalLoteEscalaOpen(true);
  };

  const handleProvaSalva = async (novasQuestoes: Questao[], novaSessao: SessaoCriada) => {
    try {
      // 1. Registra no registro canônico de provas anteriores e storage dedicado
      registrarNovasProvasAnteriores(novasQuestoes, [novaSessao]);

      // 2. Persistência imediata e robusta nos caches locais
      try {
        const sessoesLocais: SessaoCriada[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
        const idxS = sessoesLocais.findIndex(
          (s) => s.id === novaSessao.id || (s.codigo && novaSessao.codigo && s.codigo === novaSessao.codigo)
        );
        if (idxS >= 0) {
          sessoesLocais[idxS] = novaSessao;
        } else {
          sessoesLocais.unshift(novaSessao);
        }
        localStorage.setItem(STORAGE_KEYS.SESSOES, JSON.stringify(sessoesLocais));

        const questoesLocais: Questao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
        const mapQ = new Map<string, Questao>();
        questoesLocais.forEach((q) => mapQ.set(String(q.id), q));
        novasQuestoes.forEach((q) => mapQ.set(String(q.id), q));
        localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(Array.from(mapQ.values())));
      } catch (errLocal) {
        console.warn('Erro ao salvar no storage local imediato:', errLocal);
      }

      setQuestoes((prev) => {
        const combinadas = [...novasQuestoes, ...prev];
        const { questoesLimpass } = sanitizarAcervoQuestoes(combinadas);
        return questoesLimpass;
      });
      setSessoesCriadas((prev) => [novaSessao, ...prev.filter((s) => s.codigo !== novaSessao.codigo)]);

      await salvarSessaoDb(novaSessao);
      await salvarNovasQuestoesDb(novasQuestoes);
      await atualizarMetricasSemResetarFiltros();

      // Limpa filtros para garantir que a sessão recém-salva apareça imediatamente em destaque
      setFiltroTipoSessao('todas');
      setFiltroStatusSessao('todos');
      setFiltroSessaoBusca('');
      setFiltroSessaoBloco('');
      setFiltroSessaoAssunto('');
      setActiveTab('sessoes');
    } catch (e) {
      console.error('Erro ao integrar prova importada:', e);
    }
  };

  const [executandoDeduplicacao, setExecutandoDeduplicacao] = useState(false);

  const handleDeduplicarQuestoes = async () => {
    if (
      !window.confirm(
        'Confirma a higienização e unificação do banco de questões?\n\n' +
        '• Cópias duplicadas serão consolidadas na questão canônica.\n' +
        '• 100% das suas tentativas, acertos e erros no Caderno serão PRESERVADOS.\n' +
        '• As questões de Provas Reais da FAFIPA retornarão à quantidade original de 74 questões.\n' +
        '• As réplicas excedentes serão excluídas da nuvem e do armazenamento local.'
      )
    ) {
      return;
    }

    setExecutandoDeduplicacao(true);
    try {
      const res = await deduplicarQuestoesDb();
      await atualizarMetricasSemResetarFiltros();
      alert(
        `Higienização concluída com sucesso!\n\n` +
        `• Total antes: ${res.totalAntes} questões\n` +
        `• Duplicatas eliminadas: ${res.duplicatasRemovidas}\n` +
        `• Total único restante: ${res.totalDepois} questões\n` +
        `• Provas Anteriores FAFIPA: ${res.provasAnterioresUnicas} (quantidade real)\n` +
        `• Questões com histórico mantido: ${res.questoesPreservadasComHistorico}`
      );
    } catch (err: any) {
      alert(`Erro ao deduplicar questões: ${err?.message || 'Falha na comunicação'}`);
    } finally {
      setExecutandoDeduplicacao(false);
    }
  };

  // Initial Data Load
  const carregarDadosDoBanco = async () => {
    setLoadingData(true);
    try {
      const [b, q, s, h, bl, mat] = await Promise.all([
        carregarBancas(),
        carregarQuestoes(),
        carregarSessoes(),
        carregarHistorico(),
        carregarBlocos(),
        carregarMaterias(),
      ]);

      // Backup defensivo automático de segurança (zero perda de dados garantida)
      try {
        if (!localStorage.getItem('gb_backup_seguranca_pre_otimizacao') && q.length > 0) {
          const snapshot = {
            data: new Date().toISOString(),
            totalQuestoes: q.length,
            totalSessoes: s.length,
            questoes: q,
            sessoes: s,
          };
          localStorage.setItem('gb_backup_seguranca_pre_otimizacao', JSON.stringify(snapshot));
        }
      } catch {}

      const BANCA_FAFIPA_PARAMETRICO: Banca = {
        id: 'fafipa-parametrico',
        nome: 'FAFIPA Paramétrico',
        cargo: 'Engenheiro Civil',
        arquivos: [],
        obs: 'Perfil paramétrico oficial FAFIPA Curitiba: 40 questões, zero cálculos nas específicas, gabarito balanceado 8A-8B-8C-8D-8E e moldes de dificuldade.',
      };

      const temFafipaParametrico = b.some((item) =>
        item.nome.toLowerCase().includes('paramétrico') ||
        item.nome.toLowerCase().includes('parametrico')
      );

      const bancasAjustadas = temFafipaParametrico ? b : [BANCA_FAFIPA_PARAMETRICO, ...b];
      setBancas(bancasAjustadas);

      // Identifica conjuntos relacionais de IDs por sessão para carimbagem
      const escalaIdSet = new Set<string>();
      const simuladosIdSet = new Set<string>();
      const provasAnterioresIdSet = new Set<string>();

      s.forEach((sessao) => {
        const tipoSessao = obterTipoSessao(sessao);

        const coletarIds = (target: Set<string>) => {
          if (Array.isArray(sessao.questaoIds)) {
            sessao.questaoIds.forEach((id) => {
              if (id != null) target.add(String(id).trim());
            });
          }
          if (Array.isArray(sessao.questoesSnap)) {
            sessao.questoesSnap.forEach((sq: any) => {
              if (sq?.id != null) target.add(String(sq.id).trim());
            });
          }
        };

        if (tipoSessao === 'prova_anterior') {
          coletarIds(provasAnterioresIdSet);
        } else if (tipoSessao === 'sessao_escala') {
          coletarIds(escalaIdSet);
        } else if (tipoSessao === 'simulado') {
          coletarIds(simuladosIdSet);
        }
      });

      // Coleta todas as questões candidatas (vindas de carregarQuestoes e snapshots de sessões)
      const todasCandidatas: Questao[] = [...q];
      s.forEach((sessao) => {
        if (Array.isArray(sessao.questoesSnap)) {
          sessao.questoesSnap.forEach((sq) => {
            if (sq && sq.id != null) todasCandidatas.push(sq);
          });
        }
      });

      // Higienização central idempotente: unicidade estrita garantida (elimina todas as duplicações de refresh)
      const { questoesLimpass } = sanitizarAcervoQuestoes(todasCandidatas, {
        emailUsuario: currentUser?.email || undefined,
        historicoParaRemapear: h,
      });

      const listaQuestoesAtualizada = questoesLimpass;

      // Carimbagem relacional de alta integridade: garante origemTipo correto em 100% dos registros
      listaQuestoesAtualizada.forEach((item) => {
        const idStr = String(item.id).trim().toLowerCase();
        const ehVerdadeiraProva =
          ehIdDeProvaAnterior(item.id) ||
          idStr.startsWith('fafipa_') ||
          idStr.startsWith('prv_') ||
          Boolean(encontrarQuestaoCanonicaProvaAnterior(item)) ||
          (provasAnterioresIdSet.has(idStr) && !idStr.startsWith('sim_') && !idStr.startsWith('lote') && !item.loteCodigo);

        if (ehVerdadeiraProva) {
          item.origemTipo = 'prova_passada';
          (item as any).tipo = 'prova_anterior';
          (item as any).origem = 'prova_anterior';
        } else if (escalaIdSet.has(idStr) || item.loteCodigo || (item as any).origem === 'sessao_escala' || idStr.startsWith('lote')) {
          item.origemTipo = 'lote_escala';
          if ((item as any).tipo === 'prova_anterior') delete (item as any).tipo;
          if ((item as any).origem === 'prova_anterior') delete (item as any).origem;
        } else if (simuladosIdSet.has(idStr) || (item as any).origem === 'simulado' || (item as any).simulado === true || idStr.startsWith('sim_')) {
          item.origemTipo = 'simulado';
          if ((item as any).tipo === 'prova_anterior') delete (item as any).tipo;
          if ((item as any).origem === 'prova_anterior') delete (item as any).origem;
        } else {
          item.origemTipo = 'sessao_avulsa';
          if ((item as any).tipo === 'prova_anterior') delete (item as any).tipo;
          if ((item as any).origem === 'prova_anterior') delete (item as any).origem;
        }
      });

      // Conjunto estritamente higienizado de Provas Anteriores (somente questões verdadeiras de provas passadas)
      const provasAnterioresIdSetHigienizado = new Set<string>();
      listaQuestoesAtualizada.forEach((item) => {
        if (item.origemTipo === 'prova_passada') {
          provasAnterioresIdSetHigienizado.add(String(item.id).trim());
        }
      });

      // Salva caches higienizados no localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(listaQuestoesAtualizada));
        localStorage.setItem('gb_questoes_escala_ids', JSON.stringify(Array.from(escalaIdSet)));
        localStorage.setItem('gb_questoes_simulados_ids', JSON.stringify(Array.from(simuladosIdSet)));
        localStorage.setItem('gb_questoes_provas_anteriores_ids', JSON.stringify(Array.from(provasAnterioresIdSetHigienizado)));
      } catch {}

      // Higieniza e migra provas passadas (Tibagi 2019 e reclassificação fechada dos 34 PDFs)
      const { sessoesAtualizadas, questoesAtualizadas } = migrarESanitizarProvasPassadas(s, listaQuestoesAtualizada);

      // Recompõe e garante mapeamento de 100% do histórico de respostas para o acervo
      const hCompleto = garantirMapeamentoHistoricoCompleto(questoesAtualizadas, h);

      setQuestoes(questoesAtualizadas);
      setSessoesCriadas(sessoesAtualizadas);
      setHistoricoRespostas(hCompleto);
      setSnapshotHistoricoBanco(hCompleto);
      setBlocos(bl);
      setMaterias(mat);

      const tempos = carregarRegistrosTempoSessoes();
      const mapaRegistros = new Set(
        tempos.map((t) => (t.sessaoId !== undefined && t.sessaoId !== null ? String(t.sessaoId) : t.codigo || ''))
      );
      const novosTempos = [...tempos];
      s.forEach((sessao) => {
        let tempo = Number(sessao.tempoSegundos) || 0;
        if (tempo === 0 && sessao.questaoIds && sessao.questaoIds.length > 0) {
          tempo = calcularTempoHistoricoQuestoes(sessao.questaoIds, h, sessao.created_at);
        }

        const chaveId = sessao.id !== undefined && sessao.id !== null ? String(sessao.id) : '';
        const chaveCod = sessao.codigo || '';
        const jaTem = (chaveId && mapaRegistros.has(chaveId)) || (chaveCod && mapaRegistros.has(chaveCod));
        if (tempo > 0 && !jaTem) {
          const novoReg: RegistroTempoSessao = {
            id: `sessao_${chaveId || chaveCod || Date.now()}`,
            sessaoId: sessao.id,
            codigo: sessao.codigo,
            titulo: `${sessao.codigo || ''} ${sessao.assunto || ''}`.trim(),
            segundos: tempo,
            data: sessao.created_at ? new Date(sessao.created_at).getTime() : Date.now(),
            concluida: sessao.concluida ?? true,
            disciplina: sessao.disciplina,
            assunto: sessao.assunto,
            banca: sessao.banca,
            acertos: sessao.acertos,
            erros: sessao.erros,
            taxaAcerto: sessao.taxaAcerto,
            totalQuestoes: sessao.quantidade,
          };
          novosTempos.push(novoReg);
          if (chaveId) mapaRegistros.add(chaveId);
          if (chaveCod) mapaRegistros.add(chaveCod);
        }
      });
      setRegistrosTempoSessoes(novosTempos);
      try {
        localStorage.setItem(STORAGE_KEYS.TEMPO_SESSOES, JSON.stringify(novosTempos));
      } catch {}
      // Sincroniza grifos da nuvem em segundo plano
      sincronizarGrifosComNuvem().catch(() => {});

      const cfg = getAppConfig();
      const hasCloud = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
      setIsCloudConfigured(hasCloud);
      if (hasCloud) {
        notificarEnvioCloud({ status: 'saved', message: 'Dados enviados' });
      }
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const inicializar = async () => {
      // 1. Sincroniza as credenciais da nuvem gravadas pelo Administrador no servidor
      // Isso permite que o celular e outros dispositivos conectem ao Supabase automaticamente!
      const cfg = await syncConfigFromServer();
      if (!isMounted) return;
      setIsCloudConfigured(Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey));

      // Purga automática, invisível e nativa de histórico e sessões corrompidas antigas (v3 auto-clean)
      // Mantém 100% intacto o acervo das 2.000 questões do banco de dados!
      const deveResetar = detectarHistoricoOuSessoesCorrompidas();
      if (deveResetar) {
        try {
          await executarHardResetHistoricoESessoes();
          localStorage.setItem('gb_clean_reset_v3_auto', 'true');
          setSessoesCriadas([]);
          setHistoricoRespostas({});
        } catch (cleanErr) {
          console.warn('Aviso no reset automático de inicialização:', cleanErr);
        }
      }

      // Se o cache local estiver vazio (ex: navegador limpou o cache/cookies ou modo anônimo),
      // hidrata completamente do Supabase sem jamais enviar estado vazio para a nuvem!
      const questoesLocaisRaw = localStorage.getItem(STORAGE_KEYS.QUESTOES);
      const sessoesLocaisRaw = localStorage.getItem(STORAGE_KEYS.SESSOES);
      const cacheLimpo =
        (!questoesLocaisRaw || questoesLocaisRaw === '[]') &&
        (!sessoesLocaisRaw || sessoesLocaisRaw === '[]');

      if (cacheLimpo && Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey)) {
        try {
          await hidratarCacheLocalDoSupabase();
        } catch (hidrErr) {
          console.warn('Aviso na hidratação de cache limpo no boot:', hidrErr);
        }
      }

      // 2. Lê usuário autenticado neste dispositivo
      const user = getCurrentUser();
      setCurrentUser(user);
      if (user) {
        await carregarDadosDoBanco();
      } else {
        setLoadingData(false);
      }
    };

    inicializar();

    const handleAuthChange = async (e: any) => {
      const updated = e.detail as UserProfile | null;
      setCurrentUser(updated);
      if (updated) {
        // Se o cache local estiver sem questões (ex: login em guia anônima ou pós-limpeza de cache),
        // hidrata obrigatoriamente do Supabase ANTES de qualquer rotina de salvamento ou renderização!
        const qLocaisRaw = localStorage.getItem(STORAGE_KEYS.QUESTOES);
        const sLocaisRaw = localStorage.getItem(STORAGE_KEYS.SESSOES);
        const cacheSemQuestoes = (!qLocaisRaw || qLocaisRaw === '[]') || (!sLocaisRaw || sLocaisRaw === '[]');

        if (cacheSemQuestoes) {
          try {
            await hidratarCacheLocalDoSupabase();
          } catch (hidrErr) {
            console.warn('Aviso na hidratação pós-login:', hidrErr);
          }
        }

        if (detectarHistoricoOuSessoesCorrompidas()) {
          try {
            await executarHardResetHistoricoESessoes();
            localStorage.setItem('gb_clean_reset_v3_auto', 'true');
            setSessoesCriadas([]);
            setHistoricoRespostas({});
          } catch {}
        }
        if (isAdmin(updated)) {
          migrarDadosLegadosParaAdm(updated.email);
        }
        await carregarDadosDoBanco();
      } else {
        setBancas([]);
        setBlocos([]);
        setMaterias([]);
        setQuestoes([]);
        setSessoesCriadas([]);
        setHistoricoRespostas({});
        setLoadingData(false);
      }
    };

    const handleCloudSync = (e: any) => {
      const detail = e.detail;
      if (detail) {
        setCloudSyncState({
          status: detail.status || 'saved',
          message: detail.message || 'Dados enviados',
          time: detail.time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        });
      }
    };

    const handleDadosHidratados = () => {
      carregarDadosDoBanco();
    };

    window.addEventListener('gb_auth_changed', handleAuthChange);
    window.addEventListener('gb_cloud_sync_notified', handleCloudSync);
    window.addEventListener('gb_dados_hidratados_da_nuvem', handleDadosHidratados);
    return () => {
      isMounted = false;
      window.removeEventListener('gb_auth_changed', handleAuthChange);
      window.removeEventListener('gb_cloud_sync_notified', handleCloudSync);
      window.removeEventListener('gb_dados_hidratados_da_nuvem', handleDadosHidratados);
    };
  }, []);

  // Timer em tempo real da sessão ativa
  useEffect(() => {
    let timerId: any = null;
    if (sessaoAtiva && sessaoTimerAtivo && !sessaoFinalizada) {
      timerId = setInterval(() => {
        setSessaoTempoSegundos((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [sessaoAtiva, sessaoTimerAtivo, sessaoFinalizada]);

  // Resumo em tempo real de erros/acertos da sessão ativa
  const resumoSessaoAtiva = useMemo(() => {
    if (!sessaoAtiva) {
      return { totalQuestoes: 0, respondidas: 0, acertos: 0, erros: 0, taxa: 0, finalizada: false };
    }
    return calcularResumoSessao(sessaoAtiva.questaoIds, sessaoAtiva.respostasTemp);
  }, [sessaoAtiva]);

  // -------------------------------------------------------------------------
  // BANCA HANDLERS (DEFINIR PREMISSAS)
  // -------------------------------------------------------------------------
  const handleBancaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        names.push(e.target.files[i].name);
      }
      setBancaArquivosNomes(names);
    } else {
      setBancaArquivosNomes([]);
    }
  };

  const salvarBanca = async () => {
    const nome = bancaNome.trim();
    if (!nome) {
      alert('Informe o nome da banca.');
      return;
    }
    if (!bancaCargo.trim()) {
      alert('Informe o campo obrigatório de treino para a IA: "Qual o cargo/função concorrida".');
      return;
    }
    if (bancaArquivosNomes.length === 0) {
      alert('O upload de provas passadas (PDF/TXT) é obrigatório. Selecione pelo menos um arquivo de prova para o treino da banca.');
      return;
    }

    try {
      const novaBanca = await salvarBancaDb({
        nome,
        cargo: bancaCargo.trim(),
        arquivos: bancaArquivosNomes,
        obs: bancaObs.trim(),
      });

      setBancas((prev) => [novaBanca, ...prev.filter((b) => b.id !== novaBanca.id)]);
      setBancaNome('');
      setBancaCargo('');
      setBancaObs('');
      setBancaArquivosNomes([]);
      if (fileInputBancaRef.current) fileInputBancaRef.current.value = '';
      alert('Banca e perfil de treino para a IA salvos com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar banca: ' + (err.message || 'Falha ao salvar.'));
    }
  };

  const abrirEdicaoBanca = (b: Banca) => {
    setBancaEditando(b);
    setEditBancaNome(b.nome);
    setEditBancaCargo(b.cargo || '');
    setEditBancaObs(b.obs || '');
  };

  const salvarEdicaoBanca = async () => {
    if (!bancaEditando) return;
    if (!editBancaNome.trim()) {
      alert('Informe o nome da banca.');
      return;
    }
    if (!editBancaCargo.trim()) {
      alert('Informe o cargo/função concorrida para o treino da IA.');
      return;
    }

    try {
      await atualizarBancaDb(bancaEditando.id, {
        nome: editBancaNome.trim(),
        cargo: editBancaCargo.trim(),
        obs: editBancaObs.trim(),
      });

      setBancas((prev) =>
        prev.map((b) =>
          b.id === bancaEditando.id
            ? { ...b, nome: editBancaNome.trim(), cargo: editBancaCargo.trim(), obs: editBancaObs.trim() }
            : b
        )
      );
      setBancaEditando(null);
    } catch (err: any) {
      alert('Erro ao atualizar banca: ' + (err.message || 'Falha.'));
    }
  };

  const removerBanca = async (id: number | string) => {
    if (confirm('Deseja excluir esta banca?')) {
      await excluirBancaDb(id);
      setBancas((prev) => prev.filter((b) => String(b.id) !== String(id)));
    }
  };

  // -------------------------------------------------------------------------
  // BLOCOS HANDLERS (DEFINIR PREMISSAS)
  // -------------------------------------------------------------------------
  const salvarBloco = async () => {
    if (!blocoNome.trim()) {
      alert('Informe o nome do bloco (ex: 01_Direito Administrativo).');
      return;
    }
    try {
      const novo = await salvarBlocoDb({
        nome: blocoNome.trim(),
        descricao: blocoDescricao.trim(),
      });
      setBlocos((prev) => [...prev, novo]);
      setBlocoNome('');
      setBlocoDescricao('');
      alert('Bloco cadastrado com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar bloco: ' + (err.message || 'Falha.'));
    }
  };

  const abrirEdicaoBloco = (bl: Bloco, modo: 'editar' | 'incluir-materia' = 'editar') => {
    setBlocoEditando(bl);
    setModalBlocoModo(modo);
    setEditBlocoNome(bl.nome);
    setEditBlocoDescricao(bl.descricao || '');
    setNovoMateriaNomeNoBloco('');
    setNovoMateriaArquivoNoBloco(null);
    if (fileInputMateriaNoBlocoRef.current) {
      fileInputMateriaNoBlocoRef.current.value = '';
    }
  };

  const salvarEdicaoBloco = async () => {
    if (!blocoEditando) return;
    if (!editBlocoNome.trim()) {
      alert('Informe o nome do bloco.');
      return;
    }

    const temDadosMateria = Boolean(novoMateriaNomeNoBloco.trim() || novoMateriaArquivoNoBloco);

    // Validação específica quando está no modo de inclusão de matéria ou preencheu algum dado de matéria
    if (modalBlocoModo === 'incluir-materia') {
      if (!novoMateriaNomeNoBloco.trim()) {
        alert('Informe o nome da matéria / lei (ex: Lei 14.133/21).');
        return;
      }
      if (!novoMateriaArquivoNoBloco) {
        alert('Selecione o arquivo PDF ou TXT da lei para vincular ao bloco.');
        return;
      }
    } else if (temDadosMateria) {
      if (!novoMateriaNomeNoBloco.trim()) {
        alert('Informe o nome da matéria / lei para salvar com o arquivo selecionado.');
        return;
      }
      if (!novoMateriaArquivoNoBloco) {
        alert('Selecione o arquivo PDF ou TXT da lei para incluir a matéria.');
        return;
      }
    }

    setCarregandoMateriaNoBloco(true);
    try {
      const blocoNomeFinal = editBlocoNome.trim() || blocoEditando.nome;
      await atualizarBlocoDb(blocoEditando.id, {
        nome: blocoNomeFinal,
        descricao: editBlocoDescricao.trim(),
      });

      setBlocos((prev) =>
        prev.map((b) =>
          b.id === blocoEditando.id
            ? { ...b, nome: blocoNomeFinal, descricao: editBlocoDescricao.trim() }
            : b
        )
      );

      // Cascade rename in materias
      setMaterias((prev) =>
        prev.map((m) =>
          String(m.blocoId) === String(blocoEditando.id) ||
          (m.blocoNome && blocoEditando.nome && m.blocoNome.trim().toLowerCase() === blocoEditando.nome.trim().toLowerCase())
            ? { ...m, blocoNome: blocoNomeFinal }
            : m
        )
      );

      // Processar e salvar matéria se foi fornecida
      const nomeMateriaInformado = novoMateriaNomeNoBloco.trim();
      if (nomeMateriaInformado && novoMateriaArquivoNoBloco) {
        let arquivoTexto = '';
        let arquivoBase64 = '';
        const isTxt =
          novoMateriaArquivoNoBloco.name.endsWith('.txt') ||
          novoMateriaArquivoNoBloco.type === 'text/plain';

        if (isTxt) {
          arquivoTexto = await readFileAsText(novoMateriaArquivoNoBloco);
        } else {
          try {
            arquivoTexto = await extractTextFromPdf(novoMateriaArquivoNoBloco);
          } catch (e) {
            console.warn('Extração via PDF.js falhou, fallback para base64:', e);
          }
        }
        if (!arquivoTexto || novoMateriaArquivoNoBloco.size < 35 * 1024 * 1024) {
          try {
            arquivoBase64 = await readFileAsBase64(novoMateriaArquivoNoBloco);
          } catch (e) {
            console.warn('Falha ao ler base64 do arquivo:', e);
          }
        }

        const novaMateria = await salvarMateriaDb({
          blocoId: blocoEditando.id,
          blocoNome: blocoNomeFinal,
          nome: nomeMateriaInformado,
          arquivoNome: novoMateriaArquivoNoBloco.name,
          arquivoTexto,
          arquivoBase64,
          arquivoTipo: novoMateriaArquivoNoBloco.type || (isTxt ? 'text/plain' : 'application/pdf'),
          tamanhoBytes: novoMateriaArquivoNoBloco.size,
        });

        setMaterias((prev) => [novaMateria, ...prev.filter((m) => m.id !== novaMateria.id)]);
      }

      setNovoMateriaNomeNoBloco('');
      setNovoMateriaArquivoNoBloco(null);
      if (fileInputMateriaNoBlocoRef.current) {
        fileInputMateriaNoBlocoRef.current.value = '';
      }
      setBlocoEditando(null);
      notificarEnvioCloud({
        status: 'saved',
        message: temDadosMateria ? 'Matéria incluída com sucesso' : 'Bloco atualizado',
      });
      alert(
        temDadosMateria
          ? `Matéria "${nomeMateriaInformado}" incluída com sucesso no bloco "${blocoNomeFinal}"!`
          : `Alterações do bloco "${blocoNomeFinal}" salvas com sucesso!`
      );
    } catch (err: any) {
      alert('Erro ao salvar: ' + (err.message || 'Falha ao processar.'));
    } finally {
      setCarregandoMateriaNoBloco(false);
    }
  };

  const adicionarMateriaAoBlocoEditando = async () => {
    if (!blocoEditando) return;
    if (!novoMateriaNomeNoBloco.trim()) {
      alert('Informe o nome da matéria / lei (ex: Lei 14.133/21).');
      return;
    }
    if (!novoMateriaArquivoNoBloco) {
      alert('Selecione o arquivo PDF ou TXT da lei.');
      return;
    }

    setCarregandoMateriaNoBloco(true);
    try {
      let arquivoTexto = '';
      let arquivoBase64 = '';
      const isTxt =
        novoMateriaArquivoNoBloco.name.endsWith('.txt') ||
        novoMateriaArquivoNoBloco.type === 'text/plain';

      if (isTxt) {
        arquivoTexto = await readFileAsText(novoMateriaArquivoNoBloco);
      } else {
        try {
          arquivoTexto = await extractTextFromPdf(novoMateriaArquivoNoBloco);
        } catch (e) {
          console.warn('Extração via PDF.js falhou, fallback para base64:', e);
        }
      }
      if (!arquivoTexto || novoMateriaArquivoNoBloco.size < 35 * 1024 * 1024) {
        try {
          arquivoBase64 = await readFileAsBase64(novoMateriaArquivoNoBloco);
        } catch (e) {
          console.warn('Falha ao ler base64 do arquivo:', e);
        }
      }

      const blocoNomeFinal = editBlocoNome.trim() || blocoEditando.nome;
      const novaMateria = await salvarMateriaDb({
        blocoId: blocoEditando.id,
        blocoNome: blocoNomeFinal,
        nome: novoMateriaNomeNoBloco.trim(),
        arquivoNome: novoMateriaArquivoNoBloco.name,
        arquivoTexto,
        arquivoBase64,
        arquivoTipo: novoMateriaArquivoNoBloco.type || (isTxt ? 'text/plain' : 'application/pdf'),
        tamanhoBytes: novoMateriaArquivoNoBloco.size,
      });

      setMaterias((prev) => [novaMateria, ...prev.filter((m) => m.id !== novaMateria.id)]);
      setNovoMateriaNomeNoBloco('');
      setNovoMateriaArquivoNoBloco(null);
      if (fileInputMateriaNoBlocoRef.current) {
        fileInputMateriaNoBlocoRef.current.value = '';
      }
      notificarEnvioCloud({ status: 'saved', message: 'Matéria adicionada ao bloco' });
      alert(`Matéria "${novaMateria.nome}" incluída no bloco "${blocoNomeFinal}" com sucesso!`);
    } catch (err: any) {
      alert('Erro ao incluir matéria no bloco: ' + (err.message || 'Falha ao salvar.'));
    } finally {
      setCarregandoMateriaNoBloco(false);
    }
  };

  const removerMateriaDoBloco = async (materiaId: number | string) => {
    if (confirm('Deseja excluir esta matéria deste bloco?')) {
      await excluirMateriaDb(materiaId);
      setMaterias((prev) => prev.filter((m) => String(m.id) !== String(materiaId)));
      notificarEnvioCloud({ status: 'saved', message: 'Matéria removida' });
    }
  };

  const removerBloco = async (id: number | string) => {
    if (confirm('Deseja excluir este bloco?')) {
      await excluirBlocoDb(id);
      setBlocos((prev) => prev.filter((b) => String(b.id) !== String(id)));
    }
  };

  // -------------------------------------------------------------------------
  // MATÉRIAS / LEIS (PDFs) HANDLERS (DEFINIR PREMISSAS)
  // -------------------------------------------------------------------------
  const salvarMateria = async () => {
    if (!materiaBlocoId) {
      alert('Selecione o Bloco de Estudo (campo obrigatório).');
      return;
    }
    if (!materiaNome.trim()) {
      alert('Informe o nome da matéria / lei (ex: Lei 14.133/21 - Licitações).');
      return;
    }
    if (!materiaArquivo) {
      alert('O upload do arquivo PDF ou TXT da lei é obrigatório.');
      return;
    }

    setMateriaCarregando(true);
    try {
      let arquivoTexto = '';
      let arquivoBase64 = '';
      const isTxt = materiaArquivo.name.endsWith('.txt') || materiaArquivo.type === 'text/plain';

      if (isTxt) {
        arquivoTexto = await readFileAsText(materiaArquivo);
      } else {
        try {
          arquivoTexto = await extractTextFromPdf(materiaArquivo);
        } catch (e) {
          console.warn('Extração via PDF.js falhou, fallback para base64:', e);
        }
      }
      if (!arquivoTexto || materiaArquivo.size < 35 * 1024 * 1024) {
        try {
          arquivoBase64 = await readFileAsBase64(materiaArquivo);
        } catch (e) {
          console.warn('Falha ao ler base64 do arquivo:', e);
        }
      }

      const blocoEncontrado = blocos.find((b) => String(b.id) === String(materiaBlocoId));
      const blocoNomeStr = blocoEncontrado ? blocoEncontrado.nome : 'Geral';

      const novaMateria = await salvarMateriaDb({
        blocoId: materiaBlocoId || undefined,
        blocoNome: blocoNomeStr,
        nome: materiaNome.trim(),
        arquivoNome: materiaArquivo.name,
        arquivoTexto,
        arquivoBase64,
        arquivoTipo: materiaArquivo.type || (isTxt ? 'text/plain' : 'application/pdf'),
        tamanhoBytes: materiaArquivo.size,
      });

      setMaterias((prev) => [novaMateria, ...prev.filter((m) => m.id !== novaMateria.id)]);
      setMateriaNome('');
      setMateriaArquivo(null);
      if (fileInputMateriaRef.current) fileInputMateriaRef.current.value = '';
      alert('Matéria/Lei e PDF cadastrados com sucesso! Agora você pode apenas selecioná-la na aba "Gerar Sessão".');
    } catch (err: any) {
      alert('Erro ao salvar matéria: ' + (err.message || 'Falha ao salvar.'));
    } finally {
      setMateriaCarregando(false);
    }
  };

  const abrirEdicaoMateria = (m: Materia) => {
    setMateriaEditando(m);
    setEditMateriaNome(m.nome);
    setEditMateriaBlocoId(m.blocoId || '');
  };

  const salvarEdicaoMateria = async () => {
    if (!materiaEditando) return;
    if (!editMateriaNome.trim()) {
      alert('Informe o nome da matéria.');
      return;
    }
    const blocoEncontrado = blocos.find((b) => String(b.id) === String(editMateriaBlocoId));
    const blocoNomeStr = blocoEncontrado ? blocoEncontrado.nome : materiaEditando.blocoNome;

    try {
      await atualizarMateriaDb(materiaEditando.id, {
        nome: editMateriaNome.trim(),
        blocoId: editMateriaBlocoId || undefined,
        blocoNome: blocoNomeStr,
      });
      setMaterias((prev) =>
        prev.map((m) =>
          m.id === materiaEditando.id
            ? { ...m, nome: editMateriaNome.trim(), blocoId: editMateriaBlocoId || undefined, blocoNome: blocoNomeStr }
            : m
        )
      );
      setMateriaEditando(null);
    } catch (err: any) {
      alert('Erro ao atualizar matéria: ' + (err.message || 'Falha.'));
    }
  };

  const removerMateria = async (id: number | string) => {
    if (confirm('Deseja excluir esta matéria e seu arquivo associado?')) {
      await excluirMateriaDb(id);
      setMaterias((prev) => prev.filter((m) => String(m.id) !== String(id)));
    }
  };

  // -------------------------------------------------------------------------
  // GERAR SESSÃO COM GEMINI IA (SELEÇÃO DE PREMISSAS OU ARQUIVO AVULSO)
  // -------------------------------------------------------------------------
  const processarEValidarLei = async () => {
    // Determine banca and cargo (cargo já foi definido na BANCA)
    if (!gerarBanca) {
      alert('Selecione uma Banca examinadora cadastrada.');
      return;
    }

    const bancaEncontrada = bancas.find((b) => b.nome === gerarBanca);
    const cargoFinal = (bancaEncontrada?.cargo || 'Geral').trim();
    const obsBanca = bancaEncontrada?.obs || '';

    let disciplinaFinal = '';
    let assuntoFinal = '';
    let materiaSelecionada: Materia | undefined;
    let fileToSend: File | undefined = undefined;
    let fileTextToSend = '';
    let fileBase64ToSend = '';
    let mimeTypeToSend = 'application/pdf';

    if (usarArquivoAvulso) {
      if (!gerarDisciplina.trim() || !gerarAssunto.trim() || !gerarArquivoAvulso) {
        alert('Preencha o Bloco/Disciplina, o Assunto e selecione o PDF/arquivo da lei.');
        return;
      }
      disciplinaFinal = gerarDisciplina.trim();
      assuntoFinal = gerarAssunto.trim();
      fileToSend = gerarArquivoAvulso;
    } else {
      // Bloco é obrigatório conforme solicitado pelo usuário
      if (!gerarBlocoId) {
        alert('Selecione o Bloco (campo obrigatório).');
        return;
      }
      if (!gerarMateriaId) {
        alert('Selecione uma Matéria / Legislação da lista suspensa (ou marque para subir arquivo avulso).');
        return;
      }
      materiaSelecionada = materias.find((m) => String(m.id) === String(gerarMateriaId));
      if (!materiaSelecionada) {
        alert('Matéria selecionada não encontrada.');
        return;
      }
      const blocoEncontrado = blocos.find((b) => String(b.id) === String(gerarBlocoId));
      disciplinaFinal = blocoEncontrado?.nome || materiaSelecionada.blocoNome || 'Geral';
      assuntoFinal = materiaSelecionada.nome;
      fileTextToSend = materiaSelecionada.arquivoTexto || '';
      fileBase64ToSend = materiaSelecionada.arquivoBase64 || '';
      mimeTypeToSend = materiaSelecionada.arquivoTipo || 'application/pdf';
    }

    // Localiza questões já existentes desta matéria no banco para ativar a memória anti-repetição
    const questoesExistentesMateria = questoes.filter((q) => {
      const matchDisc =
        q.disciplina &&
        disciplinaFinal &&
        q.disciplina.trim().toLowerCase() === disciplinaFinal.trim().toLowerCase();
      const matchAss =
        q.assunto &&
        assuntoFinal &&
        q.assunto.trim().toLowerCase() === assuntoFinal.trim().toLowerCase();
      return matchDisc && matchAss;
    });

    const resumoExistentes = questoesExistentesMateria.map((q) => ({
      artigo: q.artigo,
      enunciadoResumido: q.enunciado ? q.enunciado.slice(0, 160).replace(/\s+/g, ' ').trim() : '',
    }));

    const statusMsg =
      resumoExistentes.length > 0
        ? `A IA do Gemini está analisando ${assuntoFinal} (${resumoExistentes.length} questões no histórico). Elaborando ${gerarQtd} novas questões focadas nos temas centrais do PDF, variando modelos e formatos sem duplicar enunciados...`
        : `A IA do Gemini está analisando ${assuntoFinal} e gerando ${gerarQtd} questões contextualizadas no cargo de "${cargoFinal}" no estilo ${gerarBanca}...`;

    setGerandoStatus({
      loading: true,
      mensagem: statusMsg,
    });

    const ehFafipaParametrico = gerarBanca.toLowerCase().includes('fafipa');
    const feedbackAprendizado = gerarPromptAprendizadoFeedback();
    const diretrizesParametricas = ehFafipaParametrico
      ? `${montarInstrucoesDnaBanca(PERFIL_FAFIPA_CURITIBA)}${feedbackAprendizado ? `\n\n${feedbackAprendizado}` : ''}`
      : '';
    const obsBancaFinal = diretrizesParametricas
      ? `${diretrizesParametricas}\n\n${obsBanca}`
      : obsBanca;

    try {
      // Real Gemini API Call with Anti-Repetition memory and unified parametric guidelines
      const questoesGeradasIA = await callGeminiGenerateQuestions({
        banca: gerarBanca,
        disciplina: disciplinaFinal,
        assunto: assuntoFinal,
        cargo: cargoFinal,
        direcionamentoAdicional: gerarDirecionamento.trim() || undefined,
        quantidade: Number(gerarQtd),
        observacoesBanca: obsBancaFinal,
        questoesExistentes: resumoExistentes,
        file: fileToSend,
        fileText: fileTextToSend || undefined,
        fileBase64: fileBase64ToSend || undefined,
        mimeType: mimeTypeToSend,
      });

      // Garante aleatoriedade e distribuição uniforme de gabaritos (A, B, C, D, E) nas novas sessões
      const questoesBalanceadas = garantirDistribuicaoUniforme(questoesGeradasIA);

      // Prepare questions to persist with clean text and balanced answers
      const novasParaSalvar: Omit<Questao, 'id'>[] = questoesBalanceadas.map((q: any) => ({
        banca: gerarBanca,
        cargo: cargoFinal,
        disciplina: disciplinaFinal,
        assunto: assuntoFinal,
        artigo: q.artigo || `Fundamentação - ${assuntoFinal}`,
        enunciado: limparSintaxeLatex(q.enunciado || ''),
        alternativas: (Array.isArray(q.alternativas) ? q.alternativas : []).map(limparSintaxeLatex),
        correta: typeof q.correta === 'number' ? q.correta : 0,
        comentario: limparSintaxeLatex(q.comentario || 'Gabarito baseado no texto da legislação enviada.'),
      }));

      // Save to Supabase (and local storage)
      const questoesSalvas = await salvarNovasQuestoesDb(novasParaSalvar);

      // Create new session object following standard pattern with sequential counter (e.g. BL02L14133x1, BL02L14133x2)
      const codigoSessao = gerarCodigoSessaoComContagem(disciplinaFinal, assuntoFinal, sessoesCriadas);
      const dataHoraExata = new Date().toLocaleString('pt-BR');
      const idsQuestoes = questoesSalvas.map((q) => q.id);

      const novaSessaoObj: SessaoCriada = {
        codigo: codigoSessao,
        dataHora: dataHoraExata,
        banca: gerarBanca,
        cargo: cargoFinal,
        disciplina: disciplinaFinal,
        assunto: assuntoFinal,
        quantidade: questoesSalvas.length,
        questaoIds: idsQuestoes,
        tempoSegundos: 0,
        concluida: false,
        taxaAcerto: undefined,
        acertos: undefined,
        erros: undefined,
      };

      const sessaoSalva = await salvarSessaoDb(novaSessaoObj);

      // Update state
      setQuestoes((prev) => [...prev, ...questoesSalvas]);
      setSessoesCriadas((prev) => [sessaoSalva, ...prev]);

      // Reset fields
      setGerarDirecionamento('');
      setGerarArquivoAvulso(null);
      if (fileInputLeiRef.current) fileInputLeiRef.current.value = '';

      setGerandoStatus({
        loading: false,
        sucesso: true,
        codigoSessao: codigoSessao,
        qtd: questoesSalvas.length,
      });
    } catch (err: any) {
      console.error('Falha ao gerar questões:', err);
      setGerandoStatus({
        loading: false,
        sucesso: false,
        erro: err.message || 'Erro ao comunicar com a IA do Gemini. Verifique a chave de API.',
      });
    }
  };

  // -------------------------------------------------------------------------
  // SESSÕES CRIADAS & RESOLVER SESSÃO ATIVA
  // -------------------------------------------------------------------------
  const iniciarSessaoAtiva = (
    ids: (number | string)[],
    titulo: string,
    sessaoObj?: SessaoCriada,
    forcarReinicio: boolean = false
  ) => {
    if (!ids || ids.length === 0) {
      alert('Nenhuma questão encontrada para esta sessão.');
      return;
    }
    const primeiraQuestao = questoes.find((q) => ids.some((id) => String(id) === String(q.id)));
    const disciplina = sessaoObj?.disciplina || primeiraQuestao?.disciplina || '';
    const assunto = sessaoObj?.assunto || primeiraQuestao?.assunto || '';
    const banca = sessaoObj?.banca || primeiraQuestao?.banca || '';

    const codigo =
      sessaoObj?.codigo ||
      (disciplina && assunto ? gerarCodigoSessaoPadrao(disciplina, assunto) : undefined);
    const sessaoId = sessaoObj?.id || sessaoObj?.codigo || codigo;

    // Localiza se havia registro de tempo anterior
    const regAnterior = encontrarRegistroTempoSessao(
      sessaoObj || { id: sessaoId, codigo, disciplina, assunto, banca },
      registrosTempoSessoes,
      codigo
    );

    if (forcarReinicio) {
      setSessaoTempoSegundos(0);
      setSessaoFinalizada(false);
      setSessaoTimerAtivo(true);
    } else {
      const temQuestoesRespondidas = ids.some((qId) => {
        const arr = historicoRespostas[qId] || historicoRespostas[String(qId)] || historicoRespostas[Number(qId)];
        return arr && arr.length > 0;
      });
      const tempoInicial = (regAnterior && temQuestoesRespondidas) ? regAnterior.segundos : 0;
      const jaFinalizada = Boolean(regAnterior?.concluida && temQuestoesRespondidas);
      setSessaoTempoSegundos(tempoInicial);
      setSessaoFinalizada(jaFinalizada);
      setSessaoTimerAtivo(!jaFinalizada);
    }

    // Reequilibra dinamicamente as alternativas caso a sessão possua viés de A/B herdado de cadastros antigos
    const questoesDaSessao = ids
      .map((id) => questoes.find((q) => String(q.id) === String(id)) || sessaoObj?.questoesSnap?.find((q) => String(q.id) === String(id)))
      .filter((q): q is Questao => Boolean(q));

    // Se encontramos questões no snapshot que não estavam no estado geral de questões, auto-restaura
    if (questoesDaSessao.length > 0) {
      setQuestoes((prev) => {
        const idSet = new Set(prev.map((q) => String(q.id)));
        const faltantes = questoesDaSessao.filter((q) => !idSet.has(String(q.id)));
        if (faltantes.length > 0) {
          try {
            const current: Questao[] = JSON.parse(localStorage.getItem('gb_questoes') || '[]');
            const cSet = new Set(current.map((q) => String(q.id)));
            const toAdd = faltantes.filter((q) => !cSet.has(String(q.id)));
            if (toAdd.length > 0) {
              current.push(...toAdd);
              localStorage.setItem('gb_questoes', JSON.stringify(current));
            }
          } catch {}
          return [...prev, ...faltantes];
        }
        return prev;
      });
    }

    const ehProvaAnterior =
      sessaoObj?.tipo === 'prova_anterior' ||
      (sessaoObj && obterTipoSessao(sessaoObj) === 'prova_anterior');

    if (!ehProvaAnterior && questoesDaSessao.length >= 2) {
      const balanceadas = garantirDistribuicaoUniforme(questoesDaSessao);
      let houveMudanca = false;
      const mapaAtualizado = new Map<string | number, Questao>();
      balanceadas.forEach((bq, i) => {
        const original = questoesDaSessao[i];
        if (
          original &&
          (bq.correta !== original.correta ||
            (bq.alternativas && original.alternativas && bq.alternativas[0] !== original.alternativas[0]))
        ) {
          houveMudanca = true;
          mapaAtualizado.set(bq.id, {
            ...bq,
            enunciado: limparSintaxeLatex(bq.enunciado),
            alternativas: (bq.alternativas || []).map(limparSintaxeLatex),
            comentario: limparSintaxeLatex(bq.comentario || ''),
          });
        }
      });
      if (houveMudanca) {
        setQuestoes((prev) =>
          prev.map((q) => (mapaAtualizado.has(q.id) ? mapaAtualizado.get(q.id)! : q))
        );
      }
    }

    const snapFinal = sessaoObj?.questoesSnap || (questoesDaSessao.length > 0 ? questoesDaSessao : undefined);

    setSessaoAtiva({
      titulo,
      questaoIds: ids,
      indice: 0,
      respostasTemp: {},
      sessaoId,
      codigo,
      disciplina,
      assunto,
      banca,
      questoesSnap: snapFinal,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fecharSessaoAtiva = async () => {
    if (sessaoAtiva && sessaoTempoSegundos > 0) {
      const resumo = calcularResumoSessao(sessaoAtiva.questaoIds, sessaoAtiva.respostasTemp);
      const foiConcluida = sessaoFinalizada || resumo.finalizada;
      const reg: RegistroTempoSessao = {
        id: `sessao_${sessaoAtiva.sessaoId || sessaoAtiva.codigo || `${sessaoAtiva.disciplina}_${sessaoAtiva.assunto}` || Date.now()}`,
        sessaoId: sessaoAtiva.sessaoId,
        codigo: sessaoAtiva.codigo,
        titulo: sessaoAtiva.titulo,
        segundos: sessaoTempoSegundos,
        data: Date.now(),
        concluida: foiConcluida,
        totalQuestoes: resumo.totalQuestoes,
        acertos: resumo.acertos,
        erros: resumo.erros,
        taxaAcerto: resumo.taxa,
        disciplina: sessaoAtiva.disciplina,
        assunto: sessaoAtiva.assunto,
        banca: sessaoAtiva.banca,
      };
      await salvarRegistroTempoSessao(reg);
      setRegistrosTempoSessoes((prev) => {
        const filtered = prev.filter(
          (r) =>
            !(
              (sessaoAtiva.sessaoId && r.sessaoId && String(r.sessaoId) === String(sessaoAtiva.sessaoId)) ||
              (sessaoAtiva.codigo && r.codigo && r.codigo.trim().toLowerCase() === sessaoAtiva.codigo.trim().toLowerCase())
            )
        );
        return [...filtered, reg];
      });

      if (foiConcluida) {
        setSessoesCriadas((prev) =>
          prev.map((s) => {
            const isTarget =
              (sessaoAtiva.sessaoId && s.id && String(s.id) === String(sessaoAtiva.sessaoId)) ||
              (sessaoAtiva.codigo && s.codigo && s.codigo === sessaoAtiva.codigo);
            if (isTarget) {
              return {
                ...s,
                tempoSegundos: reg.segundos,
                concluida: true,
                taxaAcerto: resumo.taxa,
                acertos: resumo.acertos,
                erros: resumo.erros,
              };
            }
            return s;
          })
        );

        if (sessaoAtiva.sessaoId) {
          atualizarSessaoDb(sessaoAtiva.sessaoId, {
            tempoSegundos: reg.segundos,
            concluida: true,
            taxaAcerto: resumo.taxa,
            acertos: resumo.acertos,
            erros: resumo.erros,
          });
        }
      }
    }
    setSessaoTimerAtivo(false);
    setSessaoAtiva(null);
    setModoLeituraSessao(false);
  };

  const reiniciarSessaoAtiva = () => {
    if (!sessaoAtiva) return;
    setSessaoTempoSegundos(0);
    setSessaoFinalizada(false);
    setSessaoTimerAtivo(true);
    setSessaoAtiva((prev) => (prev ? { ...prev, indice: 0, respostasTemp: {} } : null));
  };

  const abrirModalEdicaoSessao = (sessao: SessaoCriada) => {
    setSessaoEditando(sessao);
    setEditCodigo(sessao.codigo || gerarCodigoSessaoPadrao(sessao.disciplina, sessao.assunto));
    setEditDisciplina(sessao.disciplina);
    setEditAssunto(sessao.assunto);
    setEditBanca(sessao.banca);
    setEditCargo(sessao.cargo || '');
    setEditQuantidade(sessao.quantidade);
  };

  const salvarEdicaoSessao = async () => {
    if (!sessaoEditando) return;
    const cod = editCodigo.trim() || gerarCodigoSessaoPadrao(editDisciplina.trim(), editAssunto.trim());
    const disc = editDisciplina.trim();
    const ass = editAssunto.trim();
    const ban = editBanca.trim();
    const car = editCargo.trim();
    const qtd = Number(editQuantidade) || sessaoEditando.quantidade;

    const oldDisciplina = sessaoEditando.disciplina;
    const oldAssunto = sessaoEditando.assunto;
    const oldBanca = sessaoEditando.banca;
    const oldCodigo = sessaoEditando.codigo;
    const idToUpdate = sessaoEditando.id || sessaoEditando.codigo;

    // 1. Gather all question IDs associated with this session (by explicit questaoIds OR previous disciplina/assunto)
    const matchingQuestoes = questoes.filter((q) => {
      const matchId = sessaoEditando.questaoIds && sessaoEditando.questaoIds.some((id) => String(id) === String(q.id));
      const matchOldDiscAss = (oldDisciplina && q.disciplina === oldDisciplina) && (oldAssunto && q.assunto === oldAssunto);
      return matchId || matchOldDiscAss;
    });

    const idsQuestoesAssociadas: (number | string)[] = Array.from(
      new Set([
        ...(sessaoEditando.questaoIds || []),
        ...matchingQuestoes.map((q) => q.id),
      ])
    );

    // 2. Cascade update in React state: questoes
    setQuestoes((prev) =>
      prev.map((q) => {
        const matchId = idsQuestoesAssociadas.some((id) => String(id) === String(q.id));
        const matchOldDiscAss = Boolean(
          (oldDisciplina && q.disciplina === oldDisciplina) &&
          (oldAssunto && q.assunto === oldAssunto)
        );
        if (matchId || matchOldDiscAss) {
          return {
            ...q,
            disciplina: disc,
            assunto: ass,
            banca: ban,
            cargo: car,
          };
        }
        return q;
      })
    );

    // 3. Cascade update in Supabase & LocalStorage for questions
    await atualizarQuestoesDb(
      {
        ids: idsQuestoesAssociadas,
        oldDisciplina,
        oldAssunto,
      },
      {
        disciplina: disc,
        assunto: ass,
        banca: ban,
        cargo: car,
      }
    );

    // 4. Update session in React state
    setSessoesCriadas((prev) =>
      prev.map((s) => {
        const isTarget =
          (s.id && s.id === sessaoEditando.id) ||
          s.codigo === sessaoEditando.codigo ||
          (s.disciplina === oldDisciplina && s.assunto === oldAssunto);

        if (isTarget) {
          return {
            ...s,
            codigo: cod,
            disciplina: disc,
            assunto: ass,
            banca: ban,
            cargo: car,
            quantidade: qtd,
            questaoIds: idsQuestoesAssociadas,
          };
        }
        return s;
      })
    );

    // 5. Update session in Supabase & LocalStorage
    await atualizarSessaoDb(idToUpdate, {
      codigo: cod,
      disciplina: disc,
      assunto: ass,
      banca: ban,
      cargo: car,
      quantidade: qtd,
      questaoIds: idsQuestoesAssociadas,
    });

    // 6. Synchronize active filter dropdowns across the platform
    if (filtroDisciplina === oldDisciplina) setFiltroDisciplina(disc);
    if (filtroAssunto === oldAssunto) setFiltroAssunto(ass);
    if (filtroBanca === oldBanca) setFiltroBanca(ban);

    if (desempenhoFiltroDisc === oldDisciplina) setDesempenhoFiltroDisc(disc);
    if (desempenhoFiltroAssunto === oldAssunto) setDesempenhoFiltroAssunto(ass);
    if (desempenhoFiltroBanca === oldBanca) setDesempenhoFiltroBanca(ban);

    // 7. Update active session header if resolving
    if (sessaoAtiva) {
      if (
        sessaoAtiva.titulo.includes(oldAssunto) ||
        sessaoAtiva.titulo.includes(oldCodigo) ||
        sessaoAtiva.titulo.includes(oldDisciplina)
      ) {
        setSessaoAtiva((prev) =>
          prev
            ? {
                ...prev,
                titulo: `${cod} • ${ass}`,
              }
            : null
        );
      }
    }

    // 8. Synchronize session tempo records
    setRegistrosTempoSessoes((prev) => {
      const updated = prev.map((r) => {
        const match =
          (sessaoEditando.id && r.sessaoId && String(r.sessaoId) === String(sessaoEditando.id)) ||
          (oldCodigo && r.codigo === oldCodigo) ||
          (r.disciplina === oldDisciplina && r.assunto === oldAssunto);
        if (match) {
          return {
            ...r,
            codigo: cod,
            disciplina: disc,
            assunto: ass,
            banca: ban,
          };
        }
        return r;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.TEMPO_SESSOES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setSessaoEditando(null);
    alert('Sessão e todas as questões associadas foram atualizadas com sucesso em toda a plataforma!');
  };

  const apagarSessao = async (sessao: SessaoCriada) => {
    const cod = sessao.codigo || gerarCodigoSessaoPadrao(sessao.disciplina, sessao.assunto);
    if (confirm(`Tem certeza que deseja apagar permanentemente a sessão "${cod}" (${sessao.assunto})?`)) {
      const idToDelete = sessao.id || sessao.codigo;
      await excluirSessaoDb(idToDelete);

      setSessoesCriadas((prev) => prev.filter((s) => s.id !== sessao.id && s.codigo !== sessao.codigo));

      setRegistrosTempoSessoes((prev) => {
        const updated = prev.filter(
          (r) =>
            !(
              (sessao.id && r.sessaoId && String(r.sessaoId) === String(sessao.id)) ||
              (sessao.codigo && r.codigo === sessao.codigo) ||
              (r.disciplina === sessao.disciplina && r.assunto === sessao.assunto)
            )
        );
        try {
          localStorage.setItem(STORAGE_KEYS.TEMPO_SESSOES, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      if (sessaoAtiva && (sessaoAtiva.titulo.includes(sessao.assunto) || sessaoAtiva.titulo.includes(sessao.codigo))) {
        setSessaoAtiva(null);
      }

      alert('Sessão apagada com sucesso.');
    }
  };

  const responderSessaoAtiva = async (questaoIdInput: number | string, escolhaIdxInput: number) => {
    const targetQIdStr = String(questaoIdInput).trim();
    const escolhaIdx = Number(escolhaIdxInput);

    if (processandoRespostaRef.current.has(targetQIdStr)) {
      return; // Trava contra race condition / clique duplo em paralelo
    }

    if (!sessaoAtiva) return;

    // Se a questão já foi respondida nesta sessão, ignora novos disparos
    if (sessaoAtiva.respostasTemp && sessaoAtiva.respostasTemp[targetQIdStr] !== undefined) {
      return;
    }

    processandoRespostaRef.current.add(targetQIdStr);

    try {
      const q = questoes.find((item) => String(item.id).trim() === targetQIdStr);
      if (!q) return;

      const acertou = escolhaIdx === q.correta;
      const novaTentativa: TentativaResposta = {
        questaoId: targetQIdStr,
        escolha: escolhaIdx,
        acertou,
        data: Date.now(),
        origem: 'sessao',
      };

      const novasRespostas = {
        ...sessaoAtiva.respostasTemp,
        [targetQIdStr]: { escolha: escolhaIdx, acertou },
      };

      // Verifica se respondeu a última questão da sessão
      const completouUltima = ehUltimaQuestaoRespondida(sessaoAtiva.questaoIds, sessaoAtiva.respostasTemp, targetQIdStr);

      // Update in-session state
      setSessaoAtiva((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          respostasTemp: novasRespostas,
        };
      });

      // Encerra automaticamente o timer quando responde a última questão
      if (completouUltima) {
        setSessaoTimerAtivo(false);
        setSessaoFinalizada(true);

        const resumo = calcularResumoSessao(sessaoAtiva.questaoIds, novasRespostas);
        const regFinal: RegistroTempoSessao = {
          id: `sessao_${sessaoAtiva.sessaoId || sessaoAtiva.codigo || `${sessaoAtiva.disciplina}_${sessaoAtiva.assunto}` || Date.now()}`,
          sessaoId: sessaoAtiva.sessaoId,
          codigo: sessaoAtiva.codigo,
          titulo: sessaoAtiva.titulo,
          segundos: sessaoTempoSegundos,
          data: Date.now(),
          concluida: true,
          totalQuestoes: resumo.totalQuestoes,
          acertos: resumo.acertos,
          erros: resumo.erros,
          taxaAcerto: resumo.taxa,
          disciplina: sessaoAtiva.disciplina,
          assunto: sessaoAtiva.assunto,
          banca: sessaoAtiva.banca,
        };
        await salvarRegistroTempoSessao(regFinal);
        setRegistrosTempoSessoes((prev) => {
          const filtered = prev.filter(
            (r) =>
              !(
                (sessaoAtiva.sessaoId && r.sessaoId && String(r.sessaoId) === String(sessaoAtiva.sessaoId)) ||
                (sessaoAtiva.codigo && r.codigo && r.codigo.trim().toLowerCase() === sessaoAtiva.codigo.trim().toLowerCase())
              )
          );
          return [...filtered, regFinal];
        });

        setSessoesCriadas((prev) =>
          prev.map((s) => {
            const isTarget =
              (sessaoAtiva.sessaoId && s.id && String(s.id) === String(sessaoAtiva.sessaoId)) ||
              (sessaoAtiva.codigo && s.codigo && s.codigo === sessaoAtiva.codigo);
            if (isTarget) {
              return {
                ...s,
                tempoSegundos: regFinal.segundos,
                concluida: true,
                taxaAcerto: resumo.taxa,
                acertos: resumo.acertos,
                erros: resumo.erros,
              };
            }
            return s;
          })
        );

        if (sessaoAtiva.sessaoId) {
          atualizarSessaoDb(sessaoAtiva.sessaoId, {
            tempoSegundos: regFinal.segundos,
            concluida: true,
            taxaAcerto: resumo.taxa,
            acertos: resumo.acertos,
            erros: resumo.erros,
          });
        }
      }

      const codSessao = String(sessaoAtiva.codigo || '').toUpperCase();
      const assSessao = String(sessaoAtiva.assunto || '').toLowerCase();
      const tipoSessao = String((sessaoAtiva as any).tipo || '').toLowerCase();
      const ehSessaoSimulado =
        tipoSessao === 'simulado' ||
        codSessao.startsWith('SIM-') ||
        codSessao.includes('SIM') ||
        assSessao.includes('simulado') ||
        assSessao.includes('prova real');

      novaTentativa.origem = ehSessaoSimulado ? 'simulado' : 'sessao';

      // Update global state & persist to Supabase
      setHistoricoRespostas((prev) => {
        const arr = prev[targetQIdStr] ? [...prev[targetQIdStr], novaTentativa] : [novaTentativa];
        return { ...prev, [targetQIdStr]: arr };
      });

      await salvarTentativaDb(targetQIdStr, {
        escolha: escolhaIdx,
        acertou,
        data: novaTentativa.data,
        origem: ehSessaoSimulado ? 'simulado' : 'sessao',
      });
    } finally {
      setTimeout(() => {
        processandoRespostaRef.current.delete(targetQIdStr);
      }, 300);
    }
  };

  const mudarQuestaoSessao = (direcao: number) => {
    if (!sessaoAtiva) return;
    const novoIndice = sessaoAtiva.indice + direcao;
    if (novoIndice >= 0 && novoIndice < sessaoAtiva.questaoIds.length) {
      setSessaoAtiva({
        ...sessaoAtiva,
        indice: novoIndice,
      });
    }
  };

  // Escutador global de teclas para Modo Leitura (L) e Navegação entre Questões (A = Voltar, D = Avançar)
  useEffect(() => {
    if (!sessaoAtiva) return;

    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'l') {
        e.preventDefault();
        alternarModoLeitura();
      } else if (key === 'a') {
        if (sessaoAtiva.indice > 0) {
          e.preventDefault();
          mudarQuestaoSessao(-1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (key === 'd') {
        if (sessaoAtiva.indice < sessaoAtiva.questaoIds.length - 1) {
          e.preventDefault();
          mudarQuestaoSessao(1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (['1', '2', '3', '4', '5'].includes(key)) {
        const idx = parseInt(key, 10) - 1;
        const qId = sessaoAtiva.questaoIds[sessaoAtiva.indice];
        if (qId != null) {
          const respSalva = sessaoAtiva.respostasTemp ? sessaoAtiva.respostasTemp[qId] : undefined;
          if (respSalva === undefined) {
            e.preventDefault();
            responderSessaoAtiva(qId, idx);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => {
      window.removeEventListener('keydown', handleKeyDownGlobal);
    };
  }, [sessaoAtiva]);

  // Trava estritamente nos 7 Blocos Oficiais do EAP Paramétrico FAFIPA (elimina as 100+ variações legadas)
  const listaDisciplinas = useMemo(() => {
    return [...BLOCOS_CANONICOS_EAP];
  }, []);

  // Estrutura hierárquica travada estritamente nos 7 Blocos Canônicos e 34 Matérias Oficiais do EAP FAFIPA
  const gruposBlocosFiltro = useMemo(() => {
    return BLOCOS_CANONICOS_EAP.map((blocoNome) => {
      // 34 Matérias Oficiais pertencentes a este bloco
      const itensDoBloco = TABELA_PDFS_ESTUDO.filter((p) => p.blocoNome === blocoNome);

      const listaMat = itensDoBloco.map((item) => {
        const matNome = item.nome;
        const key = `${blocoNome}:::${matNome}`;
        const totalQuestoes = questoes.filter((q) => {
          if (q.disciplina !== blocoNome) return false;
          if (!q.assunto) return false;
          if (q.assunto === matNome || q.assunto === item.codigo || q.assunto.startsWith(item.codigo)) return true;
          return q.assunto.includes(item.codigo);
        }).length;

        return {
          key,
          blocoNome,
          materiaNome: matNome,
          totalQuestoes,
        };
      });

      const totalQuestoesBloco = questoes.filter((q) => q.disciplina === blocoNome).length;

      return {
        blocoNome,
        totalQuestoes: totalQuestoesBloco,
        materias: listaMat,
      };
    });
  }, [questoes]);

  // Auditoria e Padronização Paramétrica EAP
  const [padronizandoEap, setPadronizandoEap] = useState(false);
  const [feedbackEap, setFeedbackEap] = useState<{ visivel: boolean; mensagem: string } | null>(null);

  const relatorioEap = useMemo(() => {
    return auditarERecategorizarAcervo(questoes);
  }, [questoes]);

  const handlePadronizarEap = async () => {
    setPadronizandoEap(true);
    try {
      const res = await recategorizarESincronizarAcervoEap(questoes);
      setQuestoes(res.questoesSanitizadas);
      setFeedbackEap({
        visivel: true,
        mensagem: `${res.totalQuestoes} questões auditadas: 100% alinhadas aos 7 Blocos e 34 Matérias do EAP (${res.totalRecategorizadas} re-categorizadas).`,
      });
      setTimeout(() => setFeedbackEap(null), 7000);
    } catch (err) {
      console.error('Erro ao padronizar EAP:', err);
    } finally {
      setPadronizandoEap(false);
    }
  };

  // -------------------------------------------------------------------------
  // BANCO DE QUESTÕES (RESOLVER) & CADERNO DE ERROS
  // -------------------------------------------------------------------------
  const totalQuestoesCaderno = useMemo(() => {
    return questoes.filter((q) => {
      const arr = historicoRespostas[String(q.id)] || historicoRespostas[Number(q.id)] || [];
      return arr.some((t) => !t.acertou);
    }).length;
  }, [questoes, historicoRespostas]);

  const { idsQuestoesSimulados, idsQuestoesEscala, idsQuestoesProvasAnteriores } = useMemo(() => {
    const setSimulados = new Set<string | number>();
    const setEscala = new Set<string | number>();
    const setProvasAnteriores = new Set<string | number>();

    const extrairParaSet = (arr: any, targetSet: Set<string | number>) => {
      let ids: any[] = [];
      if (Array.isArray(arr)) ids = arr;
      else if (typeof arr === 'string') {
        try {
          const parsed = JSON.parse(arr);
          if (Array.isArray(parsed)) ids = parsed;
        } catch {}
      }
      ids.forEach((id: any) => {
        if (id != null) {
          targetSet.add(String(id).trim());
          if (!isNaN(Number(id))) targetSet.add(Number(id));
        }
      });
    };

    const processarSessao = (s: any) => {
      const tipoSessao = obterTipoSessao(s);

      if (tipoSessao === 'prova_anterior') {
        extrairParaSet(s.questaoIds, setProvasAnteriores);
        extrairParaSet(s.questao_ids, setProvasAnteriores);
        if (Array.isArray(s.questoesSnap)) {
          s.questoesSnap.forEach((sq: any) => {
            if (sq && sq.id != null) {
              setProvasAnteriores.add(String(sq.id).trim());
              if (!isNaN(Number(sq.id))) setProvasAnteriores.add(Number(sq.id));
            }
          });
        }
      } else if (tipoSessao === 'sessao_escala') {
        extrairParaSet(s.questaoIds, setEscala);
        extrairParaSet(s.questao_ids, setEscala);
        if (Array.isArray(s.questoesSnap)) {
          s.questoesSnap.forEach((sq: any) => {
            if (sq && sq.id != null) {
              setEscala.add(String(sq.id).trim());
              if (!isNaN(Number(sq.id))) setEscala.add(Number(sq.id));
            }
          });
        }
      } else if (tipoSessao === 'simulado') {
        extrairParaSet(s.questaoIds, setSimulados);
        extrairParaSet(s.questao_ids, setSimulados);
        if (Array.isArray(s.questoesSnap)) {
          s.questoesSnap.forEach((sq: any) => {
            if (sq && sq.id != null) {
              setSimulados.add(String(sq.id).trim());
              if (!isNaN(Number(sq.id))) setSimulados.add(Number(sq.id));
            }
          });
        }
      }
    };

    // 1. Sessões criadas em memória / Supabase
    sessoesCriadas.forEach(processarSessao);

    // 2. Sessões locais salvas no localStorage (chave STORAGE_KEYS.SESSOES)
    try {
      const localSess: any[] = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SESSOES) ||
        localStorage.getItem('gb_sessoescriadas') ||
        localStorage.getItem('gb_sessoes') ||
        '[]'
      );
      if (Array.isArray(localSess)) {
        localSess.forEach(processarSessao);
      }
    } catch {}

    // 3. Questões com marcação direta em propriedades
    questoes.forEach((q) => {
      const idStr = String(q.id || '').toLowerCase();
      const ass = String(q.assunto || '').toLowerCase();
      const dis = String(q.disciplina || '').toLowerCase();
      const orig = String((q as any).origem || '').toLowerCase();
      const tipo = String((q as any).tipo || '').toLowerCase();

      // Provas Anteriores (Somente Provas Reais Oficiais)
      const ehVerdadeiraProva =
        ehIdDeProvaAnterior(q.id) ||
        idStr.startsWith('fafipa_') ||
        idStr.startsWith('prv_') ||
        Boolean(encontrarQuestaoCanonicaProvaAnterior(q)) ||
        (q.origemTipo === 'prova_passada' &&
          !idStr.startsWith('sim_') &&
          !idStr.startsWith('lote') &&
          !q.loteCodigo &&
          !ass.includes('simulado') &&
          !dis.includes('simulado'));

      if (ehVerdadeiraProva) {
        setProvasAnteriores.add(String(q.id).trim());
        if (!isNaN(Number(q.id))) setProvasAnteriores.add(Number(q.id));
        return;
      }

      // Escala
      if (
        q.origemTipo === 'lote_escala' ||
        orig === 'sessao_escala' ||
        tipo === 'sessao_escala' ||
        Boolean(q.loteCodigo) ||
        idStr.startsWith('lote') ||
        ass.includes('lote') ||
        dis.includes('lote')
      ) {
        setEscala.add(String(q.id).trim());
        if (!isNaN(Number(q.id))) setEscala.add(Number(q.id));
        return;
      }

      // Simulados (apenas se NÃO for de escala nem prova passada)
      if (
        !idStr.startsWith('fafipa_') &&
        !idStr.startsWith('prv_') &&
        (q.origemTipo === 'simulado' ||
          orig === 'simulado' ||
          (q as any).simulado === true ||
          idStr.startsWith('sim_') ||
          ((ass.includes('simulado') || dis.includes('simulado')) && !ass.includes('lote') && !dis.includes('lote')))
      ) {
        setSimulados.add(String(q.id).trim());
        if (!isNaN(Number(q.id))) setSimulados.add(Number(q.id));
      }
    });

    // 4. Sessão ativa atual
    if (sessaoAtiva) {
      processarSessao(sessaoAtiva);
    }

    // 5. Histórico de tentativas gravadas com origem 'simulado'
    Object.entries(historicoRespostas).forEach(([qid, tentativas]) => {
      if (Array.isArray(tentativas)) {
        const temSimulado = tentativas.some(
          (t) => (t as any).origem === 'simulado' || (t as any).origemSessao === 'simulado'
        );
        if (temSimulado) {
          const qidStr = String(qid).trim();
          if (!setEscala.has(qidStr) && !setProvasAnteriores.has(qidStr)) {
            setSimulados.add(qidStr);
            if (!isNaN(Number(qid))) setSimulados.add(Number(qid));
          }
        }
      }
    });

    // 6. LocalStorage cache de IDs de questões de simulados, escala e provas anteriores
    try {
      const localSimuladosIds = JSON.parse(localStorage.getItem('gb_questoes_simulados_ids') || '[]');
      if (Array.isArray(localSimuladosIds)) {
        localSimuladosIds.forEach((id: any) => {
          if (id != null) {
            const idStr = String(id).trim();
            if (!setEscala.has(idStr) && !setProvasAnteriores.has(idStr)) {
              setSimulados.add(idStr);
              if (!isNaN(Number(id))) setSimulados.add(Number(id));
            }
          }
        });
      }
    } catch {}

    try {
      const localEscalaIds = JSON.parse(localStorage.getItem('gb_questoes_escala_ids') || '[]');
      if (Array.isArray(localEscalaIds)) {
        localEscalaIds.forEach((id: any) => {
          if (id != null) {
            const idStr = String(id).trim();
            setEscala.add(idStr);
            if (!isNaN(Number(id))) setEscala.add(Number(id));
          }
        });
      }
    } catch {}

    try {
      const localProvasIds = JSON.parse(localStorage.getItem('gb_questoes_provas_anteriores_ids') || '[]');
      if (Array.isArray(localProvasIds)) {
        localProvasIds.forEach((id: any) => {
          if (id != null) {
            const idStr = String(id).trim().toLowerCase();
            if (ehIdDeProvaAnterior(id) || idStr.startsWith('fafipa_') || idStr.startsWith('prv_')) {
              setProvasAnteriores.add(String(id).trim());
              if (!isNaN(Number(id))) setProvasAnteriores.add(Number(id));
            }
          }
        });
      }
    } catch {}

    return {
      idsQuestoesSimulados: setSimulados,
      idsQuestoesEscala: setEscala,
      idsQuestoesProvasAnteriores: setProvasAnteriores,
    };
  }, [sessoesCriadas, questoes, sessaoAtiva, historicoRespostas]);

  const contagensChipsBanco = useMemo(() => {
    return calcularContagensChipsBanco(
      questoes,
      snapshotHistoricoBanco,
      idsQuestoesSimulados,
      idsQuestoesEscala,
      idsQuestoesProvasAnteriores
    );
  }, [questoes, snapshotHistoricoBanco, idsQuestoesSimulados, idsQuestoesEscala, idsQuestoesProvasAnteriores]);

  // Contagem de duplicatas no banco para controle de qualidade e higienização
  const duplicatasBancoCount = useMemo(() => {
    const normMap = new Map<string, number>();
    let dupes = 0;
    questoes.forEach((q) => {
      const k = normalizarEnunciadoParaDeduplicacao(q.enunciado);
      if (!k) return;
      const count = normMap.get(k) || 0;
      if (count > 0) dupes++;
      normMap.set(k, count + 1);
    });
    return dupes;
  }, [questoes]);

  // Contagens dos sub-filtros do Caderno de Erros (para os badges das pílulas de seleção múltipla)
  // Contagens dos sub-filtros do Caderno de Erros (para os badges das pílulas de seleção múltipla)
  // Utiliza estritamente a função centralizada e sanitizada obterMetricasCadernoErrosSanitizadas
  const contagensCaderno = useMemo(() => {
    const res = obterMetricasCadernoErrosSanitizadas(questoes, snapshotHistoricoBanco);
    return {
      reincidente: res.reincidente,
      inedito: res.inedito,
      recuperada: res.recuperada,
      total: res.total,
    };
  }, [questoes, snapshotHistoricoBanco]);

  const toggleChipFiltroBanco = (chip: TipoChipFiltroBanco) => {
    setChipsFiltroBanco((prev) => {
      if (statusFiltroBanco === 'caderno-erros') {
        setStatusFiltroBanco('todas');
      }
      const next = prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip];
      // Ao ativar filtros de escopo global (simulados, em escala ou provas anteriores), limpa filtros específicos de assunto, banca e seleção de blocos
      if (
        (!prev.includes('simulados') && next.includes('simulados')) ||
        (!prev.includes('em-escala') && next.includes('em-escala')) ||
        (!prev.includes('provas-anteriores') && next.includes('provas-anteriores'))
      ) {
        setFiltroAssunto('');
        setFiltroBanca('');
        setBancoBlocosSelecionados([]);
        setBancoMateriasSelecionadas([]);
      }
      return next;
    });
    setIndiceBanco(0);
    setRespostasBancoTemp({});
  };

  const limparChipsFiltroBanco = () => {
    setChipsFiltroBanco([]);
    setStatusFiltroBanco('todas');
    setIndiceBanco(0);
    setRespostasBancoTemp({});
  };

  // Alterna a seleção múltipla de sub-filtros do Caderno de Erros (Reincidentes, Inéditos, Recuperadas)
  const toggleChipFiltroCaderno = (st: StatusErroCaderno) => {
    setChipsFiltroCaderno((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
    setIndiceBanco(0);
    setBancoQuestaoAtualId(null);
    setFeedbackCaderno(null);
    setPopupResultadoCaderno(null);
    setMostrarComentarioCaderno(false);
    setRespostasBancoTemp({});
    setBancoTimerSegundos(0);
    setBancoTimerAtivo(true);
  };

  const limparChipsFiltroCaderno = () => {
    setChipsFiltroCaderno([]);
    setIndiceBanco(0);
    setBancoQuestaoAtualId(null);
    setFeedbackCaderno(null);
    setPopupResultadoCaderno(null);
    setMostrarComentarioCaderno(false);
    setRespostasBancoTemp({});
    setBancoTimerSegundos(0);
    setBancoTimerAtivo(true);
  };

  const questoesFiltradasBanco = useMemo(() => {
    const filtradas = aplicarFiltrosMultiplosBanco({
      questoes,
      snapshotHistorico: snapshotHistoricoBanco,
      idsSimulados: idsQuestoesSimulados,
      idsEscala: idsQuestoesEscala,
      idsProvasAnteriores: idsQuestoesProvasAnteriores,
      chipsSelecionados: chipsFiltroBanco,
      modoCadernoAtivo: statusFiltroBanco === 'caderno-erros',
      modoFiltroCaderno,
      chipsCadernoSelecionados: chipsFiltroCaderno,
      filtroPalavra,
      bancoBlocosSelecionados,
      bancoMateriasSelecionadas,
      gruposBlocosFiltro,
    }).filter((q) => {
      const matchAss =
        !filtroAssunto ||
        q.assunto === filtroAssunto ||
        (q.assunto && q.assunto.toLowerCase().includes(filtroAssunto.toLowerCase())) ||
        (filtroAssunto && filtroAssunto.toLowerCase().includes((q.assunto || '').toLowerCase()));
      const matchBan =
        !filtroBanca ||
        q.banca === filtroBanca ||
        (filtroBanca.toLowerCase().includes('fafipa') && String(q.banca || '').toLowerCase().includes('fafipa'));
      return matchAss && matchBan;
    });

    // Se estiver no Caderno de Erros, aplica a ordenação mandatória:
    // Critério: da mais antiga (errou há mais dias) primeiro, e as mais recentes pro final
    if (statusFiltroBanco === 'caderno-erros') {
      return [...filtradas].sort((a, b) => {
        const histA = snapshotHistoricoBanco[String(a.id)] || snapshotHistoricoBanco[Number(a.id)] || [];
        const histB = snapshotHistoricoBanco[String(b.id)] || snapshotHistoricoBanco[Number(b.id)] || [];
        const infoA = classificarStatusCaderno(histA);
        const infoB = classificarStatusCaderno(histB);

        const timeA = infoA?.ultimaTentativa?.data || infoA?.ultimoErroData || 0;
        const timeB = infoB?.ultimaTentativa?.data || infoB?.ultimoErroData || 0;

        if (timeA !== timeB) {
          return timeA - timeB;
        }

        const prio: Record<StatusErroCaderno, number> = { reincidente: 0, inedito: 1, recuperada: 2 };
        const statusA = infoA ? infoA.status : 'inedito';
        const statusB = infoB ? infoB.status : 'inedito';
        const diff = prio[statusA] - prio[statusB];
        if (diff !== 0) return diff;

        return String(a.id).localeCompare(String(b.id));
      });
    }

    return filtradas;
  }, [
    questoes,
    snapshotHistoricoBanco,
    idsQuestoesSimulados,
    idsQuestoesEscala,
    idsQuestoesProvasAnteriores,
    chipsFiltroBanco,
    statusFiltroBanco,
    modoFiltroCaderno,
    chipsFiltroCaderno,
    filtroPalavra,
    bancoBlocosSelecionados,
    bancoMateriasSelecionadas,
    gruposBlocosFiltro,
    filtroAssunto,
    filtroBanca,
  ]);

  const responderQuestaoBanco = async (questaoId: number | string, escolhaIdx: number) => {
    const q = questoes.find((item) => String(item.id) === String(questaoId));
    if (!q) return;

    const tempoGasto = Math.max(1, bancoTimerSegundos);
    const acertou = escolhaIdx === q.correta;
    const isCaderno = statusFiltroBanco === 'caderno-erros';

    const tentativa: TentativaResposta = {
      questaoId,
      escolha: escolhaIdx,
      acertou,
      data: Date.now(),
      tempoSegundos: tempoGasto,
      origem: isCaderno ? 'caderno' : 'banco',
    };

    // Dispara o pop-up chamativo e minimalista de 3 segundos ao lado direito do Timer
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }
    setPopupResultadoCaderno({
      tipo: acertou ? 'acertou' : 'errou',
      timestamp: Date.now(),
    });
    popupTimeoutRef.current = setTimeout(() => {
      setPopupResultadoCaderno(null);
    }, 3000);

    if (isCaderno) {
      // No Caderno de Erros: a questão se mantém neutra para o usuário poder marcá-la novamente
      // Não trava nem grifa o gabarito. O timer reinicia para contabilizar a próxima tentativa.
      setBancoTimerSegundos(0);
      setBancoTimerAtivo(true);
      setRespostasBancoTemp((prev) => {
        if (!prev[questaoId]) return prev;
        const clone = { ...prev };
        delete clone[questaoId];
        return clone;
      });
      setFeedbackCaderno({
        questaoId,
        status: acertou ? 'recuperada' : 'reincidente',
      });
      setBancoQuestaoAtualId(questaoId);
    } else {
      // Encerra o timer imediatamente ao responder no Banco geral
      setBancoTimerAtivo(false);
      setRespostasBancoTemp((prev) => ({
        ...prev,
        [questaoId]: { escolha: escolhaIdx, acertou },
      }));
    }

    setHistoricoRespostas((prev) => {
      const key = String(questaoId);
      const arr = prev[key] ? [...prev[key], tentativa] : [tentativa];
      return { ...prev, [key]: arr };
    });

    await salvarTentativaDb(questaoId, {
      escolha: escolhaIdx,
      acertou,
      data: tentativa.data,
      tempoSegundos: tempoGasto,
      origem: isCaderno ? 'caderno' : 'banco',
    });

    // Registra o tempo gasto individual nesta questão para somar nas métricas de "Tempo em Questões" / "Tempo Revisando Erros"
    const regBanco: RegistroTempoSessao = {
      id: `${isCaderno ? 'caderno' : 'banco'}_q_${questaoId}_${tentativa.data}`,
      tipo: isCaderno ? 'caderno' : 'banco',
      questaoId,
      titulo: isCaderno
        ? `Caderno de Erros: ${q.assunto || q.disciplina || 'Questão'}`
        : `Questão: ${q.assunto || q.disciplina || 'Banco'}`,
      segundos: tempoGasto,
      data: tentativa.data,
      concluida: true,
      disciplina: q.disciplina,
      assunto: q.assunto,
      banca: q.banca,
      totalQuestoes: 1,
      acertos: acertou ? 1 : 0,
      erros: acertou ? 0 : 1,
      taxaAcerto: acertou ? 100 : 0,
    };
    await salvarRegistroTempoSessao(regBanco);
    setRegistrosTempoSessoes((prev) => [...prev, regBanco]);
  };

  const mudarQuestaoBanco = (direcao: number) => {
    const novo = indiceBanco + direcao;
    if (novo >= 0 && novo < questoesFiltradasBanco.length) {
      setIndiceBanco(novo);
      setBancoTimerSegundos(0);
      setFeedbackCaderno(null);
      setPopupResultadoCaderno(null);
      setMostrarComentarioCaderno(false);
      const proxQ = questoesFiltradasBanco[novo];
      if (proxQ) {
        setBancoQuestaoAtualId(proxQ.id);
        if (statusFiltroBanco === 'caderno-erros' || !respostasBancoTemp[proxQ.id]) {
          setBancoTimerAtivo(true);
        } else {
          setBancoTimerAtivo(false);
        }
      }
    }
  };

  const excluirQuestaoAtualBanco = async () => {
    if (questoesFiltradasBanco.length === 0) return;
    const qAtual = questoesFiltradasBanco[indiceBanco];
    if (!qAtual) return;

    if (confirm('Tem certeza que deseja excluir esta questão permanentemente do banco?')) {
      await excluirQuestaoDb(qAtual.id);
      setQuestoes((prev) => prev.filter((item) => String(item.id) !== String(qAtual.id)));
      if (indiceBanco > 0 && indiceBanco >= questoesFiltradasBanco.length - 1) {
        setIndiceBanco(indiceBanco - 1);
      }
      alert('Questão excluída com sucesso.');
    }
  };

  const handleSalvarReclassificacaoEap = async (
    novoBloco: string,
    novoAssunto: string,
    novoCargo?: string
  ) => {
    if (!questaoParaReclassificar) return;
    const qId = questaoParaReclassificar.id;

    const res = await persistirReclassificacaoQuestao(qId, novoBloco, novoAssunto, novoCargo);
    if (res.success) {
      // 1. Atualiza estado global das questões
      setQuestoes((prev) =>
        reclassificarQuestaoNaLista(prev, qId, novoBloco, novoAssunto, novoCargo)
      );

      // 2. Atualiza snapshot da sessão ativa se estiver aberta
      if (sessaoAtiva && Array.isArray(sessaoAtiva.questoesSnap)) {
        setSessaoAtiva((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            questoesSnap: reclassificarQuestaoNaLista(
              prev.questoesSnap || [],
              qId,
              novoBloco,
              novoAssunto,
              novoCargo
            ),
          };
        });
      }

      // 3. Atualiza questão no estado do modal
      setQuestaoParaReclassificar((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          disciplina: novoBloco,
          assunto: novoAssunto,
          ...(novoCargo !== undefined ? { cargo: novoCargo } : {}),
        };
      });
    }
  };

  // Mantém todas as caixas de seleção de blocos e matérias pré-selecionadas por padrão (tanto para Desempenho quanto para Banco)
  useEffect(() => {
    if (gruposBlocosFiltro.length === 0) return;

    const novosBlocos: string[] = [];
    const novasMaterias: string[] = [];
    const novosBlocosBanco: string[] = [];
    const novasMateriasBanco: string[] = [];

    gruposBlocosFiltro.forEach((grupo) => {
      if (!itensConhecidosFiltroRef.current.blocos.has(grupo.blocoNome)) {
        itensConhecidosFiltroRef.current.blocos.add(grupo.blocoNome);
        novosBlocos.push(grupo.blocoNome);
      }
      grupo.materias.forEach((m) => {
        if (!itensConhecidosFiltroRef.current.materias.has(m.key)) {
          itensConhecidosFiltroRef.current.materias.add(m.key);
          novasMaterias.push(m.key);
        }
      });

      if (!itensConhecidosBancoRef.current.blocos.has(grupo.blocoNome)) {
        itensConhecidosBancoRef.current.blocos.add(grupo.blocoNome);
        novosBlocosBanco.push(grupo.blocoNome);
      }
      grupo.materias.forEach((m) => {
        if (!itensConhecidosBancoRef.current.materias.has(m.key)) {
          itensConhecidosBancoRef.current.materias.add(m.key);
          novasMateriasBanco.push(m.key);
        }
      });
    });

    if (novosBlocos.length > 0) {
      setDesempenhoBlocosSelecionados((prev) => Array.from(new Set([...prev, ...novosBlocos])));
    }
    if (novasMaterias.length > 0) {
      setDesempenhoMateriasSelecionadas((prev) => Array.from(new Set([...prev, ...novasMaterias])));
    }

    if (novosBlocosBanco.length > 0) {
      setBancoBlocosSelecionados((prev) => Array.from(new Set([...prev, ...novosBlocosBanco])));
    }
    if (novasMateriasBanco.length > 0) {
      setBancoMateriasSelecionadas((prev) => Array.from(new Set([...prev, ...novasMateriasBanco])));
    }
  }, [gruposBlocosFiltro]);

  const listaAssuntos = useMemo(() => {
    let itens = TABELA_PDFS_ESTUDO;
    if (desempenhoBlocosSelecionados.length > 0) {
      itens = itens.filter((p) => desempenhoBlocosSelecionados.includes(p.blocoNome));
    }
    return itens.map((p) => p.nome).sort();
  }, [desempenhoBlocosSelecionados]);

  const listaBancas = useMemo(() => {
    const set = new Set<string>();
    questoes.forEach((q) => q.banca && set.add(q.banca));
    bancas.forEach((b) => b.nome && set.add(b.nome));
    sessoesCriadas.forEach((s) => s.banca && set.add(s.banca));
    return Array.from(set).filter(Boolean).sort();
  }, [questoes, bancas, sessoesCriadas]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownBlocosRef.current && !dropdownBlocosRef.current.contains(event.target as Node)) {
        setDropdownBlocosAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isBlocoMarcado = (blocoNome: string) => {
    return desempenhoBlocosSelecionados.includes(blocoNome);
  };

  const isMateriaMarcada = (materiaKey: string) => {
    return desempenhoMateriasSelecionadas.includes(materiaKey);
  };

  const toggleBloco = (blocoNome: string) => {
    const grupo = gruposBlocosFiltro.find((g) => g.blocoNome === blocoNome);
    const estaMarcado = desempenhoBlocosSelecionados.includes(blocoNome);

    if (estaMarcado) {
      setDesempenhoBlocosSelecionados((prev) => prev.filter((b) => b !== blocoNome));
      if (grupo && grupo.materias.length > 0) {
        const chavesFilhas = new Set(grupo.materias.map((m) => m.key));
        setDesempenhoMateriasSelecionadas((prev) => prev.filter((k) => !chavesFilhas.has(k)));
      }
    } else {
      setDesempenhoBlocosSelecionados((prev) => Array.from(new Set([...prev, blocoNome])));
      if (grupo && grupo.materias.length > 0) {
        const chavesFilhas = grupo.materias.map((m) => m.key);
        setDesempenhoMateriasSelecionadas((prev) => Array.from(new Set([...prev, ...chavesFilhas])));
      }
    }
  };

  const toggleMateria = (blocoNome: string, materiaKey: string) => {
    const grupo = gruposBlocosFiltro.find((g) => g.blocoNome === blocoNome);
    const estaMarcada = desempenhoMateriasSelecionadas.includes(materiaKey);

    if (estaMarcada) {
      const novasMaterias = desempenhoMateriasSelecionadas.filter((k) => k !== materiaKey);
      setDesempenhoMateriasSelecionadas(novasMaterias);

      if (grupo && grupo.materias.length > 0) {
        const restamFilhasMarcadas = grupo.materias.some(
          (m) => m.key !== materiaKey && novasMaterias.includes(m.key)
        );
        if (!restamFilhasMarcadas) {
          setDesempenhoBlocosSelecionados((prev) => prev.filter((b) => b !== blocoNome));
        }
      }
    } else {
      setDesempenhoMateriasSelecionadas((prev) => Array.from(new Set([...prev, materiaKey])));
      setDesempenhoBlocosSelecionados((prev) => Array.from(new Set([...prev, blocoNome])));
    }
  };

  const marcarTodosItens = () => {
    const todosBlocos = gruposBlocosFiltro.map((g) => g.blocoNome);
    const todasMats: string[] = [];
    gruposBlocosFiltro.forEach((g) => g.materias.forEach((m) => todasMats.push(m.key)));
    setDesempenhoBlocosSelecionados(todosBlocos);
    setDesempenhoMateriasSelecionadas(todasMats);
  };

  const desmarcarTodosItens = () => {
    setDesempenhoBlocosSelecionados([]);
    setDesempenhoMateriasSelecionadas([]);
  };

  // Handlers para o Filtro Hierárquico no Banco de Questões
  const toggleBlocoBanco = (blocoNome: string) => {
    const grupo = gruposBlocosFiltro.find((g) => g.blocoNome === blocoNome);
    const estaMarcado = bancoBlocosSelecionados.includes(blocoNome);

    if (estaMarcado) {
      setBancoBlocosSelecionados((prev) => prev.filter((b) => b !== blocoNome));
      if (grupo && grupo.materias.length > 0) {
        const chavesFilhas = new Set(grupo.materias.map((m) => m.key));
        setBancoMateriasSelecionadas((prev) => prev.filter((k) => !chavesFilhas.has(k)));
      }
    } else {
      setBancoBlocosSelecionados((prev) => Array.from(new Set([...prev, blocoNome])));
      if (grupo && grupo.materias.length > 0) {
        const chavesFilhas = grupo.materias.map((m) => m.key);
        setBancoMateriasSelecionadas((prev) => Array.from(new Set([...prev, ...chavesFilhas])));
      }
    }
    setIndiceBanco(0);
  };

  const toggleMateriaBanco = (blocoNome: string, materiaKey: string) => {
    const grupo = gruposBlocosFiltro.find((g) => g.blocoNome === blocoNome);
    const estaMarcada = bancoMateriasSelecionadas.includes(materiaKey);

    if (estaMarcada) {
      const novasMaterias = bancoMateriasSelecionadas.filter((k) => k !== materiaKey);
      setBancoMateriasSelecionadas(novasMaterias);

      if (grupo && grupo.materias.length > 0) {
        const restamFilhasMarcadas = grupo.materias.some(
          (m) => m.key !== materiaKey && novasMaterias.includes(m.key)
        );
        if (!restamFilhasMarcadas) {
          setBancoBlocosSelecionados((prev) => prev.filter((b) => b !== blocoNome));
        }
      }
    } else {
      setBancoMateriasSelecionadas((prev) => Array.from(new Set([...prev, materiaKey])));
      setBancoBlocosSelecionados((prev) => Array.from(new Set([...prev, blocoNome])));
    }
    setIndiceBanco(0);
  };

  const marcarTodosItensBanco = () => {
    const todosBlocos = gruposBlocosFiltro.map((g) => g.blocoNome);
    const todasMats: string[] = [];
    gruposBlocosFiltro.forEach((g) => g.materias.forEach((m) => todasMats.push(m.key)));
    setBancoBlocosSelecionados(todosBlocos);
    setBancoMateriasSelecionadas(todasMats);
    setIndiceBanco(0);
  };

  const desmarcarTodosItensBanco = () => {
    setBancoBlocosSelecionados([]);
    setBancoMateriasSelecionadas([]);
    setIndiceBanco(0);
  };

  const listaAssuntosBanco = useMemo(() => {
    let itens = TABELA_PDFS_ESTUDO;
    if (bancoBlocosSelecionados.length > 0) {
      itens = itens.filter((p) => bancoBlocosSelecionados.includes(p.blocoNome));
    }
    return itens.map((p) => p.nome).sort();
  }, [bancoBlocosSelecionados]);

  const totalItens = useMemo(() => {
    let count = 0;
    gruposBlocosFiltro.forEach((g) => {
      if (g.materias.length > 0) count += g.materias.length;
      else count += 1;
    });
    return count;
  }, [gruposBlocosFiltro]);

  const totalItensSelecionados = useMemo(() => {
    let count = 0;
    gruposBlocosFiltro.forEach((g) => {
      if (g.materias.length > 0) {
        g.materias.forEach((m) => {
          if (desempenhoMateriasSelecionadas.includes(m.key)) count++;
        });
      } else {
        if (desempenhoBlocosSelecionados.includes(g.blocoNome)) count++;
      }
    });
    return count;
  }, [gruposBlocosFiltro, desempenhoBlocosSelecionados, desempenhoMateriasSelecionadas]);

  const todosItensSelecionados = totalItens > 0 && totalItensSelecionados === totalItens;

  const gruposFiltrados = useMemo(() => {
    if (!buscaFiltroBloco.trim()) return gruposBlocosFiltro;
    const termo = buscaFiltroBloco.trim().toLowerCase();
    return gruposBlocosFiltro
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
      .filter((g): g is NonNullable<typeof g> => g !== null);
  }, [gruposBlocosFiltro, buscaFiltroBloco]);

  // -------------------------------------------------------------------------
  // PAINEL DE DESEMPENHO E ESTATÍSTICAS
  // -------------------------------------------------------------------------
  const mudarPeriodo = (valor: number | string) => {
    setPeriodoFiltro(valor);
    setDataInicioCustom('');
    setDataFimCustom('');
  };

  const aplicarDataPersonalizada = (dIni: string, dFim: string) => {
    if (dIni && dFim) {
      setPeriodoFiltro('custom');
      setDataInicioCustom(dIni);
      setDataFimCustom(dFim);
    }
  };

  const limparDataPersonalizada = () => {
    setDataInicioCustom('');
    setDataFimCustom('');
    mudarPeriodo(PERIODO_FILTRO_PADRAO);
  };

  const zerarEstatisticas = async () => {
    if (confirm('Tem certeza que deseja zerar todas as estatísticas e histórico de respostas?')) {
      await zerarHistoricoDb();
      setHistoricoRespostas({});
      setRespostasBancoTemp({});
      alert('Estatísticas zeradas.');
    }
  };

  const zerarTodaBase = async () => {
    if (
      confirm(
        'ATENÇÃO: Tem certeza absoluta que deseja ZERAR todos os dados, bancas, blocos, matérias, cadernos e questões?\n\nTudo será apagado da nuvem Supabase e deste dispositivo para você começar tudo do zero.'
      )
    ) {
      setLoadingData(true);
      try {
        const res = await zerarTudoDb();
        setBancas([]);
        setBlocos([]);
        setMaterias([]);
        setQuestoes([]);
        setSessoesCriadas([]);
        setHistoricoRespostas({});
        setRespostasBancoTemp({});
        setRegistrosTempoSessoes([]);
        setSessaoTempoSegundos(0);
        setSessaoTimerAtivo(false);
        setSessaoFinalizada(false);
        setSessaoAtiva(null);
        alert(res.message);
      } catch (err: any) {
        alert('Erro ao zerar base: ' + (err.message || 'Falha.'));
      } finally {
        setLoadingData(false);
      }
    }
  };

  // Total absoluto de todas as vezes que o candidato respondeu alguma questão na plataforma
  // (seja inédita ou repetida, sem distinguir erros ou acertos)
  const totalResolucoesGerais = useMemo(() => {
    let count = 0;
    Object.values(historicoRespostas).forEach((arr) => {
      if (Array.isArray(arr)) {
        count += arr.filter(
          (t) => typeof t.escolha === 'number' && !isNaN(t.escolha) && t.escolha >= 0
        ).length;
      }
    });
    return count;
  }, [historicoRespostas]);

  // Soma de todo o tempo cronometrado/estimado em todas as questões respondidas na plataforma geral
  const tempoTotalResolucoesGeraisSegundos = useMemo(() => {
    return calcularTempoTotalTodasQuestoes(historicoRespostas, {
      registrosTempo: registrosTempoSessoes,
    });
  }, [historicoRespostas, registrosTempoSessoes]);

  const statsDesempenho = useMemo(() => {
    const agora = new Date();
    const { limiteInicio, limiteFim } = calcularLimitesPeriodo(
      periodoFiltro,
      dataInicioCustom,
      dataFimCustom,
      agora,
      'America/Sao_Paulo'
    );

    const isQuestaoNoFiltro = (q: Questao) => {
      const ehSimulado = ehQuestaoSimulado(q, idsQuestoesSimulados, idsQuestoesEscala);

      // Se a questão for de simulado, contabiliza na view INÉDITO do Desempenho
      if (ehSimulado) {
        if (desempenhoFiltroBanca && q.banca !== desempenhoFiltroBanca) {
          return false;
        }
        return true;
      }

      // 1. O bloco precisa estar selecionado (com normalização de strings)
      const qDiscNorm = (q.disciplina || '').trim().toLowerCase();
      const blocoMatch = desempenhoBlocosSelecionados.some((b) => {
        const bNorm = b.trim().toLowerCase();
        return bNorm === qDiscNorm || qDiscNorm.includes(bNorm) || bNorm.includes(qDiscNorm);
      });
      if (!blocoMatch) {
        return false;
      }

      // 2. Se o bloco possui matérias cadastradas, verifica se a matéria da questão está selecionada
      if (q.assunto) {
        const chave = `${q.disciplina}:::${q.assunto}`;
        const chaveNorm = chave.trim().toLowerCase();
        const grupo = gruposBlocosFiltro.find(
          (g) => g.blocoNome.trim().toLowerCase() === qDiscNorm
        );
        const temMateriaCadastrada = grupo && grupo.materias.some((m) => m.key.trim().toLowerCase() === chaveNorm);
        if (temMateriaCadastrada) {
          const matSelecionada = desempenhoMateriasSelecionadas.some((mKey) => {
            const mNorm = mKey.trim().toLowerCase();
            return mNorm === chaveNorm || mNorm.endsWith(`:::${q.assunto.trim().toLowerCase()}`);
          });
          if (!matSelecionada) {
            return false;
          }
        }
      }

      // 3. Dropdown de Assunto
      if (desempenhoFiltroAssunto) {
        const fAssNorm = desempenhoFiltroAssunto.trim().toLowerCase();
        const qAssNorm = (q.assunto || '').trim().toLowerCase();
        if (qAssNorm !== fAssNorm && !qAssNorm.includes(fAssNorm) && !fAssNorm.includes(qAssNorm)) {
          return false;
        }
      }

      // 4. Dropdown de Banca
      if (desempenhoFiltroBanca) {
        const fBancaNorm = desempenhoFiltroBanca.trim().toLowerCase();
        const qBancaNorm = (q.banca || '').trim().toLowerCase();
        if (qBancaNorm !== fBancaNorm && !qBancaNorm.includes(fBancaNorm)) {
          return false;
        }
      }

      return true;
    };

    // Na View INÉDITO, avalia ESTRITAMENTE a 1ª resolução cronológica da questão (sanitizadas[0]).
    // Tentativas posteriores de revisão/recuperação jamais alteram ou inflam as métricas do Modo Inédito.
    const primeirasTentativasIneditas: { questaoId: string | number; escolha: number; acertou: boolean; data: number }[] = [];

    Object.keys(historicoRespostas).forEach((qId) => {
      const arr = historicoRespostas[qId];
      if (arr && arr.length > 0) {
        // Sanitiza defensivamente em janela de 5s e ordena cronologicamente
        const sanitizadas = sanitizarHistoricoTentativasDefensivo(arr);
        if (sanitizadas.length > 0) {
          // Contabiliza ESTRITAMENTE a 1ª tentativa histórica (sanitizadas[0])
          const primeira = sanitizadas[0];
          const q = questoes.find((item) => String(item.id) === String(qId));

          if (q && primeira.data >= limiteInicio && primeira.data <= limiteFim) {
            if (isQuestaoNoFiltro(q)) {
              primeirasTentativasIneditas.push({ questaoId: qId, ...primeira });
            }
          }
        }
      }
    });

    const totalResolvidas = primeirasTentativasIneditas.length;
    const acertos = primeirasTentativasIneditas.filter((r) => r.acertou).length;
    const erros = totalResolvidas - acertos;
    const taxaAcerto = totalResolvidas > 0 ? Math.round((acertos / totalResolvidas) * 100) : 0;

    // Aggregation by Disciplina / Bloco and by Assunto / Lei
    const disciplinasStats: Record<string, { total: number; acertos: number; erros: number }> = {};
    const assuntosStats: Record<string, { total: number; acertos: number; erros: number; disciplina: string }> = {};

    questoes.forEach((q) => {
      if (isQuestaoNoFiltro(q)) {
        const disc = q.disciplina || 'Simulados Oficiais (FAFIPA)';
        const ass = q.assunto || 'Simulado Ponderado';
        if (!disciplinasStats[disc]) {
          disciplinasStats[disc] = { total: 0, acertos: 0, erros: 0 };
        }
        if (!assuntosStats[ass]) {
          assuntosStats[ass] = { total: 0, acertos: 0, erros: 0, disciplina: disc };
        }
      }
    });

    primeirasTentativasIneditas.forEach((r) => {
      const q = questoes.find((item) => String(item.id) === String(r.questaoId));
      if (q) {
        const disc = q.disciplina || 'Simulados Oficiais (FAFIPA)';
        const ass = q.assunto || 'Simulado Ponderado';

        if (!disciplinasStats[disc]) {
          disciplinasStats[disc] = { total: 0, acertos: 0, erros: 0 };
        }
        disciplinasStats[disc].total++;
        if (r.acertou) disciplinasStats[disc].acertos++;
        else disciplinasStats[disc].erros++;

        if (!assuntosStats[ass]) {
          assuntosStats[ass] = { total: 0, acertos: 0, erros: 0, disciplina: disc };
        }
        assuntosStats[ass].total++;
        if (r.acertou) assuntosStats[ass].acertos++;
        else assuntosStats[ass].erros++;
      }
    });

    const arrayDisciplinas = Object.keys(disciplinasStats).map((disc) => {
      const s = disciplinasStats[disc];
      const descPct = s.total > 0 ? Math.round((s.acertos / s.total) * 100) : 0;
      return { disciplina: disc, ...s, desempenho: descPct };
    });

    const arrayAssuntos = Object.keys(assuntosStats).map((ass) => {
      const s = assuntosStats[ass];
      const descPct = s.total > 0 ? Math.round((s.acertos / s.total) * 100) : 0;
      return { assunto: ass, ...s, desempenho: descPct };
    });

    // Time Series for Dual-Axis Combination Chart
    let numDias = 6;
    if (periodoFiltro === 7) numDias = 7;
    if (periodoFiltro === 30) numDias = 14;
    if (periodoFiltro === 'hoje' || periodoFiltro === 'ontem') numDias = 1;

    const agoraTime = new Date().getTime();
    const baseTime = periodoFiltro === 'ontem' ? agoraTime - 86400000 : agoraTime;

    const mapaDias: Record<string, { chave: string; label: string; acertos: number; erros: number; timestamp: number }> = {};

    for (let i = numDias - 1; i >= 0; i--) {
      const d = new Date(baseTime - i * 24 * 60 * 60 * 1000);
      const chave = d.toLocaleDateString('pt-BR');
      const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      mapaDias[chave] = {
        chave,
        label,
        acertos: 0,
        erros: 0,
        timestamp: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
      };
    }

    primeirasTentativasIneditas.forEach((t) => {
      const d = new Date(t.data);
      const chave = d.toLocaleDateString('pt-BR');
      if (!mapaDias[chave]) {
        const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        mapaDias[chave] = {
          chave,
          label,
          acertos: 0,
          erros: 0,
          timestamp: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
        };
      }
      if (t.acertou) mapaDias[chave].acertos++;
      else mapaDias[chave].erros++;
    });

    // Ordena cronologicamente por timestamp (formato DD/MM)
    let diasArray = Object.values(mapaDias).sort((a, b) => a.timestamp - b.timestamp);
    if (diasArray.length > 14) {
      diasArray = diasArray.slice(-14);
    }

    const diasMap: PontoDesempenhoDiario[] = diasArray.map((d) => {
      const totalQuestoes = d.acertos + d.erros;
      const taxaAcerto = totalQuestoes > 0 ? Math.round((d.acertos / totalQuestoes) * 100) : 0;
      return {
        chave: d.chave,
        label: d.label,
        acertos: d.acertos,
        erros: d.erros,
        totalQuestoes,
        taxaAcerto,
      };
    });

    // Quantitativo de tempo em sessões no período e filtros selecionados (Bloco, Matéria, Banca)
    let listaRegistros = [...registrosTempoSessoes];

    // Inclui e consolida tempos gravados diretamente nas sessões criadas
    sessoesCriadas.forEach((s) => {
      const info = obterInfoConclusaoSessao(s, registrosTempoSessoes, historicoRespostas, s.codigo);
      const tempo = Math.max(Number(s.tempoSegundos) || 0, Number(info.segundos) || 0);
      if (tempo > 0) {
        const jaConsta = listaRegistros.some(
          (r) =>
            (s.id !== undefined && s.id !== null && r.sessaoId !== undefined && String(r.sessaoId) === String(s.id)) ||
            (s.codigo && r.codigo && r.codigo.trim().toLowerCase() === s.codigo.trim().toLowerCase())
        );
        if (!jaConsta) {
          listaRegistros.push({
            id: `sessao_${s.id || s.codigo}`,
            sessaoId: s.id,
            codigo: s.codigo,
            titulo: `${s.codigo || ''} ${s.assunto || ''}`.trim(),
            segundos: tempo,
            data: info.data || (s.created_at ? new Date(s.created_at).getTime() : Date.now()),
            disciplina: s.disciplina,
            assunto: s.assunto,
            banca: s.banca,
            concluida: info.concluida,
          });
        }
      }
    });

    if (sessaoAtiva && sessaoTempoSegundos > 0) {
      const idxExistente = listaRegistros.findIndex(
        (r) =>
          (sessaoAtiva.sessaoId && r.sessaoId && String(r.sessaoId) === String(sessaoAtiva.sessaoId)) ||
          (sessaoAtiva.codigo && r.codigo && r.codigo === sessaoAtiva.codigo)
      );
      if (idxExistente >= 0) {
        listaRegistros[idxExistente] = {
          ...listaRegistros[idxExistente],
          segundos: Math.max(listaRegistros[idxExistente].segundos, sessaoTempoSegundos),
          disciplina: listaRegistros[idxExistente].disciplina || sessaoAtiva.disciplina,
          assunto: listaRegistros[idxExistente].assunto || sessaoAtiva.assunto,
          banca: listaRegistros[idxExistente].banca || sessaoAtiva.banca,
        };
      } else {
        listaRegistros.push({
          id: `sessao_ativa_${sessaoAtiva.sessaoId || 'temp'}`,
          sessaoId: sessaoAtiva.sessaoId,
          codigo: sessaoAtiva.codigo,
          titulo: sessaoAtiva.titulo,
          segundos: sessaoTempoSegundos,
          data: Date.now(),
          disciplina: sessaoAtiva.disciplina,
          assunto: sessaoAtiva.assunto,
          banca: sessaoAtiva.banca,
        });
      }
    }

    // Quantitativo de tempo em questões no período e filtros selecionados (Bloco, Matéria, Banca)
    // Consolida tanto o tempo em sessões quanto o tempo de respostas no Banco de Questões
    const tempoSegundosSessoesSomadas = somarTempoSessoes(
      listaRegistros,
      limiteInicio,
      limiteFim,
      {
        disciplinas: desempenhoBlocosSelecionados,
        materiasFiltro: desempenhoMateriasSelecionadas,
        assunto: desempenhoFiltroAssunto,
        banca: desempenhoFiltroBanca,
        sessoesCriadas,
        questoes,
        materias,
        blocos,
      }
    );
    const tempoSegundosHistoricoEstimado = calcularTempoTotalTodasQuestoes(historicoRespostas, {
      limiteInicio,
      limiteFim,
      isQuestaoNoFiltro: (qId) => {
        const q = questoes.find((item) => String(item.id) === String(qId));
        return q ? isQuestaoNoFiltro(q) : true;
      },
      registrosTempo: listaRegistros,
    });
    const tempoSegundosQuestoes = Math.max(tempoSegundosSessoesSomadas, tempoSegundosHistoricoEstimado);
    const tempoEmQuestoes = formatarTempoHorasMinutos(tempoSegundosQuestoes);

    // Métrica de ritmo min/q calculada estritamente sobre as sessões (não diluída pelo banco de questões)
    const registrosApenasSessoes = listaRegistros.filter((r) => r.tipo !== 'banco');
    const tempoSegundosApenasSessoes = somarTempoSessoes(
      registrosApenasSessoes,
      limiteInicio,
      limiteFim,
      {
        disciplinas: desempenhoBlocosSelecionados,
        materiasFiltro: desempenhoMateriasSelecionadas,
        assunto: desempenhoFiltroAssunto,
        banca: desempenhoFiltroBanca,
        sessoesCriadas,
        questoes,
        materias,
        blocos,
      }
    );
    let totalQuestoesSessoes = 0;
    registrosApenasSessoes.forEach((r) => {
      totalQuestoesSessoes += Number(r.totalQuestoes) || (Number(r.acertos || 0) + Number(r.erros || 0)) || 0;
    });
    const ritmoMQFormatado = formatarMinutosPorQuestao(totalQuestoesSessoes || totalResolvidas, tempoSegundosApenasSessoes);
    const ritmoQMinFormatado = formatarQuestoesPorMinuto(totalQuestoesSessoes || totalResolvidas, tempoSegundosApenasSessoes);

    // -------------------------------------------------------------------------
    // MÉTRICAS E GRÁFICOS DO MODO "RECUPERAÇÃO" (CADERNO DE ERROS)
    // -------------------------------------------------------------------------
    const metricasRecuperacao = calcularMetricasRecuperacao(
      questoes,
      historicoRespostas,
      listaRegistros,
      limiteInicio,
      limiteFim,
      isQuestaoNoFiltro,
      sessoesCriadas
    );

    // Time Series diária para o gráfico no modo RECUPERAÇÃO
    // Barra verde = questões recuperadas; Barra vermelha = erros reincidentes; Linha amarela = taxa de recuperação
    const mapaDiasRecuperacao: Record<
      string,
      {
        chave: string;
        label: string;
        recuperadas: number;
        reincidentes: number;
        totalResolvidas: number;
        timestamp: number;
      }
    > = {};

    for (const chave in mapaDias) {
      mapaDiasRecuperacao[chave] = {
        chave,
        label: mapaDias[chave].label,
        recuperadas: 0,
        reincidentes: 0,
        totalResolvidas: 0,
        timestamp: mapaDias[chave].timestamp,
      };
    }

    questoes.forEach((q) => {
      if (!isQuestaoNoFiltro(q)) return;
      const todasTentativas = historicoRespostas[String(q.id)] || historicoRespostas[Number(q.id)] || [];
      const temAlgumErroHistorico = todasTentativas.some((t) => !t.acertou);
      if (!temAlgumErroHistorico) return;

      // Agrupa tentativas no período por dia que foram realizadas ESTRITAMENTE no Caderno de Erros
      const tentativasPorDia: Record<string, TentativaResposta[]> = {};
      todasTentativas.forEach((t) => {
        if (
          t.data >= limiteInicio &&
          t.data <= limiteFim &&
          ehTentativaDoCaderno(t, todasTentativas, sessoesCriadas, listaRegistros)
        ) {
          const d = new Date(t.data);
          const chave = d.toLocaleDateString('pt-BR');
          if (!tentativasPorDia[chave]) tentativasPorDia[chave] = [];
          tentativasPorDia[chave].push(t);
        }
      });

      Object.keys(tentativasPorDia).forEach((chaveDia) => {
        const tDoDia = tentativasPorDia[chaveDia];
        const ultimaDoDia = tDoDia[tDoDia.length - 1];

        if (!mapaDiasRecuperacao[chaveDia]) {
          const d = new Date(ultimaDoDia.data);
          const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
          mapaDiasRecuperacao[chaveDia] = {
            chave: chaveDia,
            label,
            recuperadas: 0,
            reincidentes: 0,
            totalResolvidas: 0,
            timestamp: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
          };
        }

        // Incrementa o total de questões do caderno que tiveram resolução neste dia
        mapaDiasRecuperacao[chaveDia].totalResolvidas++;

        if (ultimaDoDia.acertou) {
          mapaDiasRecuperacao[chaveDia].recuperadas++;
        } else {
          mapaDiasRecuperacao[chaveDia].reincidentes++;
        }
      });
    });

    let diasArrayRecup = Object.values(mapaDiasRecuperacao).sort((a, b) => a.timestamp - b.timestamp);
    if (diasArrayRecup.length > 14) {
      diasArrayRecup = diasArrayRecup.slice(-14);
    }

    const diasMapRecuperacao: PontoDesempenhoDiario[] = diasArrayRecup.map((d) => {
      // O denominador é o total de questões do caderno resolvidas no dia, garantindo paridade exata com a Taxa de Recuperação dos cards
      const total = d.totalResolvidas > 0 ? d.totalResolvidas : d.recuperadas + d.reincidentes;
      const taxa = total > 0 ? Math.round((d.recuperadas / total) * 100) : 0;
      return {
        chave: d.chave,
        label: d.label,
        acertos: d.recuperadas,
        erros: d.reincidentes,
        totalQuestoes: total,
        taxaAcerto: taxa,
      };
    });

    return {
      totalResolvidas,
      acertos,
      erros,
      taxaAcerto,
      arrayDisciplinas,
      arrayAssuntos,
      diasMap,
      diasMapRecuperacao,
      metricasRecuperacao,
      tempoSegundosQuestoes,
      tempoEmQuestoes,
      tempoSegundosSessoes: tempoSegundosQuestoes,
      tempoEmSessoes: tempoEmQuestoes,
      ritmoMQFormatado,
      ritmoQMinFormatado,
    };
  }, [
    periodoFiltro,
    dataInicioCustom,
    dataFimCustom,
    desempenhoBlocosSelecionados,
    desempenhoMateriasSelecionadas,
    gruposBlocosFiltro,
    desempenhoFiltroAssunto,
    desempenhoFiltroBanca,
    historicoRespostas,
    questoes,
    registrosTempoSessoes,
    sessoesCriadas,
    materias,
    blocos,
    sessaoAtiva,
    sessaoTempoSegundos,
    idsQuestoesSimulados,
    idsQuestoesEscala,
  ]);

  const toggleOrdemDisciplina = () => {
    setOrdemDesempenhoDisciplina((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const toggleOrdemAssunto = () => {
    setOrdemDesempenhoAssunto((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const disciplinasOrdenadas = useMemo(() => {
    const lista = [...statsDesempenho.arrayDisciplinas];
    if (!ordemDesempenhoDisciplina) return lista;
    return lista.sort((a, b) => {
      if (a.desempenho !== b.desempenho) {
        return ordemDesempenhoDisciplina === 'asc'
          ? a.desempenho - b.desempenho
          : b.desempenho - a.desempenho;
      }
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      return a.disciplina.localeCompare(b.disciplina);
    });
  }, [statsDesempenho.arrayDisciplinas, ordemDesempenhoDisciplina]);

  const assuntosOrdenados = useMemo(() => {
    const lista = [...statsDesempenho.arrayAssuntos];
    if (!ordemDesempenhoAssunto) return lista;
    return lista.sort((a, b) => {
      if (a.desempenho !== b.desempenho) {
        return ordemDesempenhoAssunto === 'asc'
          ? a.desempenho - b.desempenho
          : b.desempenho - a.desempenho;
      }
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      return a.assunto.localeCompare(b.assunto);
    });
  }, [statsDesempenho.arrayAssuntos, ordemDesempenhoAssunto]);

  // Métricas consolidadas da 3ª View de Desempenho (SIMULADOS)
  const statsSimulados = useMemo(() => {
    return calcularMetricasViewSimulados(sessoesCriadas, registrosTempoSessoes);
  }, [sessoesCriadas, registrosTempoSessoes]);

  // Mapa de disponibilidade no banco para conferência da rodada do simulado
  const mapaDisponibilidadeBanco = useMemo(() => {
    const mapa: Record<string, number> = {};
    TABELA_PDFS_ESTUDO.forEach((pdf) => {
      const match = questoes.filter((q) => {
        const d = (q.disciplina || '').toLowerCase();
        const a = (q.assunto || '').toLowerCase();
        const c = pdf.codigo.toLowerCase();
        const n = pdf.nome.toLowerCase();
        return (
          a.includes(c) ||
          a.includes(n) ||
          d.includes(c) ||
          (pdf.blocoNumero ? d.includes(`bloco ${pdf.blocoNumero}`) : false)
        );
      });
      mapa[pdf.codigo] = match.length;
    });
    return mapa;
  }, [questoes]);

  const abrirConferenciaSimulado = (total: number = 40) => {
    const dist = calcularDistribuicaoSimuladoPonderado(total);
    setDistribuicaoSimulado(dist);
    setModalSimuladoAberto(true);
  };

  const sortearNovamenteSimulado = () => {
    const dist = calcularDistribuicaoSimuladoPonderado(distribuicaoSimulado.totalQuestoes || 40);
    setDistribuicaoSimulado(dist);
  };

  const iniciarSimuladoReal = async () => {
    if (gerandoSimulado) return;

    const totalAlvo = distribuicaoSimulado.totalQuestoes || 40;
    // 1. Grade de 40 slots de formatos: 22 Diretas (55%), 7 Assertivas (18%), 5 Negativas (12%), 3 Lacunas (8%), 3 V/F (7%)
    const gradeTipologias = gerarGradeTipologiasFafipa(totalAlvo);
    // 2. Grade de 40 slots de dificuldade: 16 Fáceis (40%), 16 Médias (40%), 8 Cascudas (20%)
    // Distribuídas proporcionalmente: Português (2F, 2M, 1C), Informática (2F, 2M, 1C), Engenharia (12F, 12M, 6C)
    const gradeDificuldades = gerarGradeDificuldadeFafipa(totalAlvo);

    if (modoFonteSimulado === 'banco') {
      // 1. Captar do Banco de Questões existente respeitando filtros temáticos e régua de dificuldade
      const questoesSorteio: Questao[] = [];
      const idsJaAdicionados = new Set<string | number>();

      distribuicaoSimulado.itens.forEach((item, itemIdx) => {
        if (item.quantidade <= 0) return;
        const candidatas = questoes.filter((q) => {
          if (idsJaAdicionados.has(q.id)) return false;
          const d = (q.disciplina || '').toLowerCase();
          const a = (q.assunto || '').toLowerCase();
          const c = item.pdf.codigo.toLowerCase();
          return (
            a.includes(c) ||
            a.includes(item.pdf.nome.toLowerCase()) ||
            (item.pdf.blocoNumero ? d.includes(`bloco ${item.pdf.blocoNumero}`) : false)
          );
        });

        // Prioriza questões inéditas (que o usuário ainda não respondeu)
        candidatas.sort((a, b) => {
          const respA = (historicoRespostas[a.id] || []).length;
          const respB = (historicoRespostas[b.id] || []).length;
          return respA - respB;
        });

        const selecionadas = candidatas.slice(0, item.quantidade);
        selecionadas.forEach((q) => {
          idsJaAdicionados.add(q.id);
          questoesSorteio.push(q);
        });
      });

      // Se o banco ainda tiver menos questões do que a cota total de 40, completa com outras questões disponíveis
      if (questoesSorteio.length < totalAlvo) {
        const restantes = questoes.filter((q) => !idsJaAdicionados.has(q.id));
        restantes.sort(
          (a, b) => (historicoRespostas[a.id] || []).length - (historicoRespostas[b.id] || []).length
        );
        const faltam = totalAlvo - questoesSorteio.length;
        restantes.slice(0, faltam).forEach((q) => {
          idsJaAdicionados.add(q.id);
          questoesSorteio.push(q);
        });
      }

      if (questoesSorteio.length === 0) {
        alert(
          'Nenhuma questão encontrada no banco de dados para gerar o simulado. Você pode alternar para "Gerar Questões Inéditas" ou cadastrar questões primeiro.'
        );
        return;
      }

      // Sanitiza qualquer resquício de LaTeX TeX das questões do banco
      const questoesSanitizadas = questoesSorteio.map((q) => ({
        ...q,
        enunciado: limparSintaxeLatex(q.enunciado),
        alternativas: (q.alternativas || []).map(limparSintaxeLatex),
        comentario: limparSintaxeLatex(q.comentario),
      }));

      // Ordenação oficial da prova: Q1-5 Português, Q6-10 Informática, Q11-40 Específicas aleatórias, com gabarito balanceado 8A, 8B, 8C, 8D, 8E
      const questoesBalanceadas = estruturarSimuladoOficialOrdenado(questoesSanitizadas, totalAlvo);

      const countSim =
        sessoesCriadas.filter((s) => String(s.codigo || '').toUpperCase().startsWith('SIM-CTBA-')).length +
        1;
      const codSim = `SIM-CTBA-${String(countSim).padStart(2, '0')}`;

      const novaSessao: SessaoCriada = {
        codigo: codSim,
        dataHora: new Date().toLocaleString('pt-BR'),
        banca: 'FAFIPA',
        cargo: 'Engenheiro Civil',
        disciplina: 'Prefeitura de Curitiba (Prova Real)',
        assunto: `Simulado Ponderado FAFIPA (${questoesBalanceadas.length}Q)`,
        quantidade: questoesBalanceadas.length,
        questaoIds: questoesBalanceadas.map((q) => q.id),
        tipo: 'simulado',
        tempoSegundos: 0,
        concluida: false,
        questoesSnap: questoesBalanceadas,
      };

      try {
        const salva = await salvarSessaoDb(novaSessao);
        try {
          const prevCache = JSON.parse(localStorage.getItem('gb_questoes_simulados_ids') || '[]');
          const setC = new Set([...prevCache, ...questoesBalanceadas.map((q) => q.id), ...questoesBalanceadas.map((q) => String(q.id).trim())]);
          localStorage.setItem('gb_questoes_simulados_ids', JSON.stringify(Array.from(setC)));
        } catch (e) {}
        setSessoesCriadas((prev) => [
          salva,
          ...prev.filter((s) => s.id !== salva.id && s.codigo !== salva.codigo),
        ]);
        setModalSimuladoAberto(false);
        iniciarSessaoAtiva(salva.questaoIds, `Simulado Oficial: ${codSim} (${salva.quantidade}Q)`, salva, true);
        setActiveTab('sessoes');
      } catch (err: any) {
        alert('Erro ao criar sessão de simulado: ' + (err.message || 'Falha'));
      }
    } else {
      // 2. Gerar Questões Inéditas via IA com Molde de Tipologia e Dificuldade Obrigatório por Questão
      setGerandoSimulado(true);
      setProgressoSimuladoPct(5);
      setProgressoSimulado('Alinhando a mira com o edital e iniciando auditoria da EAP...');

      try {
        const itensComQtd = distribuicaoSimulado.itens.filter((it) => it.quantidade > 0);
        const novasQuestoesCriadas: Questao[] = [];
        const feedbackAprendizado = gerarPromptAprendizadoFeedback();
        const diretrizesFafipa = `${montarInstrucoesDnaBanca(PERFIL_FAFIPA_CURITIBA)}${feedbackAprendizado ? `\n\n${feedbackAprendizado}` : ''}`;

        let slotIndex = 0;
        let totalQuestoesPlanejadasAcumulado = 0;

        for (let i = 0; i < itensComQtd.length; i++) {
          const item = itensComQtd[i];
          const pct = Math.round(5 + (i / itensComQtd.length) * 75);
          setProgressoSimuladoPct(pct);

          const qInicio = totalQuestoesPlanejadasAcumulado + 1;
          const qFim = Math.min(totalAlvo, totalQuestoesPlanejadasAcumulado + item.quantidade);
          totalQuestoesPlanejadasAcumulado += item.quantidade;
          const labelQuestoes = qFim > qInicio ? `Questões ${qInicio} a ${qFim} de ${totalAlvo}` : `Questão ${qInicio} de ${totalAlvo}`;

          setProgressoSimulado(
            `Gerando ${labelQuestoes} da Prova Oficial · ${item.pdf.nome.replace(/^\d+_/, '').replace(/_/g, ' ')} (${item.pdf.blocoNome})...`
          );

          // Coleta os moldes estruturais obrigatórios de formato e dificuldade a partir das grades oficiais
          const tipologiasDoItem: TipologiaQuestao[] = [];
          const dificuldadesDoItem: DificuldadeQuestao[] = [];
          for (let k = 0; k < item.quantidade; k++) {
            tipologiasDoItem.push(gradeTipologias[slotIndex % gradeTipologias.length]);
            dificuldadesDoItem.push(gradeDificuldades[slotIndex % gradeDificuldades.length]);
            slotIndex++;
          }

          const moldesTexto = tipologiasDoItem
            .map((tipo, idx) => {
              const dif = dificuldadesDoItem[idx];
              const moldeT = montarInstrucaoMoldeTipologia(tipo);
              const moldeD = montarInstrucaoMoldeDificuldade(dif);
              return item.quantidade > 1
                ? `DIRETRIZES DA QUESTÃO ${idx + 1}:\n${moldeT}\n\n${moldeD}`
                : `${moldeT}\n\n${moldeD}`;
            })
            .join('\n\n---\n\n');

          const direcionamento =
            item.pdf.pesoEstimado < 1.0
              ? `ATENÇÃO: Assunto com peso secundário no edital. Foque ESTRITAMENTE nos 3 a 5 conceitos fundamentais e regras gerais canônicas: ${item.pdf.topicosFundamentais.join('; ')}`
              : `Foque no padrão de cobrança da banca FAFIPA para a Prefeitura de Curitiba.`;

          const observacoesCompletas = `${diretrizesFafipa}\n\n${moldesTexto}`;

          // MODO HÍBRIDO: Cruza com os PDFs subidos em Premissas para o assunto
          const codLower = item.pdf.codigo.toLowerCase();
          const materiaPdfCorrespondente = materias.find((m) => {
            const nm = (m.nome || '').toLowerCase();
            const arq = (m.arquivoNome || '').toLowerCase();
            return (
              (nm.includes(codLower) || arq.includes(codLower)) &&
              Boolean(m.arquivoTexto || m.arquivoBase64)
            );
          });

          const textoPdfItem = materiaPdfCorrespondente?.arquivoTexto || undefined;
          const base64PdfItem = materiaPdfCorrespondente?.arquivoBase64 || undefined;
          const mimeTypePdfItem = materiaPdfCorrespondente?.arquivoTipo || 'application/pdf';

          try {
            // Tentativas com retry automático por item se retornar menos que o solicitado ou ocorrer oscilação
            let geradasDoItem: any[] = [];
            for (let tentativa = 1; tentativa <= 2; tentativa++) {
              const qtdRestante = item.quantidade - geradasDoItem.length;
              if (qtdRestante <= 0) break;
              try {
                const lote = await callGeminiGenerateQuestions({
                  banca: 'FAFIPA',
                  disciplina: item.pdf.blocoNome,
                  assunto: item.pdf.nome,
                  cargo: 'Engenheiro Civil',
                  quantidade: qtdRestante,
                  direcionamentoAdicional: direcionamento,
                  observacoesBanca: observacoesCompletas,
                  fileText: textoPdfItem,
                  fileBase64: base64PdfItem,
                  mimeType: mimeTypePdfItem,
                });
                if (lote && lote.length > 0) {
                  geradasDoItem.push(...lote);
                }
                if (geradasDoItem.length >= item.quantidade) break;
              } catch (errTentativa) {
                console.warn(`Tentativa ${tentativa} para ${item.pdf.nome} falhou:`, errTentativa);
              }
            }

            if (geradasDoItem && geradasDoItem.length > 0) {
              const sanitizadas = geradasDoItem.slice(0, item.quantidade).map((gq, idx) => ({
                ...gq,
                banca: 'FAFIPA',
                disciplina: gq.disciplina || item.pdf.blocoNome,
                assunto: gq.assunto || item.pdf.nome,
                cargo: 'Engenheiro Civil',
                tipo: item.pdf.tipo,
                dificuldade: dificuldadesDoItem[idx] || 'MEDIA',
                enunciado: limparSintaxeLatex(gq.enunciado),
                alternativas: (gq.alternativas || []).map(limparSintaxeLatex),
                comentario: limparSintaxeLatex(gq.comentario),
              }));
              novasQuestoesCriadas.push(...sanitizadas);
            }
          } catch (err) {
            console.warn(`Aviso ao gerar lote para ${item.pdf.nome}:`, err);
          }
        }

        // MOTOR DE FECHAMENTO OBRIGATÓRIO DE 40 QUESTÕES (SHORTFALL TOP-UP)
        // Se alguma chamada da IA falhou por timeout/rede móvel e o total for inferior a 40:
        if (novasQuestoesCriadas.length < totalAlvo) {
          const faltam = totalAlvo - novasQuestoesCriadas.length;
          setProgressoSimuladoPct(82);
          setProgressoSimulado(`Garantindo fechamento oficial da prova: gerando ${faltam} questão(ões) complementar(es)...`);

          const temasEspecificos = itensComQtd.filter((it) => it.pdf.tipo === 'especifica');
          const temasReserva = temasEspecificos.length > 0 ? temasEspecificos : itensComQtd;
          let temaIdx = 0;
          let tentativasFechamento = 0;

          while (novasQuestoesCriadas.length < totalAlvo && tentativasFechamento < 6) {
            tentativasFechamento++;
            const tema = temasReserva[temaIdx % temasReserva.length];
            temaIdx++;
            const slotAtual = novasQuestoesCriadas.length;
            const tipoFaltante = gradeTipologias[slotAtual % gradeTipologias.length];
            const difFaltante = gradeDificuldades[slotAtual % gradeDificuldades.length];
            const moldeT = montarInstrucaoMoldeTipologia(tipoFaltante);
            const moldeD = montarInstrucaoMoldeDificuldade(difFaltante);
            const obs = `${diretrizesFafipa}\n\nDIRETRIZ DA QUESTÃO:\n${moldeT}\n\n${moldeD}`;

            try {
              const extras = await callGeminiGenerateQuestions({
                banca: 'FAFIPA',
                disciplina: tema.pdf.blocoNome,
                assunto: tema.pdf.nome,
                cargo: 'Engenheiro Civil',
                quantidade: 1,
                direcionamentoAdicional: `Foque no padrão FAFIPA para a Prefeitura de Curitiba.`,
                observacoesBanca: obs,
              });

              if (extras && extras.length > 0) {
                const s = extras.map((gq) => ({
                  ...gq,
                  banca: 'FAFIPA',
                  disciplina: gq.disciplina || tema.pdf.blocoNome,
                  assunto: gq.assunto || tema.pdf.nome,
                  cargo: 'Engenheiro Civil',
                  tipo: tema.pdf.tipo,
                  dificuldade: difFaltante,
                  enunciado: limparSintaxeLatex(gq.enunciado),
                  alternativas: (gq.alternativas || []).map(limparSintaxeLatex),
                  comentario: limparSintaxeLatex(gq.comentario),
                }));
                novasQuestoesCriadas.push(...s);
              }
            } catch (errFechamento) {
              console.warn('Falha em tentativa de preenchimento complementar:', errFechamento);
            }
          }
        }

        // REDE DE PROTEÇÃO FINAL: Se a IA atingiu limite de quota de API ou oscilação severa,
        // complementa o deficit com questões de maior aderência do banco para NUNCA iniciar com menos de 40
        if (novasQuestoesCriadas.length < totalAlvo) {
          const faltamAinda = totalAlvo - novasQuestoesCriadas.length;
          const idsCriados = new Set(novasQuestoesCriadas.map((q) => q.id));
          const bancoDisponivel = questoes.filter((q) => !idsCriados.has(q.id));
          bancoDisponivel.sort(
            (a, b) => (historicoRespostas[a.id] || []).length - (historicoRespostas[b.id] || []).length
          );
          const reserva = bancoDisponivel.slice(0, faltamAinda).map((q, idx) => {
            const slot = novasQuestoesCriadas.length + idx;
            return {
              ...q,
              dificuldade: gradeDificuldades[slot % gradeDificuldades.length] || 'MEDIA',
              enunciado: limparSintaxeLatex(q.enunciado),
              alternativas: (q.alternativas || []).map(limparSintaxeLatex),
              comentario: limparSintaxeLatex(q.comentario),
            };
          });
          novasQuestoesCriadas.push(...reserva);
        }

        if (novasQuestoesCriadas.length < totalAlvo) {
          throw new Error(
            `Não foi possível reunir as ${totalAlvo} questões da prova oficial (obtidas: ${novasQuestoesCriadas.length}). Verifique sua conexão e tente novamente.`
          );
        }

        // Garante ordenação oficial canônica (Q1-5 Português, Q6-10 Informática, Q11-40 Específicas aleatórias) e balanceamento uniforme 8A, 8B, 8C, 8D, 8E
        const loteExato40 = novasQuestoesCriadas.slice(0, totalAlvo);
        const questoesBalanceadas = estruturarSimuladoOficialOrdenado(loteExato40, totalAlvo);

        // Higienização final por segurança
        const questoesFinaisLimapas = questoesBalanceadas.map((q) => ({
          ...q,
          enunciado: limparSintaxeLatex(q.enunciado),
          alternativas: (q.alternativas || []).map(limparSintaxeLatex),
          comentario: limparSintaxeLatex(q.comentario),
        }));

        setProgressoSimuladoPct(92);
        setProgressoSimulado(`Salvando ${questoesFinaisLimapas.length} novas questões no Banco de Dados com gabarito balanceado...`);
        const questoesComOrigem = questoesFinaisLimapas.map((q) => ({
          ...q,
          origem: 'simulado' as const,
          simulado: true,
        }));
        const questoesSalvas = await salvarNovasQuestoesDb(questoesComOrigem);
        try {
          const prevCache = JSON.parse(localStorage.getItem('gb_questoes_simulados_ids') || '[]');
          const setC = new Set([...prevCache, ...questoesSalvas.map((q) => q.id), ...questoesSalvas.map((q) => String(q.id).trim())]);
          localStorage.setItem('gb_questoes_simulados_ids', JSON.stringify(Array.from(setC)));
        } catch (e) {}
        setQuestoes((prev) => [...prev, ...questoesSalvas]);

        const countSim =
          sessoesCriadas.filter((s) => String(s.codigo || '').toUpperCase().startsWith('SIM-CTBA-')).length +
          1;
        const codSim = `SIM-CTBA-${String(countSim).padStart(2, '0')}`;

        const novaSessao: SessaoCriada = {
          codigo: codSim,
          dataHora: new Date().toLocaleString('pt-BR'),
          banca: 'FAFIPA',
          cargo: 'Engenheiro Civil',
          disciplina: 'Prefeitura de Curitiba (Prova Real)',
          assunto: `Simulado Oficial Ponderado Inédito (${questoesSalvas.length}Q)`,
          quantidade: questoesSalvas.length,
          questaoIds: questoesSalvas.map((q) => q.id),
          tipo: 'simulado',
          tempoSegundos: 0,
          concluida: false,
          questoesSnap: questoesSalvas,
        };

        setProgressoSimuladoPct(98);
        const salva = await salvarSessaoDb(novaSessao);
        setSessoesCriadas((prev) => [
          salva,
          ...prev.filter((s) => s.id !== salva.id && s.codigo !== salva.codigo),
        ]);
        setProgressoSimuladoPct(100);
        setModalSimuladoAberto(false);
        iniciarSessaoAtiva(salva.questaoIds, `Simulado Oficial: ${codSim} (${salva.quantidade}Q)`, salva, true);
        setActiveTab('sessoes');
      } catch (err: any) {
        setProgressoSimulado('');
        alert(err.message || 'Erro ao gerar simulado');
      } finally {
        setGerandoSimulado(false);
        setProgressoSimuladoPct(undefined);
      }
    }
  };

  // Recomposição e Restauração Inteligente de Questões do Simulado
  const recomporQuestoesSimuladoAtivo = async () => {
    if (!sessaoAtiva) return;
    setRecompondoSimulado(true);
    try {
      const idsNecessarios = sessaoAtiva.questaoIds || [];
      const questoesAtuaisMap = new Map(questoes.map((q) => [String(q.id), q]));

      // 1. Tenta recuperar primeiro do cache local 'gb_questoes'
      let rawLocal: Questao[] = [];
      try {
        rawLocal = JSON.parse(localStorage.getItem('gb_questoes') || '[]');
      } catch {}
      rawLocal.forEach((lq) => {
        if (lq && lq.id !== undefined && !questoesAtuaisMap.has(String(lq.id))) {
          questoesAtuaisMap.set(String(lq.id), lq);
        }
      });

      // 2. Verifica se o snapshot da própria sessão possui as questões
      if (sessaoAtiva.questoesSnap && Array.isArray(sessaoAtiva.questoesSnap)) {
        sessaoAtiva.questoesSnap.forEach((sq) => {
          if (sq && sq.id !== undefined && !questoesAtuaisMap.has(String(sq.id))) {
            questoesAtuaisMap.set(String(sq.id), sq);
          }
        });
      }

      // Identifica quais IDs continuam sem questão encontrada
      const faltantesIndices: number[] = [];
      idsNecessarios.forEach((id, idx) => {
        if (!questoesAtuaisMap.has(String(id))) {
          faltantesIndices.push(idx);
        }
      });

      // Se encontrou todas as questões no cache local/snapshot, restaura no estado e sincroniza
      if (faltantesIndices.length === 0) {
        const recuperadas = idsNecessarios.map((id) => questoesAtuaisMap.get(String(id))!).filter(Boolean);
        setQuestoes((prev) => {
          const idSet = new Set(prev.map((q) => String(q.id)));
          const novas = recuperadas.filter((q) => !idSet.has(String(q.id)));
          return [...prev, ...novas];
        });
        setSessaoAtiva((prev) => (prev ? { ...prev, questoesSnap: recuperadas } : null));
        alert(`As ${recuperadas.length} questões do simulado ${sessaoAtiva.codigo} foram restauradas com sucesso do cache local!`);
        return;
      }

      // 3. Se faltarem questões (ex: dispositivo novo ou cache limpo), recompõe via IA pela grade oficial FAFIPA
      const feedbackAprendizado = gerarPromptAprendizadoFeedback();
      const diretrizesFafipa = `${montarInstrucoesDnaBanca(PERFIL_FAFIPA_CURITIBA)}${feedbackAprendizado ? `\n\n${feedbackAprendizado}` : ''}`;
      const gradeTipologias = gerarGradeTipologiasFafipa(40);
      const gradeDificuldades = gerarGradeDificuldadeFafipa(40);

      const novasGeradas: Questao[] = [];
      for (const idx of faltantesIndices) {
        const bloco = idx < 5 ? 'Língua Portuguesa' : idx < 10 ? 'Informática Básica' : 'Conhecimentos Específicos';
        const assunto = idx < 5 ? 'Interpretação e Gramática FAFIPA' : idx < 10 ? 'Windows e Pacote Office FAFIPA' : 'Engenharia Civil Curitiba';
        const tipoMolde = gradeTipologias[idx % gradeTipologias.length];
        const difMolde = gradeDificuldades[idx % gradeDificuldades.length];
        const moldeT = montarInstrucaoMoldeTipologia(tipoMolde);
        const moldeD = montarInstrucaoMoldeDificuldade(difMolde);
        const obs = `${diretrizesFafipa}\n\nDIRETRIZ DA QUESTÃO:\n${moldeT}\n\n${moldeD}`;

        try {
          const lote = await callGeminiGenerateQuestions({
            banca: 'FAFIPA',
            disciplina: bloco,
            assunto: assunto,
            cargo: 'Engenheiro Civil',
            quantidade: 1,
            direcionamentoAdicional: `Foque no padrão FAFIPA para a Prefeitura de Curitiba.`,
            observacoesBanca: obs,
          });
          if (lote && lote.length > 0) {
            const sanitizada: Questao = {
              ...lote[0],
              id: Date.now() + idx + 1,
              banca: 'FAFIPA',
              disciplina: bloco,
              assunto: assunto,
              cargo: 'Engenheiro Civil',
              dificuldade: difMolde,
              enunciado: limparSintaxeLatex(lote[0].enunciado),
              alternativas: (lote[0].alternativas || []).map(limparSintaxeLatex),
              comentario: limparSintaxeLatex(lote[0].comentario),
              origem: 'simulado',
              simulado: true,
            };
            novasGeradas.push(sanitizada);
          }
        } catch (e) {
          console.warn(`Aviso ao recompor questão slot ${idx}:`, e);
        }
      }

      if (novasGeradas.length > 0) {
        const salvas = await salvarNovasQuestoesDb(novasGeradas);
        const novosIds = [...idsNecessarios];
        faltantesIndices.forEach((fIdx, i) => {
          if (salvas[i]) {
            novosIds[fIdx] = salvas[i].id;
            questoesAtuaisMap.set(String(salvas[i].id), salvas[i]);
          }
        });

        const todasQuestoesSessao = novosIds.map((id) => questoesAtuaisMap.get(String(id))).filter((q): q is Questao => Boolean(q));
        setQuestoes((prev) => [...prev, ...salvas]);
        setSessoesCriadas((prev) =>
          prev.map((s) => (s.codigo === sessaoAtiva.codigo ? { ...s, questaoIds: novosIds, questoesSnap: todasQuestoesSessao } : s))
        );
        if (sessaoAtiva.sessaoId) {
          await atualizarSessaoDb(sessaoAtiva.sessaoId, { questaoIds: novosIds, questoesSnap: todasQuestoesSessao });
        }
        setSessaoAtiva((prev) => (prev ? { ...prev, questaoIds: novosIds, questoesSnap: todasQuestoesSessao } : null));
        alert(`Sucesso! ${novasGeradas.length} questão(ões) foram recompostas de acordo com a grade oficial FAFIPA.`);
      } else {
        alert('Não foi possível gerar questões adicionais. Verifique a chave do Gemini e a conexão.');
      }
    } catch (err: any) {
      alert('Erro ao recompor questões: ' + (err.message || 'Falha'));
    } finally {
      setRecompondoSimulado(false);
    }
  };

  // Purga manual / automática do simulado de teste anterior
  const purgarDadosSimuladosTeste = async () => {
    try {
      await purgarSimuladosTesteDb();
      setSessoesCriadas((prev) =>
        prev.filter((s) => {
          const cod = String(s.codigo || '').toUpperCase();
          const ass = String(s.assunto || '').toLowerCase();
          if (cod.startsWith('SIM-CTBA-') || ass.includes('oficial')) return true;
          return !cod.startsWith('SIM-TESTE-') && !ass.includes('simulado de teste');
        })
      );
      setRegistrosTempoSessoes((prev) =>
        prev.filter((t) => {
          const c = String(t.codigo || '').toUpperCase();
          if (c.startsWith('SIM-CTBA-')) return true;
          return !c.startsWith('SIM-TESTE-') && !c.includes('TESTE');
        })
      );
      if (sessaoAtiva && String(sessaoAtiva.codigo || '').toUpperCase().startsWith('SIM-TESTE-')) {
        setSessaoAtiva(null);
      }
    } catch (e) {
      console.warn('Erro ao purgar simulados de teste:', e);
    }
  };

  // Current question in Banco view - strictly unrevealed until user responds in current view
  const isModoCaderno = statusFiltroBanco === 'caderno-erros';
  const questaoAtualBanco = questoesFiltradasBanco[indiceBanco];
  const respBancoAtual = isModoCaderno
    ? undefined
    : (questaoAtualBanco ? respostasBancoTemp[questaoAtualBanco.id] : undefined);

  // Timer em tempo real da questão no Banco de Questões
  // Começa a contabilizar assim que a questão aparece na tela e encerra ao errar ou ao responder
  useEffect(() => {
    let timerId: any = null;
    if (activeTab === 'resolver' && bancoTimerAtivo && questaoAtualBanco && (!respBancoAtual || isModoCaderno)) {
      timerId = setInterval(() => {
        setBancoTimerSegundos((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [activeTab, bancoTimerAtivo, questaoAtualBanco?.id, respBancoAtual, isModoCaderno]);


  // Monitora a troca de questão ativa no Banco ou ativação da aba Resolver
  useEffect(() => {
    if (activeTab === 'resolver' && questaoAtualBanco) {
      const qId = questaoAtualBanco.id;
      if (qId !== bancoQuestaoAtualId) {
        setBancoQuestaoAtualId(qId);
        setBancoTimerSegundos(0);
        if (isModoCaderno || !respostasBancoTemp[qId]) {
          setBancoTimerAtivo(true);
        } else {
          setBancoTimerAtivo(false);
        }
      }
    } else if (activeTab !== 'resolver') {
      setBancoTimerAtivo(false);
    }
  }, [activeTab, questaoAtualBanco?.id, bancoQuestaoAtualId, respostasBancoTemp, isModoCaderno]);

  // Colors for comparative block chart
  const coresBarra = [
    'bg-blue-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-cyan-500',
    'bg-orange-500',
  ];

  // -------------------------------------------------------------------------
  // PRIMEIRO ACESSO / VISITANTE NÃO AUTENTICADO
  // O primeiro acesso de qualquer dispositivo exibe obrigatoriamente a tela de login.
  // Após efetuar o login, a sessão fica salva permanentemente no dispositivo.
  // -------------------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="bg-[#0a0f1d] text-gray-100 font-sans min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white">
        {/* Header Superior Limpo */}
        <header className="bg-[#131b2e] border-b border-[#1e293b] px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="MIRAQuest"
              className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-blue-600/30 border border-blue-500/40 bg-[#0c1220]"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  MIRA<span className="text-blue-400">Quest</span>
                </span>
                <span className="text-yellow-400 text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-950/90 border border-blue-700/80 rounded-md tracking-wider">
                  Precisão em Questões
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Plataforma Individual de Alta Performance em Concursos</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs bg-[#0c1220] text-amber-300 border border-amber-800/60 px-3.5 py-1.5 rounded-full font-medium flex items-center gap-2 shadow-sm">
              <i className="fa-solid fa-lock text-yellow-400"></i>
              <span className="hidden sm:inline">Primeiro Acesso •</span>
              <span>Faça Login</span>
            </span>
          </div>
        </header>

        {/* Portal de Login e Cadastro Centralizado */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-auto">
          <div className="max-w-md w-full my-auto">
            <AuthModal
              isOpen={true}
              inline={true}
              canClose={false}
              initialTab={authModalTab}
              onSuccess={(user) => {
                setCurrentUser(user);
                setIsAuthModalOpen(false);
                setActiveTab('desempenho');
                setModoVisualizacaoDesempenho('recuperacao');
              }}
            />
          </div>
        </main>

        {/* Rodapé institucional */}
        <footer className="text-center py-4 text-xs text-gray-500 border-t border-[#1e293b]/70 bg-[#070b14]">
          <p>MIRAQuest • Precisão em Questões © {new Date().getFullYear()} — Todos os direitos reservados.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0f1d] text-gray-100 font-sans min-h-screen flex flex-col">
      {/* Branded Loading Splash */}
      {loadingData && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f1d]/90 backdrop-blur-md">
          <div className="relative">
            <img
              src="/logo.png"
              alt="MIRAQuest"
              className="w-16 h-16 rounded-2xl object-cover shadow-2xl shadow-blue-500/40 border border-blue-500/50 animate-pulse"
            />
            <div className="absolute -inset-1 rounded-2xl border border-blue-400/30 animate-ping pointer-events-none"></div>
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-base font-bold text-white tracking-wide">MIRAQuest</h2>
            <p className="text-xs text-yellow-400 font-medium">Precisão em Questões</p>
            <p className="text-[11px] text-gray-500 mt-2 flex items-center justify-center gap-1.5">
              <i className="fa-solid fa-circle-notch fa-spin text-blue-400"></i>
              <span>Carregando dados da nuvem...</span>
            </p>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-[#0c101d] border-b border-[#1e293b] sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between shadow-sm gap-4">
        <div className="flex items-center space-x-4 sm:space-x-8 min-w-0 flex-1">
          {/* Logo Minimalista & Compacto */}
          <div
            className="flex items-center space-x-2.5 shrink-0 cursor-pointer group"
            onClick={() => {
              setActiveTab('desempenho');
              setModoVisualizacaoDesempenho('recuperacao');
            }}
            title="MIRAQuest - Início (Desempenho: Recuperação)"
          >
            <img
              src="/logo.png"
              alt="MIRAQuest Logo"
              className="w-8 h-8 rounded-lg object-cover shadow-sm border border-blue-500/30 bg-[#0c1220]"
            />
            <span className="font-extrabold text-base tracking-tight text-white hidden md:inline">
              MIRA<span className="text-blue-400">Quest</span>
            </span>
          </div>

          {/* Menus Principais - Prioridade Total de Espaço e Visibilidade */}
          <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveTab('bancas')}
              className={`nav-btn !py-2 !px-3 text-xs sm:text-sm flex items-center gap-2 shrink-0 ${activeTab === 'bancas' ? 'active' : ''}`}
              title="1. Definir Premissas e Banca"
            >
              <i className="fa-solid fa-sliders text-[12px] text-gray-400"></i>
              <span>1. Premissas</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`nav-btn !py-2 !px-3 text-xs sm:text-sm flex items-center gap-2 shrink-0 ${activeTab === 'upload' ? 'active' : ''}`}
              title="2. Gerar Sessão de Questões"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-[12px] text-amber-400"></i>
              <span>
                2. Gerar<span className="hidden xl:inline"> Questões</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sessoes')}
              className={`nav-btn !py-2 !px-3 text-xs sm:text-sm flex items-center gap-2 shrink-0 ${activeTab === 'sessoes' ? 'active' : ''}`}
              title="3. Sessões Geradas"
            >
              <i className="fa-solid fa-layer-group text-[12px] text-blue-400"></i>
              <span>
                3. Sessões<span className="hidden xl:inline"> Geradas</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('resolver')}
              className={`nav-btn !py-2 !px-3 text-xs sm:text-sm flex items-center gap-2 shrink-0 ${activeTab === 'resolver' ? 'active' : ''}`}
              title="4. Banco de Questões"
            >
              <i className="fa-solid fa-book-open text-[12px] text-emerald-400"></i>
              <span>
                4. Banco<span className="hidden xl:inline"> de Questões</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('desempenho')}
              className={`nav-btn !py-2 !px-3 text-xs sm:text-sm flex items-center gap-2 shrink-0 ${activeTab === 'desempenho' ? 'active' : ''}`}
              title="5. Meu Desempenho e Gráficos"
            >
              <i className="fa-solid fa-chart-line text-[12px] text-violet-400"></i>
              <span>
                5. <span className="hidden xl:inline">Meu </span>Desempenho
              </span>
            </button>
          </nav>
        </div>

        {/* Right: Símbolos Ultra-Minimalistas e Pequenos (Cloud, Dados, Questões, Conta) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Cloud Supabase (Ultra-Compacto) */}
          {isAdmin(currentUser) ? (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                isCloudConfigured
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/60'
                  : 'bg-[#0a0f1d] text-gray-400 border-[#1e293b] hover:text-white'
              }`}
              title={isCloudConfigured ? 'Cloud Supabase Conectada (ADM - Clique para configurar)' : 'Configurar Cloud Supabase (ADM)'}
            >
              <i className={`fa-solid ${isCloudConfigured ? 'fa-cloud text-emerald-400 text-xs' : 'fa-gear text-yellow-400 text-xs'}`}></i>
            </button>
          ) : isCloudConfigured ? (
            <div
              className="w-7 h-7 rounded-lg border border-emerald-900/50 bg-emerald-950/30 text-emerald-400 flex items-center justify-center"
              title="Cloud Supabase Conectada"
            >
              <i className="fa-solid fa-cloud text-emerald-400 text-xs"></i>
            </div>
          ) : null}

          {/* Sinalização Minimalista de Sincronização (Apenas Ícone/Dot com Tooltip) */}
          {isCloudConfigured && (
            <div
              className={`h-7 px-2 rounded-lg border flex items-center justify-center space-x-1 transition-all ${
                cloudSyncState.status === 'syncing'
                  ? 'bg-blue-950/60 border-blue-500/60 text-blue-300 animate-pulse'
                  : cloudSyncState.status === 'error'
                  ? 'bg-red-950/60 border-red-500/60 text-red-300'
                  : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400'
              }`}
              title={`Sincronização: ${cloudSyncState.message}${cloudSyncState.time ? ` (${cloudSyncState.time})` : ''} - Envio automático`}
            >
              {cloudSyncState.status === 'syncing' ? (
                <i className="fa-solid fa-circle-notch fa-spin text-[10px] text-blue-400"></i>
              ) : cloudSyncState.status === 'error' ? (
                <i className="fa-solid fa-triangle-exclamation text-[10px] text-red-400"></i>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                  <i className="fa-solid fa-check text-[9px] text-emerald-400"></i>
                  {cloudSyncState.time && (
                    <span className="text-[10px] font-mono text-emerald-400/80 hidden 2xl:inline ml-0.5">
                      {cloudSyncState.time}
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {/* Contador de Questões (Ultra-Compacto) */}
          <div
            className="h-7 px-2 rounded-lg bg-[#0a0f1d] border border-[#1e293b] flex items-center space-x-1 text-gray-300"
            title={`${questoes.length} questões cadastradas`}
          >
            <i className="fa-solid fa-database text-yellow-400 text-[10px]"></i>
            <span className="font-mono text-xs font-semibold text-gray-200">{questoes.length}</span>
          </div>

          {/* Perfil do Usuário (Avatar Compacto w-7 h-7) */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm hover:ring-2 hover:ring-blue-500/50 transition cursor-pointer"
              title={`Conta: ${currentUser?.nome || 'Usuário'} (${isAdmin(currentUser) ? 'ADM' : 'Usuário'})`}
            >
              {currentUser?.nome ? currentUser.nome.charAt(0).toUpperCase() : 'U'}
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#101726] border border-[#1e293b] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn p-4 space-y-3">
                <div className="flex items-center space-x-3 pb-3 border-b border-[#1e293b]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-sm flex items-center justify-center shadow-lg">
                    {currentUser?.nome ? currentUser.nome.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white truncate">{currentUser?.nome}</div>
                    <div className="text-[11px] text-gray-400 truncate">@{currentUser?.username || 'usuario'}</div>
                    <span
                      className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        isAdmin(currentUser)
                          ? 'bg-amber-500/20 text-yellow-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {isAdmin(currentUser) ? '👑 Administrador' : '👤 Usuário Comum'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-300 space-y-1 bg-[#0a0f1d] p-2.5 rounded-xl border border-[#1e293b]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">E-mail:</span>
                    <span className="font-mono text-white text-[10px] truncate max-w-[170px]">{currentUser?.email}</span>
                  </div>
                  {currentUser?.celular && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Celular:</span>
                      <span className="text-white text-[10px]">{currentUser.celular}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 pt-1">
                  {isAdmin(currentUser) && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium bg-amber-950/30 hover:bg-amber-950/50 text-yellow-300 border border-amber-800/40 rounded-xl transition flex items-center space-x-2"
                    >
                      <i className="fa-solid fa-cloud-arrow-up text-yellow-400"></i>
                      <span>Configurações da Nuvem (ADM)</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setAuthModalTab('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-[#1a2333] rounded-xl transition flex items-center space-x-2"
                  >
                    <i className="fa-solid fa-users-gear text-blue-400"></i>
                    <span>Trocar de Conta / Login</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      zerarEstatisticas();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-xl transition flex items-center space-x-2"
                  >
                    <i className="fa-solid fa-trash text-rose-400"></i>
                    <span>Zerar Estatísticas</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      authLogout();
                      setAuthModalTab('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/30 rounded-xl transition flex items-center space-x-2"
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    <span>Sair da Conta (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navbar Sub-row (apenas para telas de smartphone < 640px) */}
      <div className="sm:hidden bg-[#131b2e] border-b border-[#1e293b] px-3 py-1.5 flex space-x-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('bancas')}
          className={`nav-btn ${activeTab === 'bancas' ? 'active' : ''}`}
        >
          1. Premissas
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`nav-btn ${activeTab === 'upload' ? 'active' : ''}`}
        >
          2. Gerar
        </button>
        <button
          onClick={() => setActiveTab('sessoes')}
          className={`nav-btn ${activeTab === 'sessoes' ? 'active' : ''}`}
        >
          3. Sessões
        </button>
        <button
          onClick={() => setActiveTab('resolver')}
          className={`nav-btn ${activeTab === 'resolver' ? 'active' : ''}`}
        >
          4. Banco
        </button>
        <button
          onClick={() => setActiveTab('desempenho')}
          className={`nav-btn ${activeTab === 'desempenho' ? 'active' : ''}`}
        >
          5. Desempenho
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* TELA 1: DEFINIR PREMISSAS */}
        {activeTab === 'bancas' && (
          <section className="space-y-6 animate-fadeIn">
            {visaoPremissas === 'eap' ? (
              <PainelEapPremissas
                bancas={bancas}
                blocos={blocos}
                materias={materias}
                bancaSelecionadaId={
                  bancas.find(
                    (b) =>
                      b.nome.toLowerCase().includes('paramétrico') ||
                      b.nome.toLowerCase().includes('parametrico')
                  )?.id
                }
                onSelecionarBanca={(b) => {
                  setGerarBanca(b.nome);
                  if (b.cargo) setGerarCargo(b.cargo);
                }}
                onNovaBancaClick={() => {
                  setVisaoPremissas('classico');
                  setPremissasTab('bancas');
                }}
                onSalvarMateriaDoAssunto={async (dados) => {
                  const novaMateria = await salvarMateriaDb({
                    blocoNome: dados.blocoNome,
                    blocoId: dados.blocoId,
                    nome: dados.nome,
                    arquivoNome: dados.arquivoNome,
                    arquivoTexto: dados.arquivoTexto,
                    arquivoBase64: dados.arquivoBase64,
                    arquivoTipo: dados.arquivoTipo,
                    tamanhoBytes: dados.tamanhoBytes,
                  });
                  setMaterias((prev) => [novaMateria, ...prev.filter((m) => m.id !== novaMateria.id)]);
                }}
                onExcluirMateria={async (materiaId) => {
                  await excluirMateriaDb(materiaId);
                  setMaterias((prev) => prev.filter((m) => String(m.id) !== String(materiaId)));
                }}
                onAlternarModoClassico={() => setVisaoPremissas('classico')}
              />
            ) : (
              <div className="bg-[#101626] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-gray-300 border border-slate-700">
                        Modo Clássico (Tabelas)
                      </span>
                      <button
                        type="button"
                        onClick={() => setVisaoPremissas('eap')}
                        className="text-xs text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer"
                      >
                        ← Voltar para Visão EAP Estruturada
                      </button>
                    </div>
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <i className="fa-solid fa-sliders text-[#eab308] mr-2"></i> 1. Definir Premissas
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Cadastre o perfil das bancas, blocos de matérias e as leis (PDFs) para alimentar o motor de IA.
                    </p>
                  </div>

                {/* Minimalist Sub-navigation for Premissas */}
                <div className="flex space-x-1 bg-[#0a0f1d] p-1 rounded-lg border border-[#1e293b] shrink-0 self-start sm:self-auto">
                  <button
                    onClick={() => setPremissasTab('bancas')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                      premissasTab === 'bancas'
                        ? 'bg-[#3b82f6] text-gray-950 shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-building-columns"></i>
                    <span>Bancas ({bancas.length})</span>
                  </button>
                  <button
                    onClick={() => setPremissasTab('blocos')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                      premissasTab === 'blocos'
                        ? 'bg-[#3b82f6] text-gray-950 shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-folder"></i>
                    <span>Blocos ({blocos.length})</span>
                  </button>
                  <button
                    onClick={() => setPremissasTab('materias')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                      premissasTab === 'materias'
                        ? 'bg-[#3b82f6] text-gray-950 shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-file-pdf"></i>
                    <span>Matérias & PDFs ({materias.length})</span>
                  </button>
                </div>
              </div>



              {/* SUB-SEÇÃO A: BANCAS & ESTILOS */}
              {premissasTab === 'bancas' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                  {/* Form Cadastro Banca */}
                  <div className="lg:col-span-5 bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                      <i className="fa-solid fa-plus-circle text-[#eab308] mr-2"></i> Cadastrar Perfil da Banca
                    </h3>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Nome da Banca <span className="text-red-400 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={bancaNome}
                        onChange={(e) => setBancaNome(e.target.value)}
                        placeholder="Ex: FAFIPA, Cebraspe, FCC, FGV..."
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-gray-300">
                          Qual o cargo/função concorrida <span className="text-red-400 font-bold">*</span>
                        </label>
                        <span className="text-[10px] font-semibold text-[#eab308] bg-[#eab308]/10 px-1.5 py-0.5 rounded border border-[#eab308]/30">
                          Treino para a IA
                        </span>
                      </div>
                      <input
                        type="text"
                        value={bancaCargo}
                        onChange={(e) => setBancaCargo(e.target.value)}
                        placeholder="Ex: Auditor Fiscal, Analista Judiciário..."
                        className="input-field text-sm border-amber-500/40 focus:border-amber-400"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        A IA usará este cargo para calibrar a profundidade e os casos práticos das questões.
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Upload de Provas Passadas (PDFs/TXTs) <span className="text-red-400 font-bold">*</span>
                      </label>
                      <input
                        type="file"
                        ref={fileInputBancaRef}
                        multiple
                        accept=".pdf,.txt"
                        onChange={handleBancaFileChange}
                        className="input-file text-xs"
                      />
                    </div>

                    {bancaArquivosNomes.length > 0 && (
                      <div className="bg-[#131b2e] border border-[#1e293b] rounded-lg p-2.5">
                        <span className="text-[11px] font-bold text-[#eab308] uppercase tracking-wider block mb-1">
                          <i className="fa-solid fa-folder-open mr-1"></i> Provas Anexadas ({bancaArquivosNomes.length})
                        </span>
                        <ul className="text-xs text-gray-300 space-y-1 max-h-24 overflow-y-auto pr-1">
                          {bancaArquivosNomes.map((name, i) => (
                            <li key={i} className="flex items-center text-gray-300 truncate">
                              <i className="fa-solid fa-file-pdf text-[#3b82f6] mr-1.5 text-xs"></i> {name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Observações do Estilo (Opcional)</label>
                      <textarea
                        rows={2}
                        value={bancaObs}
                        onChange={(e) => setBancaObs(e.target.value)}
                        placeholder="Ex: Foco em literalidade de artigos, prazos decadenciais, exceções..."
                        className="input-field text-xs"
                      />
                    </div>
                    <button onClick={salvarBanca} className="btn-primary w-full text-xs py-2.5">
                      <i className="fa-solid fa-plus mr-1.5"></i> Salvar Perfil da Banca
                    </button>
                  </div>

                  {/* Lista Bancas Cadastradas */}
                  <div className="lg:col-span-7 bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-5 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center">
                        <i className="fa-solid fa-list mr-2 text-[#eab308]"></i> Bancas Cadastradas ({bancas.length})
                      </h3>
                      <span className="text-xs text-gray-500">Prontas para seleção</span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
                      {bancas.length === 0 ? (
                        <div className="text-gray-500 text-xs italic text-center py-12">
                          Nenhuma banca cadastrada ainda. Cadastre ao lado.
                        </div>
                      ) : (
                        bancas.map((b) => (
                          <div
                            key={b.id}
                            className="bg-[#131b2e] border border-[#1e293b] p-3.5 rounded-xl flex justify-between items-start gap-3 hover:border-gray-700 transition"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center flex-wrap gap-2">
                                <span className="font-bold text-white text-sm flex items-center">
                                  <i className="fa-solid fa-stamp text-[#eab308] mr-1.5"></i> {b.nome}
                                </span>
                                {b.cargo && (
                                  <span className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                                    <i className="fa-solid fa-briefcase text-[9px]"></i> {b.cargo}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                <span className="text-blue-400 font-medium">{b.arquivos?.length || 0}</span> prova(s) ref.
                                {b.obs && ` • ${b.obs.slice(0, 70)}${b.obs.length > 70 ? '...' : ''}`}
                              </p>
                            </div>

                            {/* Minimalist Action Buttons */}
                            <div className="flex items-center space-x-1 shrink-0 pt-0.5">
                              <button
                                onClick={() => abrirEdicaoBanca(b)}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded transition"
                                title="Editar Banca"
                              >
                                <i className="fa-solid fa-pen text-xs"></i>
                              </button>
                              <button
                                onClick={() => removerBanca(b.id)}
                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#1e293b] rounded transition"
                                title="Excluir Banca"
                              >
                                <i className="fa-solid fa-trash text-xs"></i>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-SEÇÃO B: BLOCOS */}
              {premissasTab === 'blocos' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                  {/* Form Cadastro Bloco */}
                  <div className="lg:col-span-5 bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                      <i className="fa-solid fa-folder-plus text-[#eab308] mr-2"></i> Cadastrar Bloco de Matérias
                    </h3>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Nome do Bloco <span className="text-red-400 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={blocoNome}
                        onChange={(e) => setBlocoNome(e.target.value)}
                        placeholder="Ex: 01_Direito Administrativo, 02_Licitações..."
                        className="input-field text-sm"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Organiza e agrupa matérias e gera os códigos automáticos das sessões (ex: BL01, BL02).
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Descrição / Ementa (Opcional)</label>
                      <textarea
                        rows={3}
                        value={blocoDescricao}
                        onChange={(e) => setBlocoDescricao(e.target.value)}
                        placeholder="Ex: Princípios da administração, atos administrativos, poderes da administração pública..."
                        className="input-field text-xs"
                      />
                    </div>
                    <button onClick={salvarBloco} className="btn-primary w-full text-xs py-2.5">
                      <i className="fa-solid fa-plus mr-1.5"></i> Salvar Bloco
                    </button>
                  </div>

                  {/* Lista Blocos Cadastrados */}
                  <div className="lg:col-span-7 bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-5 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center">
                        <i className="fa-solid fa-folders mr-2 text-[#eab308]"></i> Blocos Cadastrados ({blocos.length})
                      </h3>
                      <span className="text-xs text-gray-500">Módulos de disciplinas</span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
                      {blocos.length === 0 ? (
                        <div className="text-gray-500 text-xs italic text-center py-12">
                          Nenhum bloco cadastrado ainda.
                        </div>
                      ) : (
                        blocos.map((bl) => {
                          const materiasAssociadas = materias.filter(
                            (m) =>
                              String(m.blocoId) === String(bl.id) ||
                              (m.blocoNome && bl.nome && m.blocoNome.trim().toLowerCase() === bl.nome.trim().toLowerCase())
                          );
                          return (
                            <div
                              key={bl.id}
                              className="bg-[#131b2e] border border-[#1e293b] p-3.5 rounded-xl flex justify-between items-start gap-3 hover:border-gray-700 transition"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm flex items-center">
                                    <i className="fa-solid fa-folder text-[#3b82f6] mr-1.5"></i> {bl.nome}
                                  </span>
                                  <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono">
                                    {materiasAssociadas.length} matéria(s)
                                  </span>
                                </div>
                                {bl.descricao && (
                                  <p className="text-xs text-gray-400">
                                    {bl.descricao.slice(0, 90)}{bl.descricao.length > 90 ? '...' : ''}
                                  </p>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center space-x-1.5 shrink-0 pt-0.5">
                                <button
                                  onClick={() => abrirEdicaoBloco(bl, 'editar')}
                                  className="px-2.5 py-1 text-xs text-blue-300 hover:text-white bg-blue-950/60 hover:bg-blue-900 border border-blue-800/60 rounded-lg flex items-center space-x-1.5 transition shadow-sm font-medium"
                                  title="Editar Bloco e Gerenciar Matérias"
                                >
                                  <i className="fa-solid fa-pen text-[11px] text-blue-400"></i>
                                  <span>Editar</span>
                                </button>
                                <button
                                  onClick={() => abrirEdicaoBloco(bl, 'incluir-materia')}
                                  className="px-2.5 py-1 text-xs text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 rounded-lg flex items-center space-x-1.5 transition shadow-sm font-medium"
                                  title="Incluir Novas Matérias / Leis neste Bloco"
                                >
                                  <i className="fa-solid fa-plus text-[11px] text-emerald-400"></i>
                                  <span className="hidden sm:inline">Incluir Matéria</span>
                                </button>
                                <button
                                  onClick={() => removerBloco(bl.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#1e293b] rounded-lg transition"
                                  title="Excluir Bloco"
                                >
                                  <i className="fa-solid fa-trash text-xs"></i>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-SEÇÃO C: MATÉRIAS / LEIS (PDFs) */}
              {premissasTab === 'materias' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                  {/* Form Cadastro Matéria */}
                  <div className="lg:col-span-5 bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                      <i className="fa-solid fa-file-circle-plus text-[#eab308] mr-2"></i> Cadastrar Matéria / Lei (PDF)
                    </h3>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Vincular a qual Bloco? <span className="text-red-400 font-bold">*</span>
                      </label>
                      <select
                        value={materiaBlocoId}
                        onChange={(e) => setMateriaBlocoId(e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="">-- Selecione o Bloco (Obrigatório) --</option>
                        {blocos.map((bl) => (
                          <option key={bl.id} value={bl.id}>
                            {bl.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Nome da Matéria / Lei <span className="text-red-400 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={materiaNome}
                        onChange={(e) => setMateriaNome(e.target.value)}
                        placeholder="Ex: Lei 14.133/21 - Nova Lei de Licitações..."
                        className="input-field text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Upload do PDF da Lei <span className="text-red-400 font-bold">*</span>
                      </label>
                      <input
                        type="file"
                        ref={fileInputMateriaRef}
                        accept=".pdf,.txt"
                        onChange={(e) => setMateriaArquivo(e.target.files ? e.target.files[0] : null)}
                        className="input-file text-xs"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        O PDF será processado e armazenado localmente para você selecionar com 1 clique na geração.
                      </p>
                    </div>

                    <button
                      onClick={salvarMateria}
                      disabled={materiaCarregando}
                      className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
                    >
                      {materiaCarregando ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          <span>Processando PDF...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-plus"></i>
                          <span>Salvar Matéria com PDF</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Lista Matérias Cadastradas */}
                  <div className="lg:col-span-7 bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-5 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center">
                        <i className="fa-solid fa-books mr-2 text-[#eab308]"></i> Matérias & PDFs Prontos ({materias.length})
                      </h3>
                      <span className="text-xs text-gray-500">Disponíveis para seleção imediata</span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
                      {materias.length === 0 ? (
                        <div className="text-gray-500 text-xs italic text-center py-12">
                          Nenhuma matéria cadastrada ainda. Cadastre a matéria e suba seu PDF ao lado.
                        </div>
                      ) : (
                        materias.map((m) => (
                          <div
                            key={m.id}
                            className="bg-[#131b2e] border border-[#1e293b] p-3.5 rounded-xl flex justify-between items-start gap-3 hover:border-gray-700 transition"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center flex-wrap gap-2">
                                <span className="font-bold text-white text-sm flex items-center">
                                  <i className="fa-solid fa-file-pdf text-[#eab308] mr-1.5"></i> {m.nome}
                                </span>
                                {m.blocoNome && (
                                  <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono">
                                    {m.blocoNome}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="text-emerald-400 inline-flex items-center gap-1 font-medium">
                                  <i className="fa-solid fa-circle-check text-[10px]"></i> PDF anexado: {m.arquivoNome}
                                </span>
                                {m.tamanhoBytes ? (
                                  <span>({(m.tamanhoBytes / 1024).toFixed(0)} KB)</span>
                                ) : null}
                              </div>
                            </div>

                            {/* Minimalist Action Buttons */}
                            <div className="flex items-center space-x-1 shrink-0 pt-0.5">
                              <button
                                type="button"
                                onClick={() => baixarDocumentoMateria(m)}
                                className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-[#1e293b] rounded transition cursor-pointer"
                                title={`Baixar documento original (${m.arquivoNome || m.nome})`}
                                aria-label="Baixar documento"
                              >
                                <i className="fa-solid fa-download text-xs"></i>
                              </button>
                              <button
                                onClick={() => abrirEdicaoMateria(m)}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded transition"
                                title="Editar Matéria"
                              >
                                <i className="fa-solid fa-pen text-xs"></i>
                              </button>
                              <button
                                onClick={() => removerMateria(m.id)}
                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#1e293b] rounded transition"
                                title="Excluir Matéria"
                              >
                                <i className="fa-solid fa-trash text-xs"></i>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* TELA 2: CENTRAL DE GERAÇÃO */}
        {activeTab === 'upload' && (
          <section className="space-y-6 animate-fadeIn">
            <div className="bg-[#101626] border border-[#1e293b] rounded-2xl p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-5 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <i className="fa-solid fa-wand-magic-sparkles text-blue-500 mr-2"></i> 2. Central de Geração de Questões
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Gere treinos avulsos por assunto, dispare o Simulado Oficial FAFIPA, gere lotes em escala ou importe provas em PDF.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadProvaModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  title="Importar prova oficial em PDF com extração e conferência de gabarito assistida por IA"
                >
                  <i className="fa-solid fa-file-pdf"></i>
                  <span>Upload de Prova Oficial (PDF)</span>
                </button>
              </div>

              {/* Seletor Segmentado de Modalidades de Geração (Estilo Linear) */}
              <div className="flex items-center gap-1 p-1 bg-[#0b0f19] border border-[#1e293b] rounded-xl max-w-xl mb-6">
                <button
                  type="button"
                  onClick={() => setSubAbaGeracao('avulsa')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    subAbaGeracao === 'avulsa'
                      ? 'bg-[#2563eb] text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <i className="fa-solid fa-list-check text-[11px]"></i>
                  <span>Questões Avulsas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubAbaGeracao('simulado')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    subAbaGeracao === 'simulado'
                      ? 'bg-[#2563eb] text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <i className="fa-solid fa-file-signature text-[11px] text-amber-300"></i>
                  <span>Simulado Oficial (40Q)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubAbaGeracao('escala')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    subAbaGeracao === 'escala'
                      ? 'bg-[#2563eb] text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <i className="fa-solid fa-layer-group text-[11px] text-blue-300"></i>
                  <span>Lote em Escala (500Q)</span>
                </button>
              </div>

              {/* Sub-aba 1: Questões Avulsas */}
              {subAbaGeracao === 'avulsa' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Seleção de Banca */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Selecione a Banca <span className="text-red-400 font-bold">*</span>
                    </label>
                    <select
                      value={gerarBanca}
                      onChange={(e) => {
                        const sel = e.target.value;
                        setGerarBanca(sel);
                      }}
                      className="input-field"
                    >
                      <option value="">-- Selecione a Banca Cadastrada --</option>
                      {bancas.map((b) => (
                        <option key={b.id} value={b.nome}>
                          {b.nome} {b.cargo ? `• Cargo: ${b.cargo}` : ''} ({b.arquivos?.length || 0} prova(s))
                        </option>
                      ))}
                    </select>

                    {/* Informação do Cargo já definido na Banca e DNA Paramétrico */}
                    {gerarBanca && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/50 px-2.5 py-1.5 rounded-lg">
                          <i className="fa-solid fa-briefcase text-[11px] text-[#eab308]"></i>
                          <span>
                            Cargo definido na banca: <b className="text-white">{bancas.find((b) => b.nome === gerarBanca)?.cargo || 'Engenheiro Civil'}</b>
                          </span>
                        </div>
                        {gerarBanca.toLowerCase().includes('fafipa') && (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-lg">
                            <i className="fa-solid fa-dna text-emerald-400 text-[10px]"></i>
                            <span>Perfil Paramétrico Ativo: Zero Cálculos · Gabarito Balanceado</span>
                          </div>
                        )}
                      </div>
                    )}

                    {bancas.length === 0 && (
                      <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                        <i className="fa-solid fa-triangle-exclamation"></i> Nenhuma banca cadastrada.{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('bancas');
                            setPremissasTab('bancas');
                          }}
                          className="underline hover:text-white"
                        >
                          Cadastre em "Definir Premissas"
                        </button>
                      </p>
                    )}
                  </div>

                  {/* Toggle para usar arquivo avulso ou premissas cadastradas */}
                  <div className="flex items-center justify-between bg-[#0a0f1d] px-3 py-2 rounded-lg border border-[#1e293b]">
                    <span className="text-xs text-gray-300">
                      {usarArquivoAvulso ? 'Modo: Upload de PDF avulso' : 'Modo: Selecionar das Premissas Salvas'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setUsarArquivoAvulso(!usarArquivoAvulso)}
                      className="text-xs text-[#3b82f6] hover:underline flex items-center gap-1"
                    >
                      <i className="fa-solid fa-repeat"></i>
                      <span>{usarArquivoAvulso ? 'Usar Matéria Salva' : 'Subir Arquivo Avulso'}</span>
                    </button>
                  </div>

                  {!usarArquivoAvulso ? (
                    <>
                      {/* Seleção de Bloco - Obrigatório */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Selecione o Bloco <span className="text-red-400 font-bold">*</span>
                        </label>
                        <select
                          value={gerarBlocoId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGerarBlocoId(val);
                            // Clear selected materia if it doesn't belong to new bloco
                            if (val) {
                              const bObj = blocos.find((b) => String(b.id) === String(val));
                              const matPertence = materias.find(
                                (m) =>
                                  String(m.id) === String(gerarMateriaId) &&
                                  (String(m.blocoId) === String(val) ||
                                    (bObj && m.blocoNome && m.blocoNome.trim().toLowerCase() === bObj.nome.trim().toLowerCase()))
                              );
                              if (!matPertence) setGerarMateriaId('');
                            }
                          }}
                          className="input-field"
                        >
                          <option value="">-- Selecione o Bloco (Obrigatório) --</option>
                          {blocos.map((bl) => (
                            <option key={bl.id} value={bl.id}>
                              {bl.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Seleção de Matéria / Lei Cadastrada */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-300">
                            Selecione a Matéria / Legislação (PDF) <span className="text-red-400 font-bold">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('bancas');
                              setPremissasTab('materias');
                            }}
                            className="text-xs text-[#3b82f6] hover:underline"
                          >
                            + Nova Matéria
                          </button>
                        </div>
                        <select
                          value={gerarMateriaId}
                          onChange={(e) => setGerarMateriaId(e.target.value)}
                          className="input-field"
                        >
                          <option value="">-- Selecione a Matéria / Lei com PDF já salvo --</option>
                          {materias
                            .filter((m) => {
                              if (!gerarBlocoId) return true;
                              const bObj = blocos.find((b) => String(b.id) === String(gerarBlocoId));
                              return (
                                String(m.blocoId) === String(gerarBlocoId) ||
                                (bObj && m.blocoNome && m.blocoNome.trim().toLowerCase() === bObj.nome.trim().toLowerCase())
                              );
                            })
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.nome} ({m.blocoNome || 'Sem bloco'}) • PDF: {m.arquivoNome}
                              </option>
                            ))}
                        </select>

                        {/* Indicação visual do arquivo salvo selecionado */}
                        {(() => {
                          const matSel = materias.find((m) => String(m.id) === String(gerarMateriaId));
                          if (matSel) {
                            return (
                              <div className="mt-2 bg-emerald-950/40 border border-emerald-700/60 rounded-lg p-2.5 flex items-center justify-between text-xs text-emerald-300">
                                <span className="flex items-center gap-2 truncate">
                                  <i className="fa-solid fa-file-circle-check text-emerald-400 text-sm"></i>
                                  <span className="font-semibold truncate">{matSel.arquivoNome}</span>
                                </span>
                                <span className="bg-emerald-900/60 px-2 py-0.5 rounded text-[11px] shrink-0">
                                  ✓ Pronto para a IA
                                </span>
                              </div>
                            );
                          }
                          if (materias.length === 0) {
                            return (
                              <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                                <i className="fa-solid fa-triangle-exclamation"></i> Nenhuma matéria cadastrada ainda.{' '}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab('bancas');
                                    setPremissasTab('materias');
                                  }}
                                  className="underline hover:text-white"
                                >
                                  Cadastre em "Definir Premissas"
                                </button>
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Modo Arquivo Avulso */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Disciplina (Bloco) <span className="text-red-400 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          value={gerarDisciplina}
                          onChange={(e) => setGerarDisciplina(e.target.value)}
                          placeholder="Ex: Bloco 01 - Direito Administrativo"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Assunto (Lei / Decreto) <span className="text-red-400 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          value={gerarAssunto}
                          onChange={(e) => setGerarAssunto(e.target.value)}
                          placeholder="Ex: Lei 8.112/90 - Regime Jurídico"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Arquivo PDF da Lei <span className="text-red-400 font-bold">*</span>
                        </label>
                        <input
                          type="file"
                          ref={fileInputLeiRef}
                          accept=".pdf,.txt"
                          onChange={(e) => setGerarArquivoAvulso(e.target.files ? e.target.files[0] : null)}
                          className="input-file"
                        />
                      </div>
                    </>
                  )}

                  {/* Direcionamento Adicional (Não obrigatório) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-300">
                        Algum direcionamento adicional? <span className="text-gray-400 font-normal text-xs">(Opcional)</span>
                      </label>
                      <span className="text-[11px] font-medium text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                        Afunilamento
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={gerarDirecionamento}
                      onChange={(e) => setGerarDirecionamento(e.target.value)}
                      placeholder="Ex: Focar exclusivamente nos artigos 5º ao 18; priorizar penalidades e prazos; dar ênfase a contratações diretas..."
                      className="input-field text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Afunile a geração em determinado assunto, artigos específicos ou capítulos prioritários da lei upada.
                    </p>
                  </div>

                  {/* Quantidade de Questões */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Quantidade de Questões</label>
                    <select
                      value={gerarQtd}
                      onChange={(e) => setGerarQtd(Number(e.target.value))}
                      className="input-field"
                    >
                      <option value={5}>5 Questões</option>
                      <option value={10}>10 Questões</option>
                      <option value={20}>20 Questões</option>
                      <option value={35}>35 Questões</option>
                      <option value={50}>50 Questões</option>
                    </select>
                  </div>

                  {/* Código de Rastreio Previsto da Sessão (com contagem sequencial x1, x2...) */}
                  {(() => {
                    const blocoNome = !usarArquivoAvulso
                      ? blocos.find((b) => String(b.id) === String(gerarBlocoId))?.nome || ''
                      : gerarDisciplina;
                    const leiNome = !usarArquivoAvulso
                      ? materias.find((m) => String(m.id) === String(gerarMateriaId))?.nome || ''
                      : gerarAssunto;
                    if (blocoNome && leiNome) {
                      const previewCod = gerarCodigoSessaoComContagem(blocoNome, leiNome, sessoesCriadas);
                      const questoesAnteriores = questoes.filter(
                        (q) =>
                          q.disciplina &&
                          q.assunto &&
                          q.disciplina.trim().toLowerCase() === blocoNome.trim().toLowerCase() &&
                          q.assunto.trim().toLowerCase() === leiNome.trim().toLowerCase()
                      );
                      const totalAnteriores = questoesAnteriores.length;

                      return (
                        <div className="space-y-2">
                          <div className="bg-[#0a0f1d] border border-blue-900/50 rounded-xl p-3 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-gray-300">
                              <i className="fa-solid fa-barcode text-[#eab308] text-sm"></i>
                              <div>
                                <span className="font-semibold block text-white">Código de Rastreio da Sessão:</span>
                                <span className="text-[11px] text-gray-400">Contagem progressiva por bloco e lei</span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded text-xs shadow-sm">
                              {previewCod}
                            </span>
                          </div>

                          {/* Visor da Inteligência Anti-Repetição */}
                          <div
                            className={`border rounded-xl p-3 text-xs flex items-start gap-2.5 transition-colors ${
                              totalAnteriores > 0
                                ? 'bg-emerald-950/40 border-emerald-800/70 text-emerald-200'
                                : 'bg-blue-950/40 border-blue-800/60 text-blue-200'
                            }`}
                          >
                            <i
                              className={`fa-solid ${
                                totalAnteriores > 0 ? 'fa-shield-halved text-emerald-400' : 'fa-sparkles text-blue-400'
                              } text-sm mt-0.5 shrink-0`}
                            ></i>
                            <div className="space-y-0.5 leading-relaxed">
                              <span className="font-bold block text-white">
                                {totalAnteriores > 0
                                  ? `Inteligência Anti-Repetição Ativa (${totalAnteriores} questões anteriores)`
                                  : 'Primeira Sessão desta Matéria'}
                              </span>
                              <p className="text-[11px] opacity-90">
                                {totalAnteriores > 0
                                  ? `A IA analisará as ${totalAnteriores} questões já criadas nas sessões passadas para não repetir artigos e cobrar novos pontos inéditos da lei.`
                                  : 'A IA iniciará a cobertura da legislação focando nos artigos e competências prioritárias do cargo.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <button
                    onClick={processarEValidarLei}
                    disabled={gerandoStatus.loading}
                    className="btn-primary w-full flex items-center justify-center space-x-2 py-3"
                  >
                    {gerandoStatus.loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin text-lg"></i>
                        <span>Gerando Sessão com IA do Gemini...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>
                        <span>Gerar Sessão de Questões</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Painel Lateral de Status */}
                <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-6 flex flex-col justify-center items-center text-center">
                  {gerandoStatus.loading ? (
                    <div className="space-y-3 animate-pulse">
                      <i className="fa-solid fa-spinner fa-spin text-4xl text-[#eab308]"></i>
                      <h3 className="text-base font-semibold text-white">Processando Documento com IA Gemini...</h3>
                      <p className="text-xs text-gray-400 max-w-sm">
                        {gerandoStatus.mensagem || 'Extraindo artigos, estruturando alternativas e gerando comentários detalhados baseados na legislação...'}
                      </p>
                    </div>
                  ) : gerandoStatus.sucesso ? (
                    <div className="space-y-3">
                      <i className="fa-solid fa-circle-check text-4xl text-green-500 mb-2"></i>
                      <h3 className="text-base font-bold text-white">Sessão Gerada com Sucesso!</h3>
                      <p className="text-xs text-green-400">
                        Código: <b>{gerandoStatus.codigoSessao}</b> ({gerandoStatus.qtd} questões salvas permanentemente).
                      </p>
                      <div className="flex gap-2 justify-center mt-3">
                        <button
                          onClick={() => {
                            const ultima = sessoesCriadas[0];
                            if (ultima) {
                              iniciarSessaoAtiva(ultima.questaoIds, `${ultima.disciplina} - ${ultima.assunto}`, ultima);
                            }
                            setActiveTab('sessoes');
                          }}
                          className="btn-primary text-xs"
                        >
                          <i className="fa-solid fa-play mr-1.5"></i> Iniciar Sessão Agora
                        </button>
                        <button
                          onClick={() => setActiveTab('sessoes')}
                          className="btn-secondary text-xs"
                        >
                          Ver em Sessões Geradas
                        </button>
                      </div>
                    </div>
                  ) : gerandoStatus.erro ? (
                    <div className="space-y-3 text-red-400">
                      <i className="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-2"></i>
                      <h3 className="text-base font-bold text-red-400">Falha ao Gerar Questões</h3>
                      <p className="text-xs text-red-300 max-w-sm">{gerandoStatus.erro}</p>
                      <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="btn-secondary text-xs mt-2"
                      >
                        Verificar Chave da API
                      </button>
                    </div>
                  ) : (
                    <div>
                      <i className="fa-solid fa-file-circle-check text-4xl text-gray-600 mb-3"></i>
                      <h3 className="text-sm font-medium text-gray-400">Pronto para Gerar Sessão</h3>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs">
                        Basta selecionar a banca, o cargo e a matéria cadastrada para a IA criar o caderno de questões inéditas.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sub-aba 2: Simulado Oficial */}
            {subAbaGeracao === 'simulado' && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-[10px] px-2.5 py-0.5 rounded tracking-wide">
                        PADRÃO OFICIAL FAFIPA
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-400">
                        CURITIBA 2026 · ENGENHARIA CIVIL
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-100">
                      Simulado Completo da Prova Real (40 Questões · 4h)
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Distribuição exata do edital oficial: <strong className="text-slate-200">5 Português + 5 Informática + 30 Engenharia Civil</strong> com cotas balanceadas nos 34 PDFs de estudo e sorteio estocástico.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
                      <span className="text-amber-400 font-medium">
                        Meta de aprovação: 98% (39+ acertos)
                      </span>
                      <span className="text-slate-400 font-mono">
                        Ritmo alvo: 5:15 m/q (3h30 líquidas + 30min gabarito)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => abrirConferenciaSimulado(40)}
                      className="px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <i className="fa-solid fa-play text-xs"></i>
                      <span>Iniciar Simulado Real (40Q)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModoVisualizacaoDesempenho('simulados');
                        setActiveTab('desempenho');
                      }}
                      className="px-4 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <i className="fa-solid fa-trophy text-amber-400 text-xs"></i>
                      <span>Ver Desempenho em Simulados</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-aba 3: Lote em Escala */}
            {subAbaGeracao === 'escala' && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold text-[10px] px-2.5 py-0.5 rounded tracking-wide">
                        LOTE-500 FAFIPA
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-400">
                        20 SESSÕES SEQUENCIAIS · 25Q POR CADERNO
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-100">
                      Geração em Escala (Lote Completo de 500 Questões)
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Gera as 20 sessões consecutivas de 25 questões calibradas (LOTE-500-S01 a S20) com distribuição balanceada de gabarito e cobertura curricular integral.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleAbrirGeradorLoteCompleto}
                      className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <i className="fa-solid fa-rocket text-xs"></i>
                      <span>Configurar e Gerar Lote 500Q</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        )}

        {/* TELA 3: SESSÕES GERADAS */}
        {activeTab === 'sessoes' && (
          <section className="space-y-6 animate-fadeIn">
            {/* 1. SESSÃO EM RESOLUÇÃO (NO TOPO DA PÁGINA) */}
            {sessaoAtiva && (
              <div id="sessao-ativa-container" className="space-y-4 animate-fadeIn">
                {modoLeituraSessao ? (
                  <div className="flex flex-wrap justify-between items-center bg-[#0a0f1d] p-3.5 rounded-xl border border-blue-900/60 shadow-lg gap-3 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={alternarModoLeitura}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/90 hover:bg-blue-500 text-white border border-blue-400 shadow-md ring-2 ring-blue-500/30 flex items-center gap-2 cursor-pointer transition-all"
                        title="Sair do Modo Leitura (Atalho: Tecla L)"
                      >
                        <i className="fa-solid fa-book-open-reader text-xs"></i>
                        <span>Modo Leitura (ON)</span>
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/40 border border-white/20 text-amber-300">L</span>
                      </button>
                      <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                        Navegação: <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 font-bold text-amber-300">A</kbd> Anterior &bull; <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 font-bold text-amber-300">D</kbd> Próxima
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => mudarQuestaoSessao(-1)}
                        disabled={sessaoAtiva.indice === 0}
                        className="px-3 py-1.5 rounded-lg bg-[#131b2e] hover:bg-[#1f2b47] border border-gray-700 text-xs text-gray-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
                        title="Questão Anterior (Atalho: Tecla A)"
                      >
                        <i className="fa-solid fa-arrow-left text-[11px]"></i>
                        <span>Anterior</span>
                        <kbd className="text-[10px] text-amber-300 font-mono bg-gray-900 px-1 rounded">A</kbd>
                      </button>
                      <span className="text-xs text-gray-200 font-bold font-mono px-2">
                        {sessaoAtiva.indice + 1} / {sessaoAtiva.questaoIds.length}
                      </span>
                      <button
                        onClick={() => mudarQuestaoSessao(1)}
                        disabled={sessaoAtiva.indice === sessaoAtiva.questaoIds.length - 1}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 text-xs disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5 shadow-md"
                        title="Próxima Questão (Atalho: Tecla D)"
                      >
                        <span>Próxima</span>
                        <kbd className="text-[10px] text-amber-300 font-mono bg-blue-950 px-1 rounded">D</kbd>
                        <i className="fa-solid fa-arrow-right text-[11px]"></i>
                      </button>
                      <button onClick={fecharSessaoAtiva} className="btn-secondary text-xs py-1.5 px-3 ml-2" title="Sair da sessão">
                        <i className="fa-solid fa-xmark mr-1"></i> Sair
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-between items-center bg-[#0a0f1d] p-4 rounded-xl border border-[#1e293b] gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {sessaoAtiva.codigo && (
                            <span className="bg-blue-950 text-[#eab308] border border-blue-800 text-xs px-2.5 py-0.5 rounded font-bold font-mono tracking-wide">
                              {sessaoAtiva.codigo}
                            </span>
                          )}
                          <span className="text-sm font-bold text-white flex items-center gap-2">
                            <i className="fa-solid fa-book-open-reader text-blue-400 text-xs"></i> Sessão: {sessaoAtiva.titulo}
                          </span>
                        </div>
                        {sessaoFinalizada && (
                          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700 text-[11px] px-2 py-0.5 rounded font-bold flex items-center gap-1 shadow-sm">
                            <i className="fa-solid fa-circle-check text-emerald-400"></i> Finalizada
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 block mt-0.5">
                        Questão {sessaoAtiva.indice + 1} de {sessaoAtiva.questaoIds.length} &bull; Respondidas: {resumoSessaoAtiva.respondidas}/{resumoSessaoAtiva.totalQuestoes}
                      </span>
                    </div>

                    {/* Resumo Básico de Erros/Acertos & Timer em Minutos e Segundos */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={alternarModoLeitura}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#182238] hover:bg-[#23314f] text-gray-300 hover:text-white border border-[#2e3e60] flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                        title="Ativar Modo Leitura Limpo (Atalho: Tecla L)"
                      >
                        <i className="fa-solid fa-book-open-reader text-xs text-blue-400"></i>
                        <span>Modo Leitura</span>
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/40 border border-white/10 text-amber-300">L</span>
                      </button>

                      {/* Timer */}
                      <div
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold shadow-sm ${
                          sessaoFinalizada
                            ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                            : 'bg-[#131b2e] border-amber-500/60 text-amber-300'
                        }`}
                        title={sessaoFinalizada ? 'Sessão concluída automaticamente na última questão' : 'Timer da sessão em andamento'}
                      >
                        <i className={`fa-solid ${sessaoFinalizada ? 'fa-flag-checkered text-emerald-400' : 'fa-stopwatch text-amber-400 animate-pulse'}`}></i>
                        <span className="text-gray-300 font-sans text-[11px] mr-0.5 font-normal">
                          {sessaoFinalizada ? 'Tempo final:' : 'Tempo:'}
                        </span>
                        <span className="text-sm tracking-wider">{formatarTempoMinutosSegundos(sessaoTempoSegundos)}</span>
                      </div>

                      {/* Ritmo: Minutos por Questão (m/q) */}
                      {sessaoTempoSegundos > 0 && (
                        <div
                          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold shadow-sm bg-indigo-950/70 border-indigo-800/70 text-indigo-300"
                          title={`Ritmo da sessão: ${formatarMinutosPorQuestao(
                            sessaoFinalizada
                              ? (resumoSessaoAtiva.totalQuestoes || resumoSessaoAtiva.respondidas)
                              : (resumoSessaoAtiva.respondidas || 1),
                            sessaoTempoSegundos
                          )} minutos por questão`}
                        >
                          <i className="fa-solid fa-gauge-high text-indigo-400 text-[11px]"></i>
                          <span className="text-sm tracking-tight">
                            {formatarMinutosPorQuestao(
                              sessaoFinalizada
                                ? (resumoSessaoAtiva.totalQuestoes || resumoSessaoAtiva.respondidas)
                                : (resumoSessaoAtiva.respondidas || 1),
                              sessaoTempoSegundos
                            )}
                          </span>
                          <span className="text-[11px] text-indigo-300/80 font-sans font-normal ml-0.5">min/q</span>
                        </div>
                      )}

                      {/* Resumo de Acertos */}
                      <span
                        className="bg-green-950/70 border border-green-800 text-green-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                        title="Acertos nesta sessão"
                      >
                        <i className="fa-solid fa-circle-check text-green-400 text-xs"></i>
                        <span>{resumoSessaoAtiva.acertos} {resumoSessaoAtiva.acertos === 1 ? 'acerto' : 'acertos'}</span>
                      </span>

                      {/* Resumo de Erros */}
                      <span
                        className="bg-red-950/70 border border-red-800 text-red-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                        title="Erros nesta sessão"
                      >
                        <i className="fa-solid fa-circle-xmark text-red-400 text-xs"></i>
                        <span>{resumoSessaoAtiva.erros} {resumoSessaoAtiva.erros === 1 ? 'erro' : 'erros'}</span>
                      </span>

                      {/* Taxa de Acerto da Sessão */}
                      <span
                        className="bg-blue-950/70 border border-blue-800 text-blue-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                        title="Taxa de aproveitamento da sessão"
                      >
                        <i className="fa-solid fa-chart-simple text-blue-400 text-[11px]"></i>
                        <span>{resumoSessaoAtiva.taxa}%</span>
                      </span>

                      {sessaoFinalizada ? (
                        <button
                          onClick={reiniciarSessaoAtiva}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs py-1.5 px-3 rounded-lg font-bold transition flex items-center shadow-md"
                          title="Refazer esta sessão do início com novo timer e assertividade"
                        >
                          <i className="fa-solid fa-rotate-right mr-1"></i> Refazer Sessão
                        </button>
                      ) : (
                        <button
                          onClick={reiniciarSessaoAtiva}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-xs py-1.5 px-3 rounded-lg font-medium transition flex items-center"
                          title="Reiniciar sessão do zero"
                        >
                          <i className="fa-solid fa-rotate-right mr-1"></i> Reiniciar
                        </button>
                      )}

                      <button onClick={fecharSessaoAtiva} className="btn-secondary text-xs py-1.5 px-3 ml-1">
                        <i className="fa-solid fa-xmark mr-1"></i> Sair da Sessão
                      </button>
                    </div>
                  </div>
                )}

                {/* Banner Informativo quando Concluída */}
                {sessaoFinalizada && (
                  <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-emerald-200">
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-circle-check text-emerald-400 text-lg"></i>
                      <span className="text-xs md:text-sm">
                        Sessão concluída! Assertividade registrada: <b>{resumoSessaoAtiva.taxa}%</b> ({resumoSessaoAtiva.acertos}/{resumoSessaoAtiva.totalQuestoes} acertos) em <b>{formatarTempoMinutosSegundos(sessaoTempoSegundos)}</b> ({formatarMinutosPorQuestao(resumoSessaoAtiva.totalQuestoes || resumoSessaoAtiva.respondidas, sessaoTempoSegundos)} min/q).
                      </span>
                    </div>
                    <button
                      onClick={reiniciarSessaoAtiva}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center shadow-md shrink-0"
                      title="Refazer sessão do início (registra novo tempo e assertividade)"
                    >
                      <i className="fa-solid fa-rotate-right mr-1.5"></i> Refazer Sessão
                    </button>
                  </div>
                )}

                {/* Botões de Navegação Acima da Questão */}
                {!modoLeituraSessao && (
                  <div className="flex justify-between items-center bg-[#131b2e] border border-[#1e293b] p-3 rounded-xl">
                    <button
                      onClick={() => mudarQuestaoSessao(-1)}
                      disabled={sessaoAtiva.indice === 0}
                      className="btn-secondary text-xs disabled:opacity-40"
                    >
                      <i className="fa-solid fa-arrow-left mr-2"></i> Anterior
                    </button>
                    <span className="text-xs text-gray-300 font-bold">
                      Questão {sessaoAtiva.indice + 1} de {sessaoAtiva.questaoIds.length}
                    </span>
                    <button
                      onClick={() => mudarQuestaoSessao(1)}
                      disabled={sessaoAtiva.indice === sessaoAtiva.questaoIds.length - 1}
                      className="btn-primary text-xs disabled:opacity-40"
                    >
                      Próxima <i className="fa-solid fa-arrow-right ml-2"></i>
                    </button>
                  </div>
                )}

                {/* Questão Render */}
                {(() => {
                  const qId = sessaoAtiva.questaoIds[sessaoAtiva.indice];
                  let q = questoes.find((item) => String(item.id) === String(qId));
                  if (!q && sessaoAtiva.questoesSnap) {
                    q = sessaoAtiva.questoesSnap.find((item) => String(item.id) === String(qId));
                  }
                  if (!q) {
                    const ehSimulado =
                      String(sessaoAtiva.codigo || '').toUpperCase().startsWith('SIM-') ||
                      String(sessaoAtiva.assunto || '').toLowerCase().includes('simulado');

                    return (
                      <div className="bg-[#131b2e] border border-amber-800/60 rounded-xl p-6 text-gray-300 text-sm space-y-4 shadow-xl">
                        <div className="flex items-start gap-3">
                          <i className="fa-solid fa-triangle-exclamation text-amber-400 text-lg mt-0.5 shrink-0"></i>
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-200">
                              Questão {sessaoAtiva.indice + 1} de {sessaoAtiva.questaoIds.length} não localizada no cache local
                            </p>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              Esta questão do simulado <strong className="text-amber-300">{sessaoAtiva.codigo}</strong> não foi encontrada na memória deste dispositivo. Você pode acionar a recomposição para restaurar ou gerar as questões faltantes preservando o código do simulado e os pesos oficiais da banca FAFIPA.
                            </p>
                          </div>
                        </div>
                        {ehSimulado && (
                          <div className="pt-3 border-t border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[11px] text-gray-400 font-mono">
                              ID: {String(qId)} &bull; {sessaoAtiva.codigo}
                            </span>
                            <button
                              onClick={() => recomporQuestoesSimuladoAtivo()}
                              disabled={recompondoSimulado}
                              className="btn-primary text-xs py-2 px-4 flex items-center gap-2 shadow-md disabled:opacity-50"
                            >
                              {recompondoSimulado ? (
                                <>
                                  <i className="fa-solid fa-spinner fa-spin"></i>
                                  Recompondo questões pela grade FAFIPA...
                                </>
                              ) : (
                                <>
                                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                                  Recompor Questões da Grade Oficial FAFIPA
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }

                  const respSalva = sessaoAtiva.respostasTemp[qId];

                  return (
                    <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
                      <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 border-b border-[#1e293b] pb-3 gap-2">
                        <div className="flex flex-wrap items-center space-x-2 gap-y-1">
                          <span className="bg-blue-950 text-[#eab308] border border-blue-800 px-2.5 py-1 rounded font-medium">
                            {q.banca}
                          </span>
                          {q.cargo && (
                            <span className="bg-amber-950/60 text-amber-300 border border-amber-800/70 px-2.5 py-1 rounded font-medium flex items-center gap-1">
                              <i className="fa-solid fa-briefcase text-[10px]"></i> {q.cargo}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setQuestaoParaReclassificar(q)}
                            className="bg-[#1e293b] hover:bg-[#28354b] text-gray-200 hover:text-white border border-[#334155]/60 hover:border-blue-500/80 px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5 group"
                            title="Clique para alterar o Bloco no EAP (reclassificar manualmente)"
                          >
                            <span>📚 {q.disciplina}</span>
                            <i className="fa-solid fa-pen-to-square text-[9px] text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuestaoParaReclassificar(q)}
                            className="bg-[#0a0f1d] hover:bg-[#131c31] border border-[#1e293b] hover:border-emerald-500/80 px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5 group"
                            title="Clique para alterar a Matéria no EAP (reclassificar manualmente)"
                          >
                            <span>📜 {q.assunto}</span>
                            <i className="fa-solid fa-pen-to-square text-[9px] text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity"></i>
                          </button>
                          {/* Badge minimalista discreto para questão de prova real */}
                          {(() => {
                            const badge = formatarBadgeMinimalistaProva(q);
                            if (!badge) return null;
                            return (
                              <span
                                className="bg-purple-950/70 text-purple-300 border border-purple-800/70 text-[11px] font-mono px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm"
                                title="Questão Oficial de Prova Real"
                              >
                                <i className="fa-solid fa-stamp text-[9px] text-purple-400"></i>
                                <span>{badge.textoFormatado}</span>
                              </span>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-3">
                          <BotaoFeedbackQuestao questao={q} />
                          {q.artigo && <span className="text-gray-500 font-mono text-[11px]">{q.artigo}</span>}
                        </div>
                      </div>

                      <EnunciadoQuestao enunciado={q.enunciado} questaoId={q.id} />

                      <div className="relative border-l border-gray-800/80 ml-3.5 pl-6 space-y-2.5 pt-2">
                        {q.alternativas.map((alt, idx) => {
                          const riscada = estaAlternativaRiscada(alternativasRiscadas, q.id, idx);
                          let classeAlt = 'border-[#1e293b] bg-[#0a0f1d] hover:border-blue-500 text-gray-300';
                          const disabled = respSalva !== undefined;

                          if (respSalva !== undefined) {
                            if (idx === q.correta) {
                              classeAlt = 'border-green-600 bg-green-950/40 text-green-200 font-medium';
                            } else if (idx === respSalva.escolha) {
                              classeAlt = 'border-red-600 bg-red-950/40 text-red-200';
                            }
                          } else if (riscada) {
                            classeAlt = 'border-dashed border-gray-800/80 bg-[#080c16]/70 text-gray-500 hover:border-gray-700';
                          }

                          return (
                            <div key={idx} className="relative group">
                              {/* Botão Tesourinha para riscar / restaurar alternativa */}
                              <button
                                type="button"
                                onClick={(e) => alternarRiscoAlternativa(q.id, idx, e)}
                                className={`group/btn absolute -left-6 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-xs transition-all z-20 cursor-pointer ${
                                  riscada
                                    ? 'opacity-100 bg-amber-400 text-gray-950 font-bold border border-amber-300 shadow-md ring-2 ring-amber-400/40 scale-105'
                                    : 'opacity-0 group-hover:opacity-100 bg-[#162035] hover:bg-[#1f2d4a] text-gray-400 hover:text-amber-300 border border-dashed border-gray-600 hover:border-amber-400/80 shadow-sm'
                                }`}
                                aria-label={riscada ? 'Restaurar alternativa' : 'Riscar alternativa'}
                                title={riscada ? 'Restaurar alternativa eliminada' : 'Riscar alternativa para eliminá-la'}
                              >
                                <i className={`fa-solid fa-scissors text-[11px] ${riscada ? 'rotate-[-45deg]' : ''} transition-transform`}></i>
                                {/* Tooltip flutuante explicativo */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover/btn:block px-2 py-0.5 bg-white text-gray-950 text-[11px] font-bold rounded-md shadow-2xl border border-gray-200 whitespace-nowrap pointer-events-none z-30 animate-fadeIn">
                                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-t border-l border-gray-200"></div>
                                  {riscada ? 'Restaurar alternativa' : 'Riscar alternativa'}
                                </div>
                              </button>

                              {/* Card da Alternativa */}
                              <button
                                disabled={disabled}
                                onClick={() => {
                                  if (disabled) return;
                                  if (riscada) {
                                    alternarRiscoAlternativa(q.id, idx);
                                    return;
                                  }
                                  responderSessaoAtiva(q.id, idx);
                                }}
                                className={`w-full text-left p-3.5 rounded-lg border ${classeAlt} ${
                                  riscada ? 'opacity-40 hover:opacity-75' : ''
                                } transition flex items-start space-x-3 text-sm cursor-pointer`}
                              >
                                <span
                                  className={`w-7 h-7 rounded-md border flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                    riscada
                                      ? 'bg-[#0f1420] text-gray-500 border-gray-800 line-through'
                                      : respSalva !== undefined && idx === q.correta
                                      ? 'bg-green-900/60 text-green-300 border-green-600'
                                      : respSalva !== undefined && idx === respSalva.escolha
                                      ? 'bg-red-900/60 text-red-300 border-red-600'
                                      : 'bg-[#141a29] text-gray-300 border-gray-700/80 group-hover:border-blue-500 group-hover:text-white'
                                  }`}
                                >
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span
                                  className={`flex-1 pt-0.5 leading-relaxed ${
                                    riscada ? 'line-through text-gray-500 decoration-2 decoration-gray-500/80 italic select-none' : ''
                                  }`}
                                >
                                  {limparSintaxeLatex(alt.replace(/^[A-E]\)\s*/, ''))}
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {respSalva !== undefined && (
                        <div className="mt-4 p-4 rounded-lg bg-[#0a0f1d] border border-[#1e293b] space-y-2 animate-fadeIn">
                          <div className="flex justify-between items-center text-sm">
                            {respSalva.acertou ? (
                              <span className="text-green-400 font-bold flex items-center">
                                <i className="fa-solid fa-check mr-1.5"></i> Resposta Correta!
                              </span>
                            ) : (
                              <span className="text-red-400 font-bold flex items-center">
                                <i className="fa-solid fa-xmark mr-1.5"></i> Resposta Incorreta.
                              </span>
                            )}
                            <span className="text-xs text-gray-400">{q.artigo}</span>
                          </div>
                          {renderizarGabaritoComentadoComIa(q)}
                        </div>
                      )}

                      {/* Botões de Navegação Rodapé da Questão */}
                      <div className="flex justify-between items-center border-t border-[#1e293b] pt-4 mt-6">
                        <button
                          onClick={() => {
                            mudarQuestaoSessao(-1);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          disabled={sessaoAtiva.indice === 0}
                          className="btn-secondary text-xs disabled:opacity-40"
                        >
                          <i className="fa-solid fa-arrow-left mr-2"></i> Questão Anterior
                        </button>
                        <span className="text-xs text-gray-400 font-medium">
                          Questão {sessaoAtiva.indice + 1} de {sessaoAtiva.questaoIds.length}
                        </span>
                        <button
                          onClick={() => {
                            mudarQuestaoSessao(1);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          disabled={sessaoAtiva.indice === sessaoAtiva.questaoIds.length - 1}
                          className="btn-primary text-xs disabled:opacity-40"
                        >
                          Próxima Questão <i className="fa-solid fa-arrow-right ml-2"></i>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SESSÕES GERADAS / HISTÓRICO DE CADERNOS */}
            {(!modoLeituraSessao || !sessaoAtiva) && (
              <div className="bg-[#101626] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap justify-between items-center border-b border-[#1e293b] pb-4 gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <i className="fa-solid fa-layer-group text-blue-500 mr-2"></i> {sessaoAtiva ? "Histórico de Cadernos / Outras Sessões" : "3. Meus Cadernos de Estudo"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {sessaoAtiva
                      ? "A sessão em resolução está aberta no topo. Abaixo está o acervo de cadernos, simulados e provas anteriores."
                      : "Gerencie e resolva seus cadernos de estudo, simulados oficiais e provas anteriores."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {sessaoAtiva && (
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs py-1.5 px-3 rounded-lg font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                      title="Subir para o topo para responder à sessão ativa"
                    >
                      <i className="fa-solid fa-arrow-up text-[11px]"></i> Subir para Sessão no Topo
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-plus text-xs"></i>
                    <span>Nova Geração / Prova</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {(() => {
                  const totalGeral = sessoesCriadas.length;
                  const countEstudo = sessoesCriadas.filter((s) => obterTipoSessao(s) === 'sessao').length;
                  const countSimulados = sessoesCriadas.filter((s) => obterTipoSessao(s) === 'simulado').length;
                  const countProvas = sessoesCriadas.filter((s) => obterTipoSessao(s) === 'prova_anterior').length;
                  const countEscala = sessoesCriadas.filter((s) => obterTipoSessao(s) === 'sessao_escala').length;

                  const sessoesPorTipo = sessoesCriadas.filter((s) => {
                    if (filtroTipoSessao === 'todas') return true;
                    return obterTipoSessao(s) === filtroTipoSessao;
                  });

                  const catalogoOficialSessoes = obterCatalogoAssuntosOficiais();

                  const sessoesComStatus = sessoesPorTipo.map((s) => {
                    let idsParaPassar = s.questaoIds;
                    if (!idsParaPassar || idsParaPassar.length === 0) {
                      idsParaPassar = questoes
                        .filter((q) => q.disciplina === s.disciplina && q.assunto === s.assunto)
                        .map((q) => q.id);
                    }

                    const codigoExibido =
                      s.codigo && !s.codigo.startsWith('SESSAO-')
                        ? s.codigo
                        : gerarCodigoSessaoPadrao(s.disciplina, s.assunto);

                    const infoConclusao = obterInfoConclusaoSessao(
                      s,
                      registrosTempoSessoes,
                      historicoRespostas,
                      codigoExibido
                    );

                    const materiasResumo = extrairResumoMateriasSessao(s, questoes);

                    return { s, idsParaPassar, codigoExibido, infoConclusao, materiasResumo };
                  });

                  const countAberto = sessoesComStatus.filter((item) => !item.infoConclusao.concluida).length;
                  const countConcluidas = sessoesComStatus.filter((item) => item.infoConclusao.concluida).length;

                  const sessoesFiltradas = sessoesComStatus.filter((item) => {
                    if (filtroStatusSessao === 'em_aberto' && item.infoConclusao.concluida) return false;
                    if (filtroStatusSessao === 'concluidas' && !item.infoConclusao.concluida) return false;

                    // Busca textual ampla (código, lei, assunto, bloco ou matérias da sessão)
                    if (filtroSessaoBusca.trim()) {
                      const t = filtroSessaoBusca.trim().toLowerCase();
                      const matchCod = item.codigoExibido.toLowerCase().includes(t);
                      const matchAss = (item.s.assunto || '').toLowerCase().includes(t);
                      const matchDisc = (item.s.disciplina || '').toLowerCase().includes(t);
                      const matchMats = item.materiasResumo.some(
                        (m) =>
                          m.assunto.toLowerCase().includes(t) ||
                          m.blocoNome.toLowerCase().includes(t)
                      );
                      if (!matchCod && !matchAss && !matchDisc && !matchMats) return false;
                    }

                    // Filtro de Bloco Oficial
                    if (filtroSessaoBloco) {
                      const bTerm = filtroSessaoBloco.toLowerCase();
                      const matchDisc = (item.s.disciplina || '').toLowerCase().includes(bTerm);
                      const matchMats = item.materiasResumo.some((m) =>
                        m.blocoNome.toLowerCase().includes(bTerm)
                      );
                      if (!matchDisc && !matchMats) return false;
                    }

                    // Filtro de Assunto / Matéria Oficial
                    if (filtroSessaoAssunto) {
                      const aTerm = filtroSessaoAssunto.toLowerCase();
                      const matchAss = (item.s.assunto || '').toLowerCase().includes(aTerm);
                      const matchMats = item.materiasResumo.some(
                        (m) =>
                          m.assunto.toLowerCase().includes(aTerm) ||
                          aTerm.includes(m.assunto.toLowerCase())
                      );
                      if (!matchAss && !matchMats) return false;
                    }

                    return true;
                  });

                  return (
                    <>
                      {/* Abas de filtro no topo para categorização inspirada no screenshot */}
                      <div className="flex flex-wrap items-center gap-2.5 pb-2">
                        <button
                          type="button"
                          onClick={() => setFiltroTipoSessao('todas')}
                          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                            filtroTipoSessao === 'todas'
                              ? 'bg-[#2563eb] text-white ring-2 ring-blue-400/50'
                              : 'bg-[#1e293b] text-slate-300 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          <i className="fa-solid fa-list-check text-xs"></i>
                          <span>Todas</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#1d4ed8] text-white font-semibold">
                            {totalGeral}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFiltroTipoSessao('sessao')}
                          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all border flex items-center gap-2 cursor-pointer shadow-sm ${
                            filtroTipoSessao === 'sessao'
                              ? 'bg-[#854d0e] text-[#fef08a] border-[#ca8a04] ring-2 ring-yellow-400/50'
                              : 'bg-[#78350f]/80 hover:bg-[#78350f] text-[#fef08a] border-[#b45309]/60'
                          }`}
                        >
                          <i className="fa-solid fa-bolt text-yellow-300 text-xs"></i>
                          <span>Sessões de Estudo</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#451a03] text-[#fef08a] font-semibold">
                            {countEstudo}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFiltroTipoSessao('simulado')}
                          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all border flex items-center gap-2 cursor-pointer shadow-sm ${
                            filtroTipoSessao === 'simulado'
                              ? 'bg-[#9a3412] text-[#fed7aa] border-[#ea580c] ring-2 ring-orange-400/50'
                              : 'bg-[#7c2d12]/80 hover:bg-[#7c2d12] text-[#fed7aa] border-[#c2410c]/60'
                          }`}
                        >
                          <i className="fa-solid fa-bullseye text-orange-300 text-xs"></i>
                          <span>Simulados Oficiais</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#431407] text-[#fed7aa] font-semibold">
                            {countSimulados}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFiltroTipoSessao('prova_anterior')}
                          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all border flex items-center gap-2 cursor-pointer shadow-sm ${
                            filtroTipoSessao === 'prova_anterior'
                              ? 'bg-[#6b21a8] text-[#f3e8ff] border-[#9333ea] ring-2 ring-purple-400/50'
                              : 'bg-[#581c87]/80 hover:bg-[#581c87] text-[#e9d5ff] border-[#7e22ce]/60'
                          }`}
                        >
                          <i className="fa-solid fa-scroll text-purple-300 text-xs"></i>
                          <span>Provas Anteriores FAFIPA</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#3b0764] text-[#e9d5ff] font-semibold">
                            {countProvas}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFiltroTipoSessao('sessao_escala')}
                          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all border flex items-center gap-2 cursor-pointer shadow-sm ${
                            filtroTipoSessao === 'sessao_escala'
                              ? 'bg-[#3730a3] text-[#e0e7ff] border-[#6366f1] ring-2 ring-indigo-400/50'
                              : 'bg-[#312e81]/80 hover:bg-[#312e81] text-[#c7d2fe] border-[#4338ca]/60'
                          }`}
                        >
                          <i className="fa-solid fa-rocket text-indigo-300 text-xs"></i>
                          <span>Sessões em Escala</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#1e1b4b] text-[#c7d2fe] font-semibold">
                            {countEscala}
                          </span>
                        </button>
                      </div>

                      {/* Subfiltro de Status de Conclusão */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 pb-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400 font-semibold text-[11px] mr-1 flex items-center gap-1">
                            <i className="fa-solid fa-filter text-[10px]"></i> Status:
                          </span>
                          <button
                            type="button"
                            onClick={() => setFiltroStatusSessao('todos')}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition border cursor-pointer ${
                              filtroStatusSessao === 'todos'
                                ? 'bg-[#242b3d] text-white border-[#334155]'
                                : 'bg-[#0f1523] text-slate-400 border-[#1e293b] hover:text-white'
                            }`}
                          >
                            Todos ({sessoesPorTipo.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setFiltroStatusSessao('em_aberto')}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition border flex items-center gap-1.5 cursor-pointer ${
                              filtroStatusSessao === 'em_aberto'
                                ? 'bg-[#3f2f17] text-[#fef08a] border-[#78511a]'
                                : 'bg-[#0f1523] text-slate-400 border-[#1e293b] hover:text-white'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            <span>Em Aberto</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 font-mono">
                              {countAberto}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFiltroStatusSessao('concluidas')}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition border flex items-center gap-1.5 cursor-pointer ${
                              filtroStatusSessao === 'concluidas'
                                ? 'bg-[#133222] text-[#86efac] border-[#166534]'
                                : 'bg-[#0f1523] text-slate-400 border-[#1e293b] hover:text-white'
                            }`}
                          >
                            <i className="fa-solid fa-check text-[10px] text-emerald-400"></i>
                            <span>Concluídas</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 font-mono">
                              {countConcluidas}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Barra de Filtro Avançado por Assunto, Bloco e Busca (Cadernos de Estudo) */}
                      <div className="bg-[#0f1523]/80 border border-[#1e293b] rounded-xl p-3.5 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <i className="fa-solid fa-filter text-blue-400 text-xs"></i>
                            <span>Filtrar Cadernos por Assunto / Matéria do Edital:</span>
                          </span>
                          {(filtroSessaoBusca || filtroSessaoBloco || filtroSessaoAssunto) && (
                            <button
                              type="button"
                              onClick={() => {
                                setFiltroSessaoBusca('');
                                setFiltroSessaoBloco('');
                                setFiltroSessaoAssunto('');
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition cursor-pointer"
                            >
                              <i className="fa-solid fa-xmark text-[11px]"></i> Limpar Filtros de Matéria
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                          {/* Busca por texto */}
                          <div className="relative">
                            <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-500 text-xs"></i>
                            <input
                              type="text"
                              value={filtroSessaoBusca}
                              onChange={(e) => setFiltroSessaoBusca(e.target.value)}
                              placeholder="Buscar por código, lei ou assunto..."
                              className="w-full bg-[#141b2d] border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* Seletor de Bloco */}
                          <div>
                            <select
                              value={filtroSessaoBloco}
                              onChange={(e) => {
                                setFiltroSessaoBloco(e.target.value);
                                setFiltroSessaoAssunto('');
                              }}
                              className="w-full bg-[#141b2d] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                              <option value="">Todos os Blocos (1 a 7)</option>
                              {listaDisciplinas.map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Seletor de Assunto / Matéria */}
                          <div>
                            <select
                              value={filtroSessaoAssunto}
                              onChange={(e) => setFiltroSessaoAssunto(e.target.value)}
                              className="w-full bg-[#141b2d] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                              <option value="">Todas as Matérias ({catalogoOficialSessoes.length} Assuntos Oficiais)</option>
                              {catalogoOficialSessoes
                                .filter((cat) => !filtroSessaoBloco || cat.blocoNome.toLowerCase().includes(filtroSessaoBloco.toLowerCase()) || filtroSessaoBloco.toLowerCase().includes(cat.blocoNome.toLowerCase()))
                                .map((cat) => (
                                  <option key={cat.codigo} value={cat.nome}>
                                    [{cat.codigo}] Bloco {cat.blocoNumero}: {cat.nome}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>

                        {/* Indicador de resultados filtrados */}
                        {(filtroSessaoBusca || filtroSessaoBloco || filtroSessaoAssunto) && (
                          <div className="text-[11px] text-blue-300/90 flex items-center gap-1.5 pt-0.5">
                            <i className="fa-solid fa-circle-info text-blue-400 text-[10px]"></i>
                            <span>
                              Exibindo <strong>{sessoesFiltradas.length}</strong> de <strong>{sessoesComStatus.length}</strong> cadernos que contêm o assunto/critério selecionado.
                            </span>
                          </div>
                        )}
                      </div>

                      {sessoesFiltradas.length === 0 ? (
                        <div className="text-slate-400 text-sm italic text-center py-10 bg-[#0f1523]/60 rounded-xl border border-dashed border-[#1e293b]">
                          {filtroTipoSessao === 'sessao_escala'
                            ? 'Nenhuma sessão em escala gerada ainda. Clique em "Gerar Lote 500Q (Escala)" para iniciar a geração automática de 20 sessões de 25 questões calibradas.'
                            : filtroTipoSessao === 'todas'
                            ? 'Nenhuma sessão encontrada para os filtros selecionados.'
                            : filtroTipoSessao === 'prova_anterior'
                            ? 'Nenhuma prova anterior encontrada nesta categoria.'
                            : filtroTipoSessao === 'simulado'
                            ? 'Nenhum simulado oficial encontrado nesta categoria.'
                            : 'Nenhuma sessão de estudo encontrada nesta categoria.'}
                        </div>
                      ) : (
                        sessoesFiltradas.map(({ s, idsParaPassar, codigoExibido, infoConclusao, materiasResumo }, idx) => {
                          const isSessaoAtivaAtual = Boolean(
                            sessaoAtiva &&
                              ((sessaoAtiva.sessaoId && s.id && String(sessaoAtiva.sessaoId) === String(s.id)) ||
                                (sessaoAtiva.codigo && s.codigo && sessaoAtiva.codigo === s.codigo))
                          );

                          const tipoSessao = obterTipoSessao(s);

                          return (
                            <div
                              key={s.id || idx}
                              className={`p-4 sm:p-5 rounded-2xl space-y-3 transition-all ${
                                isSessaoAtivaAtual
                                  ? 'bg-[#121c33] border-2 border-blue-500/80 ring-1 ring-blue-500/30 shadow-lg shadow-blue-950/40'
                                  : 'bg-[#121727] border border-[#1e293b] hover:border-[#334155] shadow-sm'
                              }`}
                            >
                              {(() => {
                                return (
                                  <>
                                    {/* Linha 1: Badges em cápsula exatamente como no design de inspiração */}
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="bg-[#19243d] text-[#60a5fa] border border-[#2563eb]/40 rounded-full text-xs px-3 py-0.5 font-mono font-semibold tracking-wide">
                                        {codigoExibido}
                                      </span>
                                      {tipoSessao === 'sessao_escala' && (
                                        <span className="bg-[#2a2347] text-[#c084fc] border border-[#7e22ce]/40 rounded-full text-xs px-3 py-0.5 font-medium flex items-center gap-1.5 shadow-sm">
                                          <i className="fa-solid fa-rocket text-[10px] text-purple-400"></i> Sessão em Escala
                                        </span>
                                      )}
                                      {tipoSessao === 'prova_anterior' && (
                                        <span className="bg-[#4c2d6f]/80 text-[#d8b4fe] border border-[#6b21a8]/60 rounded-full text-xs px-3 py-0.5 font-medium flex items-center gap-1.5 shadow-sm">
                                          <i className="fa-solid fa-scroll text-[10px] text-purple-400"></i> Prova Oficial FAFIPA
                                        </span>
                                      )}
                                      {tipoSessao === 'simulado' && (
                                        <span className="bg-[#7c4424]/80 text-[#fdba74] border border-[#9a3412]/60 rounded-full text-xs px-3 py-0.5 font-medium flex items-center gap-1.5 shadow-sm">
                                          <i className="fa-solid fa-bullseye text-[10px] text-orange-400"></i> Simulado Oficial
                                        </span>
                                      )}
                                      {tipoSessao === 'sessao' && (
                                        <span className="bg-[#78511a]/80 text-[#fbbf24] border border-[#92400e]/60 rounded-full text-xs px-3 py-0.5 font-medium flex items-center gap-1.5 shadow-sm">
                                          <i className="fa-solid fa-bolt text-yellow-400 text-[10px]"></i> Caderno de Estudo
                                        </span>
                                      )}

                                      {/* Tag Concluída vs Em Aberto */}
                                      {infoConclusao.concluida ? (
                                        <span className="bg-[#133222] text-[#86efac] border border-[#166534]/60 rounded-full text-xs px-3 py-0.5 font-semibold flex items-center gap-1.5 shadow-sm">
                                          <i className="fa-solid fa-circle-check text-[10px] text-emerald-400"></i> Concluída
                                        </span>
                                      ) : (
                                        <span className="bg-[#382c16] text-[#fde047] border border-[#ca8a04]/60 rounded-full text-xs px-3 py-0.5 font-semibold flex items-center gap-1.5 shadow-sm">
                                          <i className="fa-solid fa-hourglass-half text-[10px] text-amber-400"></i> Em Aberto ({infoConclusao.acertos + infoConclusao.erros}/{infoConclusao.total})
                                        </span>
                                      )}

                                      {isSessaoAtivaAtual && (
                                        <span className="bg-blue-600 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm animate-pulse">
                                          <i className="fa-solid fa-pen-nib text-[9px]"></i> Em Resolução no Topo
                                        </span>
                                      )}
                                      <span className="text-xs text-slate-400 font-mono ml-auto flex items-center gap-1">
                                        <i className="fa-regular fa-clock text-[11px]"></i>
                                        {s.dataHora || 'Data não registrada'}
                                      </span>
                                    </div>

                                    {/* Linha 2: Título em Primeiro Plano para Prova Anterior VS Bloco e Lei padrão */}
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-0.5">
                                      {tipoSessao === 'prova_anterior' ? (
                                        <div className="space-y-1 min-w-0">
                                          <div className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2.5 flex-wrap">
                                            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                                            <span className="text-purple-200">
                                              {formatarTituloVisualProva(s)}
                                            </span>
                                            <span className="text-[11px] font-mono text-purple-300 bg-purple-950/70 border border-purple-800/60 px-2.5 py-0.5 rounded-full">
                                              Caderno Oficial de Prova Real
                                            </span>
                                          </div>
                                          <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap font-mono">
                                            <span><strong className="text-slate-300 font-sans">Banca:</strong> {s.banca || 'Fundação FAFIPA'}</span>
                                            <span>•</span>
                                            <span><strong className="text-slate-300 font-sans">Ano:</strong> {s.ano || '2019'}</span>
                                            <span>•</span>
                                            <span><strong className="text-slate-300 font-sans">Órgão:</strong> {s.orgao || 'Prefeitura de Tibagi'}</span>
                                            <span>•</span>
                                            <span><strong className="text-slate-300 font-sans">Cargo:</strong> {s.cargo || 'Engenheiro Civil'}</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-sm font-semibold text-white min-w-0 flex items-center gap-2 flex-wrap">
                                          <i className="fa-solid fa-book-open text-slate-400 text-xs"></i>
                                          <span className="text-slate-300">Bloco:</span>
                                          <span className="text-[#93c5fd] font-semibold">{s.disciplina}</span>
                                          <span className="text-slate-500 font-normal">•</span>
                                          <i className="fa-solid fa-file-lines text-slate-400 text-xs"></i>
                                          <span className="text-slate-300">Lei:</span>
                                          <span className="text-[#4ade80] font-semibold">{s.assunto}</span>
                                        </div>
                                      )}

                                      {/* Métricas ao lado */}
                                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                        {/* Tempo de Realização da Sessão */}
                                        {infoConclusao.temTempo && (
                                          <span
                                            className="bg-[#19243d] text-[#60a5fa] border border-[#2563eb]/40 text-xs px-2.5 py-1 rounded-lg font-mono font-medium flex items-center gap-1.5 shadow-sm"
                                            title={infoConclusao.concluida ? 'Sessão concluída' : 'Tempo acumulado nesta sessão'}
                                          >
                                            <i
                                              className={`fa-solid ${
                                                infoConclusao.concluida ? 'fa-circle-check text-emerald-400' : 'fa-clock text-blue-400'
                                              } text-[11px]`}
                                            ></i>
                                            {formatarTempoMinutosSegundos(infoConclusao.segundos)}
                                          </span>
                                        )}

                                        {/* Ritmo: Minutos por questão (m/q) */}
                                        {infoConclusao.temTempo && infoConclusao.minutosPorQuestaoFormatado && (
                                          <span
                                            className="bg-[#2a2347] text-[#c084fc] border border-[#7e22ce]/40 text-xs px-2 py-1 rounded-lg font-mono font-medium flex items-center gap-1.5 shadow-sm"
                                            title={`Ritmo: ${infoConclusao.minutosPorQuestaoFormatado} min/q`}
                                          >
                                            <i className="fa-solid fa-gauge-high text-purple-400 text-[10px]"></i>
                                            <span>{infoConclusao.minutosPorQuestaoFormatado} <span className="text-[10px] text-purple-300 font-sans">min/q</span></span>
                                          </span>
                                        )}

                                        {/* Assertividade da última conclusão da sessão */}
                                        {infoConclusao.temAssertividade && (
                                          <span
                                            className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold flex items-center gap-1.5 shadow-sm border ${
                                              infoConclusao.taxa >= 70
                                                ? 'bg-[#133222] text-[#86efac] border-[#166534]'
                                                : infoConclusao.taxa >= 50
                                                ? 'bg-[#382c16] text-[#fde047] border-[#ca8a04]'
                                                : 'bg-rose-950/70 text-rose-300 border-rose-800'
                                            }`}
                                            title={`Assertividade: ${infoConclusao.taxa}% (${infoConclusao.acertos}/${infoConclusao.total})`}
                                          >
                                            <i className="fa-solid fa-bullseye text-[11px]"></i>
                                            <span>{infoConclusao.taxa}%</span>
                                            <span className="text-[10px] opacity-75 font-normal">
                                              ({infoConclusao.acertos}/{infoConclusao.total})
                                            </span>
                                          </span>
                                        )}

                                        {/* Quantidade de Questões */}
                                        <span className="bg-[#1c2336] text-[#cbd5e1] text-xs px-3 py-1 rounded-lg font-semibold border border-[#334155]">
                                          {s.quantidade || idsParaPassar.length} Questões
                                        </span>
                                      </div>
                                    </div>

                                    {/* Matérias do Edital Contidas na Sessão (Badges e Detalhamento) */}
                                    {materiasResumo && materiasResumo.length > 0 && (
                                      <div className="space-y-2 pt-1 border-t border-[#1e293b]/60">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mr-1">
                                            <i className="fa-solid fa-tags text-[10px] text-blue-400"></i> Matérias ({materiasResumo.length}):
                                          </span>
                                          {materiasResumo.slice(0, 4).map((mat, mIdx) => {
                                            const isSelected =
                                              filtroSessaoAssunto &&
                                              (mat.assunto.toLowerCase().includes(filtroSessaoAssunto.toLowerCase()) ||
                                                filtroSessaoAssunto.toLowerCase().includes(mat.assunto.toLowerCase()));
                                            return (
                                              <button
                                                key={mIdx}
                                                type="button"
                                                onClick={() => setFiltroSessaoAssunto(isSelected ? '' : mat.assunto)}
                                                className={`text-[11px] px-2.5 py-0.5 rounded-full border transition cursor-pointer flex items-center gap-1 shadow-sm ${
                                                  isSelected
                                                    ? 'bg-blue-600 text-white border-blue-400 font-bold ring-1 ring-blue-300'
                                                    : 'bg-[#151c2e] hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:text-white'
                                                }`}
                                                title={`Filtrar cadernos com questões de: ${mat.assunto}`}
                                              >
                                                <span>
                                                  {mat.assunto.length > 34 ? `${mat.assunto.slice(0, 34)}...` : mat.assunto}
                                                </span>
                                                <span className="text-[10px] font-mono px-1 rounded bg-black/40 text-blue-300 font-bold">
                                                  {mat.quantidade}Q
                                                </span>
                                              </button>
                                            );
                                          })}
                                          {materiasResumo.length > 4 && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setSessaoExpandidaMateriasId(
                                                  sessaoExpandidaMateriasId === (s.id || idx) ? null : (s.id || idx)
                                                )
                                              }
                                              className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700/80 text-blue-300 hover:text-white transition cursor-pointer font-medium"
                                            >
                                              {sessaoExpandidaMateriasId === (s.id || idx)
                                                ? 'Ocultar'
                                                : `+${materiasResumo.length - 4} outras matérias`}
                                            </button>
                                          )}
                                        </div>

                                        {/* Dropdown com a lista completa de matérias desta sessão */}
                                        {sessaoExpandidaMateriasId === (s.id || idx) && (
                                          <div className="bg-[#0b101d] border border-[#1e293b] rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fadeIn text-xs">
                                            {materiasResumo.map((mat, mIdx) => (
                                              <div
                                                key={mIdx}
                                                onClick={() => setFiltroSessaoAssunto(mat.assunto)}
                                                className="flex items-center justify-between p-2 rounded-lg bg-[#111728] border border-slate-800/80 hover:border-blue-500/50 cursor-pointer transition"
                                                title="Clique para filtrar por esta matéria"
                                              >
                                                <div className="min-w-0 pr-2">
                                                  <span className="text-[10px] text-blue-400 block font-semibold">{mat.blocoNome}</span>
                                                  <span className="text-slate-200 truncate block text-[11px]">{mat.assunto}</span>
                                                </div>
                                                <span className="text-xs font-mono font-bold text-emerald-400 shrink-0 bg-black/40 px-2 py-0.5 rounded border border-emerald-950">
                                                  {mat.quantidade}Q
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Feedback visual se houver filtro ativo correspondente */}
                                        {filtroSessaoAssunto && (() => {
                                          const matCorrespondente = materiasResumo.find(
                                            (m) =>
                                              m.assunto.toLowerCase().includes(filtroSessaoAssunto.toLowerCase()) ||
                                              filtroSessaoAssunto.toLowerCase().includes(m.assunto.toLowerCase())
                                          );
                                          if (matCorrespondente) {
                                            return (
                                              <div className="bg-blue-950/40 border border-blue-500/40 rounded-lg px-3 py-1 text-xs text-blue-200 flex items-center gap-1.5 font-medium">
                                                <i className="fa-solid fa-bullseye text-blue-400 text-xs"></i>
                                                <span>
                                                  Esta sessão contém <strong>{matCorrespondente.quantidade} {matCorrespondente.quantidade === 1 ? 'questão' : 'questões'}</strong> de <em>{matCorrespondente.assunto}</em>
                                                </span>
                                              </div>
                                            );
                                          }
                                          return null;
                                        })()}
                                      </div>
                                    )}

                                    {/* Linha 3: Metadados da Banca e Botões de Ação */}
                                    <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-[#1e293b]">
                                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                        <span>Banca: <strong className="text-slate-300 font-medium">{s.banca}</strong></span>
                                        {s.cargo && (
                                          <>
                                            <span className="text-slate-600">•</span>
                                            <span className="text-slate-300 font-medium">Cargo: {s.cargo}</span>
                                          </>
                                        )}
                                      </div>

                                      {/* Botões de Ação da Sessão com o visual do screenshot */}
                                      <div className="flex items-center gap-2 ml-auto">
                                        {isSessaoAtivaAtual ? (
                                          <button
                                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs py-1.5 px-3.5 rounded-lg font-medium transition flex items-center shadow-sm cursor-pointer"
                                            title="Subir para o topo para responder a esta sessão"
                                          >
                                            <i className="fa-solid fa-arrow-up mr-1.5"></i> Respondendo no Topo
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => iniciarSessaoAtiva(idsParaPassar, s.assunto, s, infoConclusao.concluida)}
                                            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs py-1.5 px-4 rounded-lg flex items-center shadow-sm transition cursor-pointer"
                                            title={
                                              infoConclusao.concluida
                                                ? 'Refazer sessão do início no topo da página'
                                                : 'Resolver sessão no topo da página'
                                            }
                                          >
                                            <i className={`fa-solid ${infoConclusao.concluida ? 'fa-rotate-right' : 'fa-play'} mr-1.5 text-[10px]`}></i>
                                            {infoConclusao.concluida ? 'Refazer' : 'Resolver'}
                                          </button>
                                        )}
                                        <button
                                          onClick={() => abrirModalEdicaoSessao({ ...s, codigo: codigoExibido })}
                                          className="bg-[#242b3d] hover:bg-[#334155] text-slate-200 border border-[#334155] text-xs py-1.5 px-3.5 rounded-lg font-medium transition flex items-center cursor-pointer"
                                          title="Editar Sessão / Bloco"
                                        >
                                          <i className="fa-solid fa-pen mr-1.5 text-[10px]"></i> Editar
                                        </button>
                                        <button
                                          onClick={() => apagarSessao(s)}
                                          className="bg-[#242b3d] hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-[#334155] text-xs py-1.5 px-3 rounded-lg font-medium transition flex items-center cursor-pointer"
                                          title="Apagar Sessão / Bloco"
                                        >
                                          <i className="fa-solid fa-trash mr-1.5 text-[10px]"></i> Apagar
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          );
                        })
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </section>
        )}

        {/* TELA 4: BANCO DE QUESTÕES */}
        {activeTab === 'resolver' && (
          <section className="space-y-6 animate-fadeIn">
            {/* Card de Auditoria e Padronização Paramétrica EAP (7 Blocos / 34 Matérias) */}
            <div className="bg-[#101626] border border-[#1e293b] rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                  <i className="fa-solid fa-sitemap text-base"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Estrutura Paramétrica EAP FAFIPA
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 font-semibold flex items-center gap-1">
                      <i className="fa-solid fa-check-circle text-[9px]"></i> 7 Blocos · 34 Matérias
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Acervo com {questoes.length} questões padronizadas ({relatorioEap.totalJaParametricas} conformes{relatorioEap.totalRecategorizadas > 0 ? `, ${relatorioEap.totalRecategorizadas} pendentes de sincronização` : ''}). Zero fragmentações.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePadronizarEap}
                  disabled={padronizandoEap}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1e293b] hover:bg-slate-700 text-slate-200 border border-slate-600/70 hover:border-slate-500 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                  title="Auditar acervo e persistir padronização dos 7 blocos e 34 matérias no banco de dados e cache"
                >
                  <i className={`fa-solid ${padronizandoEap ? 'fa-spinner fa-spin text-blue-400' : 'fa-arrows-rotate text-blue-400'}`}></i>
                  <span>{padronizandoEap ? 'Padronizando...' : 'Padronizar & Sincronizar EAP'}</span>
                </button>
              </div>
            </div>

            {feedbackEap && (
              <div className="bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 p-3 rounded-xl text-xs flex items-center justify-between shadow-lg animate-fadeIn">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-check text-emerald-400 text-sm"></i>
                  <span>{feedbackEap.mensagem}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackEap(null)}
                  className="text-emerald-400 hover:text-emerald-200 text-xs ml-3"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}

            {/* Filtros de Status & Seleção Múltipla (Filter Chips) - Agrupamento Visual Refinado */}
            <div className="flex flex-wrap gap-2.5 items-center w-full">
              {/* Grupo 1: Origem do Acervo */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800/80 shadow-inner">
                {/* Botão Todas / Minhas Questões */}
                <button
                  type="button"
                  onClick={limparChipsFiltroBanco}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    chipsFiltroBanco.length === 0 && statusFiltroBanco !== 'caderno-erros'
                      ? 'bg-[#2563eb] text-white border-blue-500 shadow-sm ring-2 ring-blue-400/40'
                      : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                  title="Exibir todas as questões sem restrição de status"
                >
                  <i className="fa-solid fa-layer-group text-[11px]"></i>
                  <span>Todas</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ml-0.5 ${
                    chipsFiltroBanco.length === 0 && statusFiltroBanco !== 'caderno-erros'
                      ? 'bg-blue-800 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-800/60'
                  }`}>
                    {questoes.length}
                  </span>
                </button>

                {/* Filter Chip: Simulados */}
                <button
                  type="button"
                  onClick={() => toggleChipFiltroBanco('simulados')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-2 cursor-pointer ${
                    chipsFiltroBanco.includes('simulados')
                      ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm ring-1 ring-slate-600/30'
                      : 'bg-transparent text-slate-300 border-transparent hover:text-slate-100 hover:bg-slate-800/40'
                  }`}
                  title="Filtrar questões originadas de Simulados Oficiais (Seleção Múltipla)"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border transition-all ${
                      chipsFiltroBanco.includes('simulados')
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-slate-700 bg-slate-950/60 text-transparent'
                    }`}
                  >
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <i className="fa-solid fa-file-signature text-blue-400 text-[11px]"></i>
                  <span>Simulados</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-300 tabular-nums border border-slate-800/60">
                    {contagensChipsBanco.simulados}
                  </span>
                </button>

                {/* Filter Chip: Em Escala */}
                <button
                  type="button"
                  onClick={() => toggleChipFiltroBanco('em-escala')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-2 cursor-pointer ${
                    chipsFiltroBanco.includes('em-escala')
                      ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm ring-1 ring-slate-600/30'
                      : 'bg-transparent text-slate-300 border-transparent hover:text-slate-100 hover:bg-slate-800/40'
                  }`}
                  title="Filtrar questões geradas em escala / lotes massivos (Seleção Múltipla)"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border transition-all ${
                      chipsFiltroBanco.includes('em-escala')
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-slate-700 bg-slate-950/60 text-transparent'
                    }`}
                  >
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <i className="fa-solid fa-cubes-stacked text-indigo-400 text-[11px]"></i>
                  <span>Em Escala</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-300 tabular-nums border border-slate-800/60">
                    {contagensChipsBanco['em-escala'] || 0}
                  </span>
                </button>

                {/* Filter Chip: Provas Anteriores FAFIPA */}
                <button
                  type="button"
                  onClick={() => toggleChipFiltroBanco('provas-anteriores')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-2 cursor-pointer ${
                    chipsFiltroBanco.includes('provas-anteriores')
                      ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm ring-1 ring-slate-600/30'
                      : 'bg-transparent text-slate-300 border-transparent hover:text-slate-100 hover:bg-slate-800/40'
                  }`}
                  title="Filtrar questões oficiais de Provas Anteriores FAFIPA (Seleção Múltipla)"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border transition-all ${
                      chipsFiltroBanco.includes('provas-anteriores')
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-slate-700 bg-slate-950/60 text-transparent'
                    }`}
                  >
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <i className="fa-solid fa-award text-amber-400 text-[11px]"></i>
                  <span>Provas Anteriores FAFIPA</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 font-semibold tabular-nums border border-amber-800/50">
                    {contagensChipsBanco['provas-anteriores'] || 0}
                  </span>
                </button>
              </div>

              {/* Divisor Visual Sutil (Separação entre Origem e Status de Resolução) */}
              <div className="hidden xl:flex items-center text-slate-700 select-none px-0.5">
                <i className="fa-solid fa-ellipsis-vertical text-slate-700 text-sm"></i>
              </div>

              {/* Grupo 2: Meu Desempenho / Status de Resolução (Levemente separado visualmente) */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800/80 shadow-inner">
                {/* Filter Chip: Resolvidas */}
                <button
                  type="button"
                  onClick={() => toggleChipFiltroBanco('resolvidas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-2 cursor-pointer ${
                    chipsFiltroBanco.includes('resolvidas')
                      ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm ring-1 ring-slate-600/30'
                      : 'bg-transparent text-slate-300 border-transparent hover:text-slate-100 hover:bg-slate-800/40'
                  }`}
                  title="Filtrar questões resolvidas ao menos 1 vez (Seleção Múltipla)"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border transition-all ${
                      chipsFiltroBanco.includes('resolvidas')
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-slate-700 bg-slate-950/60 text-transparent'
                    }`}
                  >
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <i className="fa-regular fa-circle-check text-sky-400 text-[11px]"></i>
                  <span>Resolvidas</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-300 tabular-nums border border-slate-800/60">
                    {contagensChipsBanco.resolvidas}
                  </span>
                </button>

                {/* Filter Chip: Não resolvidas */}
                <button
                  type="button"
                  onClick={() => toggleChipFiltroBanco('nao-resolvidas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-2 cursor-pointer ${
                    chipsFiltroBanco.includes('nao-resolvidas')
                      ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm ring-1 ring-slate-600/30'
                      : 'bg-transparent text-slate-300 border-transparent hover:text-slate-100 hover:bg-slate-800/40'
                  }`}
                  title="Filtrar questões que ainda não foram resolvidas (Seleção Múltipla)"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border transition-all ${
                      chipsFiltroBanco.includes('nao-resolvidas')
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-slate-700 bg-slate-950/60 text-transparent'
                    }`}
                  >
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <i className="fa-regular fa-circle-question text-slate-400 text-[11px]"></i>
                  <span>Não resolvidas</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-300 tabular-nums border border-slate-800/60">
                    {contagensChipsBanco['nao-resolvidas']}
                  </span>
                </button>

                {/* Filter Chip: Acertei */}
                <button
                  type="button"
                  onClick={() => toggleChipFiltroBanco('acertei')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-2 cursor-pointer ${
                    chipsFiltroBanco.includes('acertei')
                      ? 'bg-emerald-950/70 text-emerald-100 border-emerald-700/80 shadow-sm ring-1 ring-emerald-600/40'
                      : 'bg-transparent text-emerald-400/90 border-transparent hover:text-emerald-200 hover:bg-emerald-950/30'
                  }`}
                  title="Filtrar questões acertadas na última resolução (Seleção Múltipla)"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border transition-all ${
                      chipsFiltroBanco.includes('acertei')
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-emerald-800/60 bg-slate-950/60 text-transparent'
                    }`}
                  >
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <i className="fa-solid fa-check text-emerald-400 text-[11px]"></i>
                  <span>Acertei</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/90 text-emerald-400 tabular-nums border border-emerald-900/50">
                    {contagensChipsBanco.acertei}
                  </span>
                </button>

                {/* Filter Chip: Errei */}
                <button
                  type="button"
                  onClick={() => toggleChipFiltroBanco('errei')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-2 cursor-pointer ${
                    chipsFiltroBanco.includes('errei')
                      ? 'bg-rose-950/70 text-rose-100 border-rose-700/80 shadow-sm ring-1 ring-rose-600/40'
                      : 'bg-transparent text-rose-400/90 border-transparent hover:text-rose-200 hover:bg-rose-950/30'
                  }`}
                  title="Filtrar todas as questões erradas ao menos 1 vez no histórico (cumulativo - Seleção Múltipla)"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border transition-all ${
                      chipsFiltroBanco.includes('errei')
                        ? 'bg-rose-600 border-rose-500 text-white'
                        : 'border-rose-800/60 bg-slate-950/60 text-transparent'
                    }`}
                  >
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <i className="fa-solid fa-xmark text-rose-400 text-[11px]"></i>
                  <span>Errei</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/90 text-rose-400 tabular-nums border border-rose-900/50">
                    {contagensChipsBanco.errei}
                  </span>
                </button>
              </div>

              {/* Grupo 3: Ações de Limpeza & Caderno de Erros */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Botão Limpar Chips (visível quando há chips selecionados) */}
                {chipsFiltroBanco.length > 0 && (
                  <button
                    type="button"
                    onClick={limparChipsFiltroBanco}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
                    title="Limpar todos os filtros de seleção múltipla"
                  >
                    <i className="fa-solid fa-filter-circle-xmark text-[11px]"></i>
                    <span>Limpar ({chipsFiltroBanco.length})</span>
                  </button>
                )}

                {/* Botão em destaque: Caderno de Erros */}
                <button
                  type="button"
                  onClick={() => {
                    setChipsFiltroBanco([]);
                    setChipsFiltroCaderno([]);
                    setStatusFiltroBanco('caderno-erros');
                    setIndiceBanco(0);
                    setBancoQuestaoAtualId(null);
                    setFeedbackCaderno(null);
                    setMostrarComentarioCaderno(false);
                    setRespostasBancoTemp({});
                    setBancoTimerSegundos(0);
                    setBancoTimerAtivo(true);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    statusFiltroBanco === 'caderno-erros'
                      ? 'bg-amber-950/50 text-amber-300 border-amber-600/70 shadow-sm ring-1 ring-amber-500/30'
                      : 'bg-[#121826] text-amber-300/80 border-slate-800/80 hover:bg-slate-800/60 hover:text-amber-200 hover:border-amber-700/50'
                  }`}
                  title="Caderno acumulativo de todas as questões erradas ao menos 1 vez"
                >
                  <i className="fa-solid fa-book-bookmark text-amber-400"></i>
                  <span>Caderno de erros ({totalQuestoesCaderno})</span>
                </button>
              </div>

              {/* Filtros em Pílula / Chips com Seleção Múltipla para o Caderno de Erros */}
              {statusFiltroBanco === 'caderno-erros' && (
                <div className="bg-[#0a0f1d] border border-[#1e293b] p-1.5 rounded-xl flex flex-wrap items-center gap-2 shadow-inner animate-fadeIn ml-1">
                  <span className="text-[11px] text-gray-400 font-semibold px-1.5 hidden sm:inline-flex items-center gap-1">
                    <i className="fa-solid fa-filter text-amber-400 text-[10px]"></i> Filtros:
                  </span>

                  {/* Filter Chip Caderno: Todas (Filtro Desligado) */}
                  <button
                    type="button"
                    onClick={limparChipsFiltroCaderno}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer shadow-sm ${
                      chipsFiltroCaderno.length === 0
                        ? 'bg-blue-600 text-white border-blue-500 shadow-blue-900/30 ring-2 ring-blue-400/30'
                        : 'bg-[#131b2e] text-gray-300 border-[#1e293b] hover:border-gray-600 hover:text-white'
                    }`}
                    title="Exibir todas as questões do caderno de erros"
                  >
                    <i className="fa-solid fa-layer-group text-[11px]"></i>
                    <span>Todas</span>
                    <span className="text-[10px] font-mono opacity-80 ml-0.5">({contagensCaderno.total})</span>
                  </button>

                  {/* Filter Chip Caderno: Reincidentes */}
                  <button
                    type="button"
                    onClick={() => toggleChipFiltroCaderno('reincidente')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-2 cursor-pointer shadow-sm ${
                      chipsFiltroCaderno.includes('reincidente')
                        ? 'bg-rose-950 text-rose-200 border-rose-500 ring-2 ring-rose-500/40 shadow-rose-950/40'
                        : 'bg-[#131b2e] text-gray-300 border-[#1e293b] hover:border-rose-500/50 hover:text-rose-200'
                    }`}
                    title="Filtrar questões com erros reincidentes (erradas 2+ vezes - Seleção Múltipla)"
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border transition-all ${
                        chipsFiltroCaderno.includes('reincidente')
                          ? 'bg-rose-500 border-rose-400 text-white font-bold'
                          : 'border-gray-500 bg-slate-900/60 text-transparent'
                      }`}
                    >
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <i className="fa-solid fa-triangle-exclamation text-rose-400 text-[11px]"></i>
                    <span>Reincidentes</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        chipsFiltroCaderno.includes('reincidente')
                          ? 'bg-rose-900/80 text-rose-200'
                          : 'bg-slate-800 text-gray-400'
                      }`}
                    >
                      {contagensCaderno.reincidente}
                    </span>
                  </button>

                  {/* Filter Chip Caderno: Inéditos */}
                  <button
                    type="button"
                    onClick={() => toggleChipFiltroCaderno('inedito')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-2 cursor-pointer shadow-sm ${
                      chipsFiltroCaderno.includes('inedito')
                        ? 'bg-indigo-950 text-indigo-200 border-indigo-500 ring-2 ring-indigo-500/40 shadow-indigo-950/40'
                        : 'bg-[#131b2e] text-gray-300 border-[#1e293b] hover:border-indigo-500/50 hover:text-indigo-200'
                    }`}
                    title="Filtrar questões com erro inédito (erradas 1 vez - Seleção Múltipla)"
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border transition-all ${
                        chipsFiltroCaderno.includes('inedito')
                          ? 'bg-indigo-500 border-indigo-400 text-white font-bold'
                          : 'border-gray-500 bg-slate-900/60 text-transparent'
                      }`}
                    >
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <i className="fa-solid fa-thumbtack text-indigo-400 text-[11px]"></i>
                    <span>Inéditos</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        chipsFiltroCaderno.includes('inedito')
                          ? 'bg-indigo-900/80 text-indigo-200'
                          : 'bg-slate-800 text-gray-400'
                      }`}
                    >
                      {contagensCaderno.inedito}
                    </span>
                  </button>

                  {/* Filter Chip Caderno: Recuperadas */}
                  <button
                    type="button"
                    onClick={() => toggleChipFiltroCaderno('recuperada')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-2 cursor-pointer shadow-sm ${
                      chipsFiltroCaderno.includes('recuperada')
                        ? 'bg-emerald-950 text-emerald-200 border-emerald-500 ring-2 ring-emerald-500/40 shadow-emerald-950/40'
                        : 'bg-[#131b2e] text-gray-300 border-[#1e293b] hover:border-emerald-500/50 hover:text-emerald-200'
                    }`}
                    title="Filtrar questões recuperadas (já erradas no passado, resolvidas com acerto - Seleção Múltipla)"
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border transition-all ${
                        chipsFiltroCaderno.includes('recuperada')
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                          : 'border-gray-500 bg-slate-900/60 text-transparent'
                      }`}
                    >
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <i className="fa-solid fa-check text-emerald-400 text-[11px]"></i>
                    <span>Recuperadas</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        chipsFiltroCaderno.includes('recuperada')
                          ? 'bg-emerald-900/80 text-emerald-200'
                          : 'bg-slate-800 text-gray-400'
                      }`}
                    >
                      {contagensCaderno.recuperada}
                    </span>
                  </button>

                  {/* Botão Limpar Chips do Caderno (quando há 1 ou mais chips selecionados) */}
                  {chipsFiltroCaderno.length > 0 && (
                    <button
                      type="button"
                      onClick={limparChipsFiltroCaderno}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-amber-300 hover:text-amber-200 bg-amber-950/40 border border-amber-800/60 hover:bg-amber-900/40 transition cursor-pointer flex items-center gap-1"
                      title="Limpar seleção múltipla do caderno de erros"
                    >
                      <i className="fa-solid fa-filter-circle-xmark text-[11px]"></i>
                      <span>Limpar ({chipsFiltroCaderno.length})</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Filtros em Grid */}
            <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-4 space-y-3 shadow-xl">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-gray-500"></i>
                <input
                  type="text"
                  value={filtroPalavra}
                  onChange={(e) => {
                    setFiltroPalavra(e.target.value);
                    setIndiceBanco(0);
                  }}
                  placeholder="Palavra-chave no enunciado..."
                  className="input-field pl-10 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FiltroHierarquicoBlocos
                  tituloDropdown="Filtro de Matérias (Banco)"
                  grupos={gruposBlocosFiltro}
                  blocosSelecionados={bancoBlocosSelecionados}
                  materiasSelecionadas={bancoMateriasSelecionadas}
                  onToggleBloco={toggleBlocoBanco}
                  onToggleMateria={toggleMateriaBanco}
                  onMarcarTodas={marcarTodosItensBanco}
                  onDesmarcarTodas={desmarcarTodosItensBanco}
                />
                <select
                  value={filtroAssunto}
                  onChange={(e) => {
                    setFiltroAssunto(e.target.value);
                    setIndiceBanco(0);
                  }}
                  className="input-field text-sm"
                >
                  <option value="">Assunto (Lei)</option>
                  {(listaAssuntosBanco.length > 0 ? listaAssuntosBanco : listaAssuntos).map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <select
                  value={filtroBanca}
                  onChange={(e) => {
                    setFiltroBanca(e.target.value);
                    setIndiceBanco(0);
                  }}
                  className="input-field text-sm"
                >
                  <option value="">Banca</option>
                  {listaBancas.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cabeçalho da Questão no Banco */}
            <div className="flex justify-between items-center text-sm text-gray-400 px-1">
              <span>
                Mostrando questão{' '}
                <span className="font-bold text-white">
                  {questoesFiltradasBanco.length > 0 ? indiceBanco + 1 : 0}
                </span>{' '}
                de <span className="font-bold text-white">{questoesFiltradasBanco.length}</span>
              </span>
              <button
                onClick={excluirQuestaoAtualBanco}
                disabled={questoesFiltradasBanco.length === 0}
                className="bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-40 flex items-center"
              >
                <i className="fa-solid fa-trash mr-1.5"></i> Excluir Questão
              </button>
            </div>

            {/* Botões de Navegação Acima da Questão (Banco) */}
            {questoesFiltradasBanco.length > 0 && (
              <div className="flex justify-between items-center bg-[#131b2e] border border-[#1e293b] p-3 rounded-xl gap-2">
                <button
                  onClick={() => mudarQuestaoBanco(-1)}
                  disabled={indiceBanco === 0}
                  className="btn-secondary text-xs disabled:opacity-40"
                >
                  <i className="fa-solid fa-arrow-left mr-2"></i> Anterior
                </button>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-gray-300 font-bold">
                    Questão {indiceBanco + 1} de {questoesFiltradasBanco.length}
                  </span>
                  {/* Cronômetro individual da Questão no Banco */}
                  <div
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all shadow-sm ${
                      bancoTimerAtivo
                        ? 'bg-cyan-950/70 border-cyan-500/70 text-cyan-300 shadow-cyan-900/30'
                        : respBancoAtual !== undefined
                        ? respBancoAtual.acertou
                          ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                          : 'bg-rose-950/70 border-rose-500/60 text-rose-300'
                        : 'bg-[#0a0f1d] border-[#1e293b] text-gray-400'
                    }`}
                    title={
                      bancoTimerAtivo
                        ? 'Cronômetro ativo: tempo nesta questão'
                        : respBancoAtual !== undefined
                        ? `Tempo de resposta: ${formatarTempoMinutosSegundos(bancoTimerSegundos)}`
                        : 'Tempo da questão'
                    }
                  >
                    <i
                      className={`fa-solid fa-stopwatch text-xs ${
                        bancoTimerAtivo
                          ? 'text-cyan-400 animate-pulse'
                          : respBancoAtual?.acertou
                          ? 'text-emerald-400'
                          : respBancoAtual
                          ? 'text-rose-400'
                          : 'text-gray-400'
                      }`}
                    ></i>
                    <span>{formatarTempoMinutosSegundos(bancoTimerSegundos)}</span>
                    {bancoTimerAtivo && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    )}
                  </div>

                  {/* Pop-up minimalista e chamativo de 3 segundos ao lado direito do Timer */}
                  {popupResultadoCaderno && (
                    <div
                      role="status"
                      aria-live="assertive"
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black tracking-wide uppercase shadow-2xl border transition-all animate-bounce select-none ${
                        popupResultadoCaderno.tipo === 'acertou'
                          ? 'bg-emerald-500 text-white border-emerald-300 shadow-emerald-500/50 ring-2 ring-emerald-400/60'
                          : 'bg-red-600 text-white border-red-300 shadow-red-600/50 ring-2 ring-red-400/60'
                      }`}
                    >
                      <i
                        className={`text-sm ${
                          popupResultadoCaderno.tipo === 'acertou'
                            ? 'fa-solid fa-circle-check text-white'
                            : 'fa-solid fa-circle-xmark text-white'
                        }`}
                      ></i>
                      <span className="text-[13px] font-black drop-shadow">
                        {popupResultadoCaderno.tipo === 'acertou' ? 'Acertei! ✅' : 'Errei! ❌'}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => mudarQuestaoBanco(1)}
                  disabled={indiceBanco === questoesFiltradasBanco.length - 1}
                  className="btn-primary text-xs disabled:opacity-40"
                >
                  Próxima <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
              </div>
            )}

            {/* Container da Questão */}
            <div className="space-y-4">
              {questoesFiltradasBanco.length === 0 ? (
                <div className="text-center py-16 bg-[#131b2e] border border-[#1e293b] rounded-xl text-gray-500 shadow-xl">
                  <i className="fa-solid fa-filter-circle-xmark text-4xl mb-3 text-[#eab308]"></i>
                  <p className="text-base">Nenhuma questão encontrada com estes filtros.</p>
                </div>
              ) : questaoAtualBanco ? (
                <div className="bg-[#101626] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 border-b border-[#1e293b] pb-3 gap-2">
                    <div className="flex flex-wrap items-center space-x-2 gap-y-1">
                      <span className="bg-[#19243d] text-[#60a5fa] border border-[#2563eb]/40 rounded-full px-3 py-0.5 font-semibold text-xs">
                        {questaoAtualBanco.banca}
                      </span>
                      {questaoAtualBanco.cargo && (
                        <span className="bg-[#7c4424]/80 text-[#fdba74] border border-[#9a3412]/60 rounded-full px-3 py-0.5 font-medium flex items-center gap-1 text-xs">
                          <i className="fa-solid fa-briefcase text-[10px]"></i> {questaoAtualBanco.cargo}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setQuestaoParaReclassificar(questaoAtualBanco)}
                        className="bg-[#1c2336] hover:bg-[#232e46] text-[#cbd5e1] hover:text-white border border-[#334155] hover:border-blue-500/80 rounded-full px-3 py-0.5 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer group shadow-sm"
                        title="Clique para alterar o Bloco no EAP (reclassificar manualmente)"
                      >
                        <span>📚 {questaoAtualBanco.disciplina}</span>
                        <i className="fa-solid fa-pen-to-square text-[9px] text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestaoParaReclassificar(questaoAtualBanco)}
                        className="bg-[#121727] hover:bg-[#182338] text-[#4ade80] hover:text-emerald-300 border border-[#166534]/50 hover:border-emerald-500/80 rounded-full px-3 py-0.5 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer group shadow-sm"
                        title="Clique para alterar a Matéria no EAP (reclassificar manualmente)"
                      >
                        <span>📜 {questaoAtualBanco.assunto}</span>
                        <i className="fa-solid fa-pen-to-square text-[9px] text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity"></i>
                      </button>
                      {/* Badge minimalista discreto para questão de prova real */}
                      {(() => {
                        const badge = formatarBadgeMinimalistaProva(questaoAtualBanco);
                        if (!badge) return null;
                        return (
                          <span
                            className="bg-purple-950/70 text-purple-300 border border-purple-800/70 text-[11px] font-mono px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm"
                            title="Questão Oficial de Prova Real"
                          >
                            <i className="fa-solid fa-stamp text-[9px] text-purple-400"></i>
                            <span>{badge.textoFormatado}</span>
                          </span>
                        );
                      })()}
                      {/* Tag do Caderno de Erros (Recuperada / Reincidente / Erro Inédito) */}
                      {(() => {
                        const infoCaderno = classificarStatusCaderno(
                          historicoRespostas[String(questaoAtualBanco.id)] ||
                            historicoRespostas[Number(questaoAtualBanco.id)] ||
                            []
                        );
                        if (!infoCaderno) return null;
                        if (infoCaderno.status === 'recuperada') {
                          return (
                            <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-600 px-2.5 py-1 rounded font-bold shadow-sm flex items-center gap-1 text-xs">
                              RECUPERADA ✅
                            </span>
                          );
                        }
                        if (infoCaderno.status === 'reincidente') {
                          return (
                            <span className="bg-rose-950/90 text-rose-300 border border-rose-600 px-2.5 py-1 rounded font-bold shadow-sm flex items-center gap-1 text-xs animate-pulse">
                              REINCIDENTE ⚠️
                            </span>
                          );
                        }
                        return (
                          <span className="bg-indigo-950/90 text-indigo-300 border border-indigo-700 px-2.5 py-1 rounded font-bold shadow-sm flex items-center gap-1 text-xs">
                            ERRO INÉDITO 📌
                          </span>
                        );
                      })()}
                      {/* Feedback imediato de resolução no Caderno de Erros */}
                      {isModoCaderno && feedbackCaderno && String(feedbackCaderno.questaoId) === String(questaoAtualBanco.id) && (
                        <span
                          className={`px-2.5 py-1 rounded font-bold text-xs flex items-center gap-1.5 animate-fadeIn border ${
                            feedbackCaderno.status === 'recuperada'
                              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-sm'
                              : 'bg-rose-950/90 text-rose-300 border-rose-500 shadow-sm'
                          }`}
                        >
                          <i className={`fa-solid ${feedbackCaderno.status === 'recuperada' ? 'fa-circle-check text-emerald-400' : 'fa-triangle-exclamation text-rose-400'}`}></i>
                          <span>{feedbackCaderno.status === 'recuperada' ? 'Tentativa registrada: RECUPERADA ✅' : 'Tentativa registrada: REINCIDENTE ⚠️'}</span>
                        </span>
                      )}
                    </div>

                    {/* Canto direito: Há quantos dias a questão foi resolvida (no Caderno de Erros) + Item da Norma */}
                    <div className="flex flex-col items-end text-right self-center sm:self-start ml-auto">
                      {isModoCaderno && (() => {
                        const tentativasQ =
                          historicoRespostas[String(questaoAtualBanco.id)] ||
                          historicoRespostas[Number(questaoAtualBanco.id)] ||
                          [];
                        const infoDias = calcularDiasDesdeUltimaResolucao(tentativasQ);
                        if (!infoDias) return null;
                        return (
                          <span
                            className="text-[11px] text-gray-400 font-normal tracking-tight flex items-center gap-1.5 mb-0.5"
                            title={`Última resolução registrada: ${infoDias.texto}`}
                          >
                            <i className="fa-regular fa-clock text-[10px] text-gray-400"></i>
                            <span>{infoDias.texto}</span>
                          </span>
                        );
                      })()}
                      <div className="flex items-center gap-2 mt-1">
                        <BotaoFeedbackQuestao questao={questaoAtualBanco} />
                        {questaoAtualBanco.artigo ? (
                          <span className="text-gray-500 font-mono text-[11px] leading-tight">
                            {questaoAtualBanco.artigo}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <EnunciadoQuestao
                    enunciado={questaoAtualBanco.enunciado}
                    questaoId={questaoAtualBanco.id}
                  />

                  <div className="relative border-l border-gray-800/80 ml-3.5 pl-6 space-y-2.5 pt-2">
                    {questaoAtualBanco.alternativas.map((alt, idx) => {
                      const riscada = estaAlternativaRiscada(alternativasRiscadas, questaoAtualBanco.id, idx);
                      let classeAlt = 'border-[#1e293b] bg-[#0a0f1d] hover:border-blue-500 text-gray-300';
                      const disabled = respBancoAtual !== undefined;

                      if (respBancoAtual !== undefined) {
                        if (idx === questaoAtualBanco.correta) {
                          classeAlt = 'border-green-600 bg-green-950/40 text-green-200 font-medium';
                        } else if (idx === respBancoAtual.escolha) {
                          classeAlt = 'border-red-600 bg-red-950/40 text-red-200';
                        }
                      } else if (riscada) {
                        classeAlt = 'border-dashed border-gray-800/80 bg-[#080c16]/70 text-gray-500 hover:border-gray-700';
                      }

                      return (
                        <div key={idx} className="relative group">
                          {/* Botão Tesourinha para riscar / restaurar alternativa */}
                          <button
                            type="button"
                            onClick={(e) => alternarRiscoAlternativa(questaoAtualBanco.id, idx, e)}
                            className={`group/btn absolute -left-6 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-xs transition-all z-20 cursor-pointer ${
                              riscada
                                ? 'opacity-100 bg-amber-400 text-gray-950 font-bold border border-amber-300 shadow-md ring-2 ring-amber-400/40 scale-105'
                                : 'opacity-0 group-hover:opacity-100 bg-[#162035] hover:bg-[#1f2d4a] text-gray-400 hover:text-amber-300 border border-dashed border-gray-600 hover:border-amber-400/80 shadow-sm'
                            }`}
                            aria-label={riscada ? 'Restaurar alternativa' : 'Riscar alternativa'}
                            title={riscada ? 'Restaurar alternativa eliminada' : 'Riscar alternativa para eliminá-la'}
                          >
                            <i className={`fa-solid fa-scissors text-[11px] ${riscada ? 'rotate-[-45deg]' : ''} transition-transform`}></i>
                            {/* Tooltip flutuante explicativo */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover/btn:block px-2 py-0.5 bg-white text-gray-950 text-[11px] font-bold rounded-md shadow-2xl border border-gray-200 whitespace-nowrap pointer-events-none z-30 animate-fadeIn">
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-t border-l border-gray-200"></div>
                              {riscada ? 'Restaurar alternativa' : 'Riscar alternativa'}
                            </div>
                          </button>

                          {/* Card da Alternativa */}
                          <button
                            disabled={disabled}
                            onClick={() => {
                              if (disabled) return;
                              if (riscada) {
                                alternarRiscoAlternativa(questaoAtualBanco.id, idx);
                                return;
                              }
                              responderQuestaoBanco(questaoAtualBanco.id, idx);
                            }}
                            className={`w-full text-left p-3.5 rounded-lg border ${classeAlt} ${
                              riscada ? 'opacity-40 hover:opacity-75' : ''
                            } transition flex items-start space-x-3 text-sm cursor-pointer`}
                          >
                            <span
                              className={`w-7 h-7 rounded-md border flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                riscada
                                  ? 'bg-[#0f1420] text-gray-500 border-gray-800 line-through'
                                  : respBancoAtual !== undefined && idx === questaoAtualBanco.correta
                                  ? 'bg-green-900/60 text-green-300 border-green-600'
                                  : respBancoAtual !== undefined && idx === respBancoAtual.escolha
                                  ? 'bg-red-900/60 text-red-300 border-red-600'
                                  : 'bg-[#141a29] text-gray-300 border-gray-700/80 group-hover:border-blue-500 group-hover:text-white'
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span
                              className={`flex-1 pt-0.5 leading-relaxed ${
                                riscada ? 'line-through text-gray-500 decoration-2 decoration-gray-500/80 italic select-none' : ''
                              }`}
                            >
                              {limparSintaxeLatex(alt.replace(/^[A-E]\)\s*/, ''))}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bloco de Gabarito para o Banco Geral (quando não for Caderno de Erros) */}
                  {respBancoAtual !== undefined && !isModoCaderno && (
                    <div className="mt-4 p-4 rounded-lg bg-[#0a0f1d] border border-[#1e293b] space-y-3 animate-fadeIn">
                      <div className="flex justify-between items-center text-sm">
                        {respBancoAtual.acertou ? (
                          <span className="text-green-400 font-bold flex items-center gap-1.5">
                            <i className="fa-solid fa-check mr-1.5"></i> Resposta Correta!
                            <span className="text-xs font-mono font-medium text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 ml-1">
                              {formatarTempoMinutosSegundos(bancoTimerSegundos)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-red-400 font-bold flex items-center gap-1.5">
                            <i className="fa-solid fa-xmark mr-1.5"></i> Resposta Incorreta.
                            <span className="text-xs font-mono font-medium text-rose-300 px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-700/60 ml-1">
                              {formatarTempoMinutosSegundos(bancoTimerSegundos)}
                            </span>
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{questaoAtualBanco.artigo}</span>
                      </div>
                      {renderizarGabaritoComentadoComIa(questaoAtualBanco)}
                      <div className="flex justify-end pt-1 border-t border-[#1e293b]/50">
                        <button
                          onClick={() => {
                            setRespostasBancoTemp((prev) => {
                              const clone = { ...prev };
                              delete clone[questaoAtualBanco.id];
                              return clone;
                            });
                            setBancoTimerSegundos(0);
                            setBancoTimerAtivo(true);
                          }}
                          className="btn-secondary text-xs py-1 px-3 text-gray-300 hover:text-white flex items-center cursor-pointer"
                        >
                          <i className="fa-solid fa-rotate-right mr-1.5 text-[#eab308]"></i> Refazer / Tentar Novamente
                        </button>
                      </div>
                    </div>
                  )}

                  {/* No Caderno de Erros: a questão se mantém sempre neutra para refazer, sem gabarito grifado */}
                  {isModoCaderno && (
                    <div className="mt-4 pt-3 border-t border-[#1e293b] flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        <span>
                          <b>Caderno de Erros:</b> Alternativas sempre neutras para você refazer e treinar livremente. O gabarito não é grifado.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMostrarComentarioCaderno((prev) => !prev)}
                        className="text-xs text-gray-300 hover:text-amber-300 border border-[#1e293b] hover:border-amber-500/50 bg-[#0a0f1d] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Consultar fundamentação legal sem grifar alternativas"
                      >
                        <i className={`fa-solid ${mostrarComentarioCaderno ? 'fa-eye-slash' : 'fa-lightbulb'} text-amber-400 text-xs`}></i>
                        <span>{mostrarComentarioCaderno ? 'Ocultar Fundamentação' : 'Ver Comentário / Fundamentação'}</span>
                      </button>
                    </div>
                  )}

                  {isModoCaderno && mostrarComentarioCaderno && (
                    <div className="mt-3 p-4 rounded-lg bg-[#0a0f1d] border border-[#1e293b] space-y-2 animate-fadeIn text-xs text-gray-300">
                      <div className="flex justify-between items-center text-gray-400 border-b border-[#1e293b] pb-2">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          <i className="fa-solid fa-graduation-cap"></i> Comentário e Fundamentação Legal
                        </span>
                        <span className="text-[11px] font-mono text-gray-400">{questaoAtualBanco.artigo}</span>
                      </div>
                      {renderizarGabaritoComentadoComIa(questaoAtualBanco)}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </section>
        )}

        {/* TELA 5: MEU DESEMPENHO */}
        {activeTab === 'desempenho' && (
          <section className="space-y-6 animate-fadeIn">
            {/* Header com Título e Botão Slide de 2 Modos: INÉDITO vs RECUPERADO + Total Resolvido + Botão Atualizar */}
            <div className="flex flex-wrap justify-between items-center bg-[#101626] border border-[#1e293b] rounded-2xl p-6 shadow-xl gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>Meu desempenho</span>
                  {modoVisualizacaoDesempenho === 'recuperacao' ? (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 animate-fadeIn">
                      MODO RECUPERADO
                    </span>
                  ) : modoVisualizacaoDesempenho === 'simulados' ? (
                    <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-fadeIn flex items-center gap-1.5">
                      <i className="fa-solid fa-trophy text-[10px] text-amber-400"></i>
                      MODO SIMULADOS (PROVA REAL)
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700 animate-fadeIn">
                      MODO INÉDITO
                    </span>
                  )}
                </h2>
                {modoVisualizacaoDesempenho !== 'simulados' && (
                  <p className="text-xs text-gray-400 mt-1">
                    {modoVisualizacaoDesempenho === 'recuperacao'
                      ? 'Acompanhe a reincidência de erros e a taxa de recuperação das questões já erradas.'
                      : 'Acompanhe a taxa de acerto real nas primeiras resoluções de questões inéditas.'}
                  </p>
                )}
              </div>

              {/* Seletor de visualização + Total Resolvido + Botão de atualização rápida mantendo filtros */}
              <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                {/* Botão de Slide de 3 Modos no Topo: INÉDITO vs RECUPERADO vs SIMULADOS */}
                <div className="bg-[#0a0f1d] border border-[#1e293b] p-1 rounded-xl flex items-center shadow-inner">
                  <button
                    onClick={() => setModoVisualizacaoDesempenho('acertos')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      modoVisualizacaoDesempenho === 'acertos'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                    title="Visualização padrão focada nas primeiras resoluções de questões inéditas"
                  >
                    <i className="fa-solid fa-bullseye text-[10px]"></i>
                    <span>INÉDITO</span>
                  </button>
                  <button
                    onClick={() => setModoVisualizacaoDesempenho('recuperacao')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      modoVisualizacaoDesempenho === 'recuperacao'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-emerald-300'
                    }`}
                    title="Visualização focada no Caderno de Erros (Recuperadas, Reincidentes e Taxa de Recuperação)"
                  >
                    <i className="fa-solid fa-arrows-rotate text-[10px]"></i>
                    <span>RECUPERADO</span>
                  </button>
                  <button
                    onClick={() => setModoVisualizacaoDesempenho('simulados')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      modoVisualizacaoDesempenho === 'simulados'
                        ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black shadow-md'
                        : 'text-gray-400 hover:text-amber-300'
                    }`}
                    title="Visualização exclusiva das provas de Simulado Real: Taxa de Acerto (Meta: 98%) e Ritmo da Prova (Minutos / Questão)"
                  >
                    <i className="fa-solid fa-trophy text-[10px]"></i>
                    <span>SIMULADOS</span>
                  </button>
                </div>

                {/* Bloco de Totais Gerais: Total Resolvido e Tempo Total logo abaixo */}
                <div className="flex flex-col gap-1 items-stretch">
                  <div
                    className="text-xs font-medium text-gray-300 bg-[#0a0f1d] border border-[#1e293b] px-3 py-1 rounded-xl shadow-inner flex items-center justify-between gap-2 whitespace-nowrap"
                    title="Total absoluto de todas as resoluções já realizadas na plataforma (questões inéditas ou repetidas)"
                  >
                    <span className="text-gray-400 text-[11px]">Total Resolvido</span>
                    <span className="text-white font-mono font-bold">({totalResolucoesGerais})</span>
                  </div>
                  <div
                    className="text-xs font-medium text-cyan-300 bg-[#0a1426] border border-cyan-900/60 px-3 py-1 rounded-xl shadow-inner flex items-center justify-between gap-2 whitespace-nowrap"
                    title="Soma de todo o tempo cronometrado/estimado em todas as questões respondidas na plataforma"
                  >
                    <span className="text-cyan-400/80 text-[11px] flex items-center gap-1">
                      <i className="fa-regular fa-clock text-[10px]"></i> Tempo Total
                    </span>
                    <span className="text-cyan-200 font-mono font-bold">
                      ({formatarTempoHorasMinutos(tempoTotalResolucoesGeraisSegundos)})
                    </span>
                  </div>
                </div>

                {/* Botão Minimalista para Atualizar Métricas mantendo os filtros atuais */}
                <button
                  onClick={atualizarMetricasSemResetarFiltros}
                  disabled={recarregandoMetricas}
                  className={`h-9 w-9 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-sm ${
                    recarregandoMetricas
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-cyan-900/30'
                      : 'bg-[#0a0f1d] border-[#1e293b] text-gray-400 hover:text-cyan-300 hover:border-cyan-500/60 hover:bg-[#131b2e]'
                  }`}
                  title="Atualizar métricas (mantém os filtros atuais)"
                  aria-label="Atualizar métricas mantendo filtros"
                >
                  <i className={`fa-solid fa-arrows-rotate text-xs transition-transform ${recarregandoMetricas ? 'fa-spin text-cyan-400' : ''}`}></i>
                </button>
              </div>
            </div>

            {/* Bloco de Períodos: Botões Rápidos à esquerda e Período Personalizado à direita */}
            <div className="bg-[#101626] border border-[#1e293b] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
              {/* Botões de Período: Hoje, Ontem, 7 dias, 30 dias, Desde o início */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => mudarPeriodo('hoje')}
                  className={`qc-tab text-xs ${periodoFiltro === 'hoje' ? 'active' : ''}`}
                >
                  Hoje
                </button>
                <button
                  onClick={() => mudarPeriodo('ontem')}
                  className={`qc-tab text-xs ${periodoFiltro === 'ontem' ? 'active' : ''}`}
                >
                  Ontem
                </button>
                <button
                  onClick={() => mudarPeriodo(7)}
                  className={`qc-tab text-xs ${periodoFiltro === 7 ? 'active' : ''}`}
                >
                  7 dias
                </button>
                <button
                  onClick={() => mudarPeriodo(30)}
                  className={`qc-tab text-xs ${periodoFiltro === 30 ? 'active' : ''}`}
                >
                  30 dias
                </button>
                <button
                  onClick={() => mudarPeriodo(0)}
                  className={`qc-tab text-xs ${periodoFiltro === 0 ? 'active' : ''}`}
                >
                  Desde o início
                </button>
              </div>

              {/* Período Personalizado deslocado para a direita ao lado das caixas De: / Até: */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center">
                  <i className="fa-solid fa-calendar-days text-[#eab308] mr-2"></i> Período Personalizado:
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-xs text-gray-400">De:</label>
                  <input
                    type="date"
                    value={dataInicioCustom}
                    onChange={(e) => aplicarDataPersonalizada(e.target.value, dataFimCustom)}
                    className="input-field text-xs py-1.5 px-3"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-xs text-gray-400">Até:</label>
                  <input
                    type="date"
                    value={dataFimCustom}
                    onChange={(e) => aplicarDataPersonalizada(dataInicioCustom, e.target.value)}
                    className="input-field text-xs py-1.5 px-3"
                  />
                </div>
                <button onClick={limparDataPersonalizada} className="btn-secondary text-xs py-1.5 px-3">
                  Limpar Datas
                </button>
              </div>
            </div>

            {/* Filtros de Desempenho (Disciplina, Assunto, Banca) */}
            <div className="bg-[#101626] border border-[#1e293b] rounded-2xl p-5 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Dropdown com Caixas de Seleção para Blocos e Matérias */}
              <FiltroHierarquicoBlocos
                tituloDropdown="Filtro de Matérias (Desempenho)"
                grupos={gruposBlocosFiltro}
                blocosSelecionados={desempenhoBlocosSelecionados}
                materiasSelecionadas={desempenhoMateriasSelecionadas}
                onToggleBloco={toggleBloco}
                onToggleMateria={toggleMateria}
                onMarcarTodas={marcarTodosItens}
                onDesmarcarTodas={desmarcarTodosItens}
              />
              <select
                value={desempenhoFiltroAssunto}
                onChange={(e) => setDesempenhoFiltroAssunto(e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Assunto (Todos)</option>
                {listaAssuntos.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <select
                value={desempenhoFiltroBanca}
                onChange={(e) => setDesempenhoFiltroBanca(e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Banca (Todas)</option>
                {listaBancas.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Stat Cards - Mantém exatamente o mesmo layout e cores nas duas visões */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {modoVisualizacaoDesempenho === 'recuperacao' ? (
                <>
                  {/* Card 1: Questões erradas resolvidas */}
                  <div
                    className="stat-card"
                    title="Métrica: Questões Erradas Resolvidas | Cálculo: Quantidade de questões do caderno de erros que tiveram alternativa marcada no período selecionado."
                  >
                    <div className="stat-title">
                      <i className="fa-solid fa-book-bookmark mr-1.5 text-blue-400"></i> Questões erradas resolvidas
                    </div>
                    <div className="stat-value text-white">
                      {statsDesempenho.metricasRecuperacao.totalResolvidasNoPeriodo}
                    </div>
                  </div>

                  {/* Card 2: Taxa de Recuperação */}
                  <div
                    className="stat-card"
                    title="Métrica: Taxa de Recuperação (%) | Cálculo: (Questões Recuperadas / Questões do Caderno Resolvidas) × 100. Mede a eficiência em superar erros passados."
                  >
                    <div className="stat-title">
                      <i className="fa-solid fa-arrows-rotate mr-1.5 text-yellow-400"></i> Taxa de recuperação
                    </div>
                    <div className="stat-value text-[#eab308]">
                      {statsDesempenho.metricasRecuperacao.taxaRecuperacao}%
                    </div>
                  </div>

                  {/* Card 3: Questões Recuperadas */}
                  <div
                    className="stat-card"
                    title="Métrica: Questões Recuperadas | Cálculo: Total de questões que já haviam sido erradas e agora foram respondidas com acerto (RECUPERADA ✅)."
                  >
                    <div className="stat-title">
                      <i className="fa-solid fa-check-circle mr-1.5 text-green-400"></i> Questões recuperadas
                    </div>
                    <div className="stat-value text-green-400">
                      {statsDesempenho.metricasRecuperacao.recuperadas}
                    </div>
                  </div>

                  {/* Card 4: Erros Reincidentes (Clicável para ir direto ao Banco) */}
                  <div
                    onClick={() => {
                      setStatusFiltroBanco('caderno-erros');
                      setModoFiltroCaderno('reincidentes');
                      setIndiceBanco(0);
                      setBancoQuestaoAtualId(null);
                      setFeedbackCaderno(null);
                      setMostrarComentarioCaderno(false);
                      setRespostasBancoTemp({});
                      setBancoTimerSegundos(0);
                      setBancoTimerAtivo(true);
                      setActiveTab('resolver');
                    }}
                    className="stat-card cursor-pointer hover:border-red-500/80 hover:bg-[#1a1528] transition-all group relative"
                    title="Métrica: Erros Reincidentes | Cálculo: Total de questões erradas 2 ou mais vezes consecutivas (REINCIDENTE ⚠️). CLIQUE PARA FILTRAR NO BANCO DE QUESTÕES."
                  >
                    <div className="stat-title flex items-center justify-between">
                      <span>
                        <i className="fa-solid fa-triangle-exclamation mr-1.5 text-red-400"></i> Erros reincidentes
                      </span>
                      <span className="text-[10px] text-red-400/80 group-hover:text-red-300 font-normal">
                        Ver no banco <i className="fa-solid fa-arrow-right text-[9px] ml-0.5"></i>
                      </span>
                    </div>
                    <div className="stat-value text-red-400 flex items-center gap-2">
                      <span>{statsDesempenho.metricasRecuperacao.reincidentes}</span>
                      <span className="text-[11px] font-sans font-normal text-red-300/70 border border-red-800/60 bg-red-950/60 px-1.5 py-0.5 rounded">
                        2+ erros
                      </span>
                    </div>
                  </div>

                  {/* Card 5: Tempo Revisando Erros */}
                  <div
                    className="stat-card border border-cyan-800/60 bg-[#0c1a2e]"
                    title="Métrica: Tempo Revisando Erros | Cálculo: Somatório do tempo cronometrado gasto resolvendo e revisando especificamente questões do caderno de erros."
                  >
                    <div className="stat-title text-cyan-300 flex items-center justify-between">
                      <span>
                        <i className="fa-solid fa-stopwatch mr-1.5 text-cyan-400"></i> Tempo revisando erros
                      </span>
                    </div>
                    <div className="stat-value text-cyan-400 font-mono tracking-wide">
                      {formatarTempoHorasMinutos(statsDesempenho.metricasRecuperacao.tempoRevisandoSegundos)}
                    </div>
                  </div>
                </>
              ) : modoVisualizacaoDesempenho === 'simulados' ? (
                <>
                  {/* Card 1: TAXA DE ACERTO MÉDIA NOS SIMULADOS (HERO - O MAIS IMPORTANTE) */}
                  <div
                    className="stat-card border-2 border-amber-500/60 bg-gradient-to-b from-[#18233c] to-[#12192c] shadow-lg shadow-amber-500/10"
                    title="Métrica Principal: Taxa de Acerto Média nas provas de Simulado da Prova Real. Meta de Aprovação: 98%."
                  >
                    <div className="stat-title text-amber-300 font-bold flex items-center justify-between">
                      <span>
                        <i className="fa-solid fa-trophy mr-1.5 text-amber-400"></i> Taxa de acerto (Simulados)
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-black font-mono border ${
                          statsSimulados.metaAprovacaoAtingida
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                            : 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                        }`}
                      >
                        Meta: 98%
                      </span>
                    </div>
                    <div className="stat-value text-amber-400 font-black tracking-tight flex items-baseline gap-2">
                      <span>{statsSimulados.taxaAcertoMedia}%</span>
                      <span className="text-xs font-normal text-gray-400 font-sans">
                        {statsSimulados.metaAprovacaoAtingida ? '🔥 Meta atingida!' : 'Rumo aos 98%'}
                      </span>
                    </div>
                  </div>

                  {/* Card 2: RITMO DA PROVA REAL (MIN / QUESTAO - SEGUNDA MAIS IMPORTANTE) */}
                  <div
                    className={`stat-card border-2 ${
                      statsSimulados.dentroDoRitmoLimite
                        ? 'border-emerald-500/60 bg-gradient-to-b from-[#0e2624] to-[#0c1a2e]'
                        : 'border-rose-500/60 bg-gradient-to-b from-[#2a131b] to-[#12192c]'
                    }`}
                    title="Ritmo Real: Tempo gasto dividido pelo número de questões. Limite oficial: 5 min 15 seg por questão (4h de prova com 30min reservados para gabarito = 210min líquidos)."
                  >
                    <div className="stat-title flex items-center justify-between">
                      <span className={statsSimulados.dentroDoRitmoLimite ? 'text-emerald-300' : 'text-rose-300'}>
                        <i className="fa-solid fa-gauge-high mr-1.5"></i> Ritmo da Prova (m/q)
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-[#0a0f1d] text-gray-300 border border-gray-700">
                        Limite: 5:15 m/q
                      </span>
                    </div>
                    <div
                      className={`stat-value font-mono tracking-tight flex items-baseline gap-2 ${
                        statsSimulados.dentroDoRitmoLimite ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      <span>{statsSimulados.minutosPorQuestaoFormatado}</span>
                      <span className="text-[11px] font-sans font-normal text-gray-400">
                        {statsSimulados.dentroDoRitmoLimite
                          ? `(${Math.floor(statsSimulados.folgaSegundosPorQuestao / 60)}m ${statsSimulados.folgaSegundosPorQuestao % 60}s folga)`
                          : 'Acima do limite'}
                      </span>
                    </div>
                  </div>

                  {/* Card 3: SIMULADOS COMPLETOS CONCLUÍDOS */}
                  <div
                    className="stat-card"
                    title="Total de provas simuladas completas concluídas."
                  >
                    <div className="stat-title">
                      <i className="fa-solid fa-file-signature mr-1.5 text-blue-400"></i> Simulados realizados
                    </div>
                    <div className="stat-value text-white font-mono">
                      {statsSimulados.totalSimuladosConcluidos}
                    </div>
                  </div>

                  {/* Card 4: ACERTOS TOTAIS EM SIMULADOS */}
                  <div
                    className="stat-card"
                    title="Total acumulado de questões acertadas em simulados."
                  >
                    <div className="stat-title">
                      <i className="fa-solid fa-check-double mr-1.5 text-green-400"></i> Acertos em simulados
                    </div>
                    <div className="stat-value text-green-400 font-mono">
                      {statsSimulados.totalAcertos}{' '}
                      <span className="text-xs text-gray-400 font-sans font-normal">
                        / {statsSimulados.totalQuestoesSimulados}
                      </span>
                    </div>
                  </div>

                  {/* Card 5: TEMPO TOTAL EM SIMULADOS */}
                  <div
                    className="stat-card border border-cyan-800/60 bg-[#0c1a2e]"
                    title="Tempo total gasto realizando simulados da prova real."
                  >
                    <div className="stat-title text-cyan-300 flex items-center justify-between">
                      <span>
                        <i className="fa-solid fa-stopwatch mr-1.5 text-cyan-400"></i> Tempo total simulados
                      </span>
                    </div>
                    <div className="stat-value text-cyan-400 font-mono tracking-wide">
                      {formatarTempoHorasMinutos(statsSimulados.tempoTotalSegundos)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Visão Padrão: INÉDITO */}
                  <div
                    className="stat-card"
                    title="Métrica: Questões Inéditas Resolvidas | Cálculo: Quantidade total de questões inéditas cuja primeira resolução ocorreu no período selecionado."
                  >
                    <div className="stat-title">
                      <i className="fa-solid fa-list-check mr-1.5 text-blue-400"></i> Questões inéditas resolvidas
                    </div>
                    <div className="stat-value text-white">{statsDesempenho.totalResolvidas}</div>
                  </div>
                  <div
                    className="stat-card"
                    title="Métrica: Taxa de Acerto (%) | Cálculo: (Acertos / Total de Questões Resolvidas) × 100."
                  >
                    <div className="stat-title">
                      <i className="fa-solid fa-chart-pie mr-1.5 text-yellow-400"></i> Taxa de acerto
                    </div>
                    <div className="stat-value text-[#eab308]">{statsDesempenho.taxaAcerto}%</div>
                  </div>
                  <div
                    className="stat-card"
                    title="Métrica: Acertos | Cálculo: Total de questões respondidas corretamente no período."
                  >
                    <div className="stat-title">
                      <i className="fa-solid fa-check-circle mr-1.5 text-green-400"></i> Acertos
                    </div>
                    <div className="stat-value text-green-400">{statsDesempenho.acertos}</div>
                  </div>
                  <div
                    className="stat-card"
                    title="Métrica: Erros | Cálculo: Total de questões respondidas incorretamente no período."
                  >
                    <div className="stat-title">
                      <i className="fa-solid fa-times-circle mr-1.5 text-red-400"></i> Erros
                    </div>
                    <div className="stat-value text-red-400">{statsDesempenho.erros}</div>
                  </div>
                  <div
                    className="stat-card border border-cyan-800/60 bg-[#0c1a2e]"
                    title="Métrica: Tempo em Questões | Cálculo: Somatório do tempo das sessões e do cronômetro de respostas no Banco de Questões."
                  >
                    <div className="stat-title text-cyan-300 flex items-center justify-between">
                      <span>
                        <i className="fa-solid fa-stopwatch mr-1.5 text-cyan-400"></i> Tempo em Questões
                      </span>
                      {statsDesempenho.ritmoMQFormatado && statsDesempenho.ritmoMQFormatado !== '0:00' && (
                        <span
                          className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 flex items-center gap-1 shadow-sm"
                          title="Ritmo médio de resolução das sessões (min/q)"
                        >
                          <i className="fa-solid fa-gauge-high text-[10px]"></i>
                          {statsDesempenho.ritmoMQFormatado} min/q
                        </span>
                      )}
                    </div>
                    <div className="stat-value text-cyan-400 font-mono tracking-wide">
                      {statsDesempenho.tempoEmQuestoes}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Linhas Duplas e Distribuição / Modo Simulados */}
            {modoVisualizacaoDesempenho === 'simulados' ? (
              <PainelSimuladosDesempenho
                statsSimulados={statsSimulados}
                sessoesCriadas={sessoesCriadas}
                abrirConferenciaSimulado={abrirConferenciaSimulado}
                iniciarSessaoAtiva={iniciarSessaoAtiva}
                formatarTempoHorasMinutos={formatarTempoHorasMinutos}
                onPurgarSimulados={purgarDadosSimuladosTeste}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Gráfico de Combinação de Eixo Duplo (Dual-Axis Combination Chart) */}
              <div className="md:col-span-2 bg-[#101626] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-2">
                <GraficoEvolucaoDesempenho
                  dados={
                    modoVisualizacaoDesempenho === 'recuperacao'
                      ? statsDesempenho.diasMapRecuperacao
                      : statsDesempenho.diasMap
                  }
                  titulo={
                    modoVisualizacaoDesempenho === 'recuperacao'
                      ? 'Evolução da recuperação de erros por dia'
                      : 'Evolução de acertos e erros inéditos por dia'
                  }
                  subtitulo={
                    modoVisualizacaoDesempenho === 'recuperacao'
                      ? 'Colunas de questões recuperadas (verde) e reincidentes (vermelho) com taxa de recuperação (amarela).'
                      : 'Colunas de questões inéditas resolvidas (volume diário) com linha sobreposta de taxa de acerto real (0-100%).'
                  }
                  badge={modoVisualizacaoDesempenho === 'recuperacao' ? 'Recuperado' : 'Inédito'}
                  labelAcertos={modoVisualizacaoDesempenho === 'recuperacao' ? 'Recuperadas' : 'Acertos'}
                  labelErros={modoVisualizacaoDesempenho === 'recuperacao' ? 'Reincidentes' : 'Erros'}
                  labelTaxa={
                    modoVisualizacaoDesempenho === 'recuperacao'
                      ? 'Taxa de Recuperação (%)'
                      : 'Taxa de Acerto (%)'
                  }
                />
              </div>

              {/* Distribuição - Cabe no mesmo bloco sem alterar layout */}
              <div className="bg-[#101626] border border-[#1e293b] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {modoVisualizacaoDesempenho === 'recuperacao' ? 'Distribuição do Caderno' : 'Distribuição'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {modoVisualizacaoDesempenho === 'recuperacao'
                      ? 'Recuperadas, reincidentes e pendentes totais.'
                      : 'Acertos e erros no período.'}
                  </p>
                </div>

                <div className="text-center py-5">
                  <div className="text-4xl font-extrabold text-white">
                    {modoVisualizacaoDesempenho === 'recuperacao'
                      ? statsDesempenho.metricasRecuperacao.pendentesNoCaderno
                      : statsDesempenho.totalResolvidas}
                  </div>
                  <div
                    className="text-xs text-gray-400 uppercase tracking-wider mt-1"
                    title={
                      modoVisualizacaoDesempenho === 'recuperacao'
                        ? 'Questões no caderno de erros que ainda não possuem a tag RECUPERADA ✅ (inéditos + reincidentes)'
                        : 'Total de questões resolvidas'
                    }
                  >
                    {modoVisualizacaoDesempenho === 'recuperacao'
                      ? 'Pendentes no caderno (sem tag ✅)'
                      : 'Questões no período'}
                  </div>
                </div>

                {modoVisualizacaoDesempenho === 'recuperacao' ? (
                  <div className="flex justify-between items-center text-xs text-gray-300 pt-4 border-t border-[#1e293b] gap-1 flex-wrap">
                    <span className="flex items-center text-green-300" title="Questões recuperadas com acerto">
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block mr-1.5 shrink-0"></span>
                      <span className="font-bold">{statsDesempenho.metricasRecuperacao.recuperadas}</span>&nbsp;recup.
                    </span>
                    <span className="flex items-center text-red-300" title="Erros reincidentes">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block mr-1.5 shrink-0"></span>
                      <span className="font-bold">{statsDesempenho.metricasRecuperacao.reincidentes}</span>&nbsp;reincid.
                    </span>
                    <span
                      className="flex items-center text-amber-300"
                      title="Total de questões no caderno ainda sem tag recuperada"
                    >
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block mr-1.5 shrink-0"></span>
                      <span className="font-bold">{statsDesempenho.metricasRecuperacao.pendentesNoCaderno}</span>&nbsp;pendentes
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-around text-xs text-gray-300 pt-4 border-t border-[#1e293b]">
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-1.5"></span>
                      <span>{statsDesempenho.acertos}</span> certas
                    </span>
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-1.5"></span>
                      <span>{statsDesempenho.erros}</span> erradas
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bloco / Desempenho por Disciplina com Gráfico de Barras Comparativo e Tabela */}
            <div className="bg-[#101626] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Desempenho por disciplina</h3>
                <p className="text-xs text-gray-400">
                  Dados consolidados de todo o seu histórico. Comparativos específicos do curso ficam indisponíveis nesta visão.
                </p>
              </div>

              {/* Gráfico de Barras Comparativo por Bloco (% de Acerto) */}
              <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center text-xs text-gray-400 uppercase tracking-wider font-semibold border-b border-[#1e293b] pb-2">
                  <span>Bloco / Disciplina</span>
                  <span>% de Acerto (%)</span>
                </div>
                <div className="space-y-4 pt-1">
                  {statsDesempenho.arrayDisciplinas.length === 0 ? (
                    <div className="text-xs text-gray-500 italic text-center py-4">
                      Nenhum dado para exibir no gráfico.
                    </div>
                  ) : (
                    statsDesempenho.arrayDisciplinas.map((item, idx) => {
                      const corBg = coresBarra[idx % coresBarra.length];
                      const pct = item.desempenho;

                      return (
                        <div
                          key={item.disciplina}
                          className="space-y-1.5 bg-[#131b2e] border border-[#1e293b] p-3.5 rounded-xl"
                        >
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-white flex items-center">
                              <span className={`w-3 h-3 rounded-full ${corBg} inline-block mr-2 shrink-0`}></span>
                              {item.disciplina}
                            </span>
                            <div className="text-xs space-x-2">
                              <span className="text-gray-400">{item.total} questão(ões)</span>
                              <span className="font-extrabold text-white bg-[#0a0f1d] border border-[#1e293b] px-2.5 py-1 rounded">
                                {pct}% de acerto
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-[#0a0f1d] border border-[#1e293b] h-3 rounded-full overflow-hidden">
                            <div
                              className={`${corBg} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Tabela Comparativa de Blocos */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-[#0a0f1d] text-xs uppercase text-gray-400 border-b border-[#1e293b]">
                    <tr>
                      <th className="p-3">Disciplina</th>
                      <th className="p-3 text-center">Resolvidas</th>
                      <th className="p-3 text-center">Acertos</th>
                      <th className="p-3 text-center">Erros</th>
                      <th
                        onClick={toggleOrdemDisciplina}
                        className="p-3 text-right cursor-pointer select-none hover:text-white transition-colors group"
                        title={
                          ordemDesempenhoDisciplina === 'asc'
                            ? 'Ordenado: Pior para o melhor (clique para melhor para o pior)'
                            : ordemDesempenhoDisciplina === 'desc'
                            ? 'Ordenado: Melhor para o pior (clique para pior para o melhor)'
                            : 'Clique para ordenar: Pior para o melhor ou vice-versa'
                        }
                      >
                        <div className="inline-flex items-center justify-end gap-1.5 ml-auto">
                          <span>Desempenho</span>
                          <span className="inline-flex flex-col items-center justify-center -space-y-0.5 text-[9px] leading-none shrink-0">
                            <i
                              onClick={(e) => {
                                e.stopPropagation();
                                setOrdemDesempenhoDisciplina('asc');
                              }}
                              className={`fa-solid fa-caret-up transition-colors cursor-pointer hover:text-amber-300 ${
                                ordemDesempenhoDisciplina === 'asc'
                                  ? 'text-amber-400 font-bold scale-125'
                                  : 'text-gray-500 group-hover:text-gray-300'
                              }`}
                              title="Ordenar: Menor desempenho primeiro (pior para o melhor)"
                            ></i>
                            <i
                              onClick={(e) => {
                                e.stopPropagation();
                                setOrdemDesempenhoDisciplina('desc');
                              }}
                              className={`fa-solid fa-caret-down transition-colors cursor-pointer hover:text-amber-300 ${
                                ordemDesempenhoDisciplina === 'desc'
                                  ? 'text-amber-400 font-bold scale-125'
                                  : 'text-gray-500 group-hover:text-gray-300'
                              }`}
                              title="Ordenar: Maior desempenho primeiro (melhor para o pior)"
                            ></i>
                          </span>
                          {ordemDesempenhoDisciplina && (
                            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/60 ml-0.5">
                              {ordemDesempenhoDisciplina === 'asc' ? 'Pior ↑' : 'Melhor ↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplinasOrdenadas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-gray-500 italic">
                          Nenhum dado registrado para os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      disciplinasOrdenadas.map((s) => {
                        const corBarra =
                          s.desempenho >= 70
                            ? 'text-green-400'
                            : s.desempenho >= 40
                            ? 'text-yellow-400'
                            : 'text-red-400';
                        const iconeTendencia =
                          s.desempenho >= 70 ? (
                            <i className="fa-solid fa-arrow-trend-up text-green-400 ml-1"></i>
                          ) : (
                            <i className="fa-solid fa-arrow-trend-down text-red-400 ml-1"></i>
                          );

                        return (
                          <tr key={s.disciplina} className="border-b border-[#1e293b] hover:bg-[#0a0f1d]/50">
                            <td className="p-3 font-medium text-white">{s.disciplina}</td>
                            <td className="p-3 text-center">{s.total}</td>
                            <td className="p-3 text-center text-green-400 font-semibold">{s.acertos}</td>
                            <td className="p-3 text-center text-red-400 font-semibold">{s.erros}</td>
                            <td className={`p-3 text-right font-bold ${corBarra}`}>
                              {s.desempenho}% {iconeTendencia}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Desempenho por Assunto / Lei */}
            <div className="bg-[#101626] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center">
                  <i className="fa-solid fa-scale-balanced mr-2 text-[#eab308]"></i> Desempenho por Assunto / Lei
                </h3>
                <p className="text-xs text-gray-400">
                  Métricas detalhadas consolidadas por norma, lei ou tema específico da legislação estudada.
                </p>
              </div>

              {/* Gráfico de Barras Comparativo por Assunto / Lei (% de Acerto) */}
              <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center text-xs text-gray-400 uppercase tracking-wider font-semibold border-b border-[#1e293b] pb-2">
                  <span>Assunto / Lei</span>
                  <span>% de Acerto (%)</span>
                </div>
                <div className="space-y-4 pt-1">
                  {statsDesempenho.arrayAssuntos.length === 0 ? (
                    <div className="text-xs text-gray-500 italic text-center py-4">
                      Nenhum dado de assunto para exibir no gráfico.
                    </div>
                  ) : (
                    statsDesempenho.arrayAssuntos.map((item, idx) => {
                      const corBg = coresBarra[(idx + 2) % coresBarra.length];
                      const pct = item.desempenho;

                      return (
                        <div
                          key={item.assunto}
                          className="space-y-1.5 bg-[#131b2e] border border-[#1e293b] p-3.5 rounded-xl"
                        >
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-white flex items-center truncate max-w-[70%]">
                              <span className={`w-3 h-3 rounded-full ${corBg} inline-block mr-2 shrink-0`}></span>
                              <span className="truncate">{item.assunto}</span>
                            </span>
                            <div className="text-xs space-x-2 shrink-0">
                              <span className="text-gray-400">{item.total} questão(ões)</span>
                              <span className="font-extrabold text-white bg-[#0a0f1d] border border-[#1e293b] px-2.5 py-1 rounded">
                                {pct}% de acerto
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-[#0a0f1d] border border-[#1e293b] h-3 rounded-full overflow-hidden">
                            <div
                              className={`${corBg} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Tabela Comparativa de Assuntos / Leis */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-[#0a0f1d] text-xs uppercase text-gray-400 border-b border-[#1e293b]">
                    <tr>
                      <th className="p-3">Assunto / Lei</th>
                      <th className="p-3">Bloco / Disciplina</th>
                      <th className="p-3 text-center">Resolvidas</th>
                      <th className="p-3 text-center">Acertos</th>
                      <th className="p-3 text-center">Erros</th>
                      <th
                        onClick={toggleOrdemAssunto}
                        className="p-3 text-right cursor-pointer select-none hover:text-white transition-colors group"
                        title={
                          ordemDesempenhoAssunto === 'asc'
                            ? 'Ordenado: Pior para o melhor (clique para melhor para o pior)'
                            : ordemDesempenhoAssunto === 'desc'
                            ? 'Ordenado: Melhor para o pior (clique para pior para o melhor)'
                            : 'Clique para ordenar: Pior para o melhor ou vice-versa'
                        }
                      >
                        <div className="inline-flex items-center justify-end gap-1.5 ml-auto">
                          <span>Desempenho</span>
                          <span className="inline-flex flex-col items-center justify-center -space-y-0.5 text-[9px] leading-none shrink-0">
                            <i
                              onClick={(e) => {
                                e.stopPropagation();
                                setOrdemDesempenhoAssunto('asc');
                              }}
                              className={`fa-solid fa-caret-up transition-colors cursor-pointer hover:text-amber-300 ${
                                ordemDesempenhoAssunto === 'asc'
                                  ? 'text-amber-400 font-bold scale-125'
                                  : 'text-gray-500 group-hover:text-gray-300'
                              }`}
                              title="Ordenar: Menor desempenho primeiro (pior para o melhor)"
                            ></i>
                            <i
                              onClick={(e) => {
                                e.stopPropagation();
                                setOrdemDesempenhoAssunto('desc');
                              }}
                              className={`fa-solid fa-caret-down transition-colors cursor-pointer hover:text-amber-300 ${
                                ordemDesempenhoAssunto === 'desc'
                                  ? 'text-amber-400 font-bold scale-125'
                                  : 'text-gray-500 group-hover:text-gray-300'
                              }`}
                              title="Ordenar: Maior desempenho primeiro (melhor para o pior)"
                            ></i>
                          </span>
                          {ordemDesempenhoAssunto && (
                            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/60 ml-0.5">
                              {ordemDesempenhoAssunto === 'asc' ? 'Pior ↑' : 'Melhor ↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assuntosOrdenados.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-gray-500 italic">
                          Nenhum dado registrado para os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      assuntosOrdenados.map((s) => {
                        const corBarra =
                          s.desempenho >= 70
                            ? 'text-green-400'
                            : s.desempenho >= 40
                            ? 'text-yellow-400'
                            : 'text-red-400';
                        const iconeTendencia =
                          s.desempenho >= 70 ? (
                            <i className="fa-solid fa-arrow-trend-up text-green-400 ml-1"></i>
                          ) : (
                            <i className="fa-solid fa-arrow-trend-down text-red-400 ml-1"></i>
                          );

                        return (
                          <tr key={s.assunto} className="border-b border-[#1e293b] hover:bg-[#0a0f1d]/50">
                            <td className="p-3 font-medium text-white max-w-xs truncate">{s.assunto}</td>
                            <td className="p-3 text-xs text-blue-400">{s.disciplina || '-'}</td>
                            <td className="p-3 text-center">{s.total}</td>
                            <td className="p-3 text-center text-green-400 font-semibold">{s.acertos}</td>
                            <td className="p-3 text-center text-red-400 font-semibold">{s.erros}</td>
                            <td className={`p-3 text-right font-bold ${corBarra}`}>
                              {s.desempenho}% {iconeTendencia}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAIS DE EDIÇÃO GLOBAIS (ACESSIBILIDADE EM TODAS AS TELAS) */}
      {/* ========================================================================= */}

      {/* 1. Modal de Edição de Sessão */}
      {sessaoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#1e293b] pb-3">
              <h3 className="text-base font-bold text-white flex items-center">
                <i className="fa-solid fa-pen-to-square text-[#eab308] mr-2"></i> Editar Bloco / Sessão
              </h3>
              <button
                onClick={() => setSessaoEditando(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1e293b] transition"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Código da Sessão
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editCodigo}
                    onChange={(e) => setEditCodigo(e.target.value.toUpperCase().trim())}
                    placeholder="Ex: BL02L14133"
                    className="input-field text-xs font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setEditCodigo(gerarCodigoSessaoPadrao(editDisciplina, editAssunto))}
                    className="btn-secondary text-xs shrink-0 py-1.5 px-3"
                    title="Gerar código pelo padrão (BL + 2 dígitos do Bloco + L/D + número da Lei)"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles mr-1 text-[#eab308]"></i> Gerar Padrão
                  </button>
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Padrão: BL + 2 caracteres do Bloco + L (Lei) ou D (Decreto) + Número (Ex: <b className="text-[#eab308]">BL02L14133</b>)
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Disciplina (Bloco)
                </label>
                <input
                  type="text"
                  value={editDisciplina}
                  onChange={(e) => setEditDisciplina(e.target.value)}
                  placeholder="Ex: 02_Licitações Contratos Custos"
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Assunto (Lei / Decreto)
                </label>
                <input
                  type="text"
                  value={editAssunto}
                  onChange={(e) => setEditAssunto(e.target.value)}
                  placeholder="Ex: 2.1_Lei_14133_2021_Nova_Lei_Licitacoes_Contratos"
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Qual o cargo/função concorrida
                </label>
                <input
                  type="text"
                  value={editCargo}
                  onChange={(e) => setEditCargo(e.target.value)}
                  placeholder="Ex: Auditor Fiscal, Analista Judiciário..."
                  className="input-field text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Banca
                  </label>
                  <input
                    type="text"
                    value={editBanca}
                    onChange={(e) => setEditBanca(e.target.value)}
                    placeholder="Ex: FAFIPA"
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Quantidade de Questões
                  </label>
                  <input
                    type="number"
                    value={editQuantidade}
                    onChange={(e) => setEditQuantidade(Number(e.target.value))}
                    className="input-field text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#1e293b]">
              <button
                onClick={() => setSessaoEditando(null)}
                className="btn-secondary text-xs py-2 px-3.5"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicaoSessao}
                className="btn-primary text-xs py-2 px-3.5"
              >
                <i className="fa-solid fa-floppy-disk mr-1.5"></i> Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal de Edição de Banca */}
      {bancaEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#1e293b] pb-3">
              <h3 className="text-base font-bold text-white flex items-center">
                <i className="fa-solid fa-pen-to-square text-[#eab308] mr-2"></i> Editar Perfil da Banca
              </h3>
              <button
                onClick={() => setBancaEditando(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1e293b] transition"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Nome da Banca <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editBancaNome}
                  onChange={(e) => setEditBancaNome(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Qual o cargo/função concorrida <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editBancaCargo}
                  onChange={(e) => setEditBancaCargo(e.target.value)}
                  placeholder="Ex: Auditor Fiscal, Analista..."
                  className="input-field text-xs border-amber-500/40 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Observações de Estilo
                </label>
                <textarea
                  rows={2}
                  value={editBancaObs}
                  onChange={(e) => setEditBancaObs(e.target.value)}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#1e293b]">
              <button
                onClick={() => setBancaEditando(null)}
                className="btn-secondary text-xs py-2 px-3.5"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicaoBanca}
                className="btn-primary text-xs py-2 px-3.5"
              >
                <i className="fa-solid fa-floppy-disk mr-1.5"></i> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal de Edição de Bloco e Inclusão de Matérias */}
      {blocoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#101726] border border-[#1e293b] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-[#1e293b] pb-3.5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center">
                  {modalBlocoModo === 'incluir-materia' ? (
                    <>
                      <i className="fa-solid fa-file-circle-plus text-emerald-400 mr-2 text-lg"></i>
                      <span>
                        Incluir Matéria no Bloco:{' '}
                        <span className="text-emerald-300 ml-1">{blocoEditando.nome}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-folder-open text-[#eab308] mr-2 text-lg"></i>
                      <span>Editar Bloco e Gerenciar Matérias</span>
                    </>
                  )}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {modalBlocoModo === 'incluir-materia'
                    ? 'Preencha o nome da matéria/lei e selecione o arquivo PDF ou TXT correspondente para salvar no bloco.'
                    : 'Atualize o nome do bloco ou adicione novas matérias e leis diretamente a este bloco.'}
                </p>
              </div>
              <button
                onClick={() => setBlocoEditando(null)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1e293b] transition"
                title="Fechar"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* SEÇÃO 1: FORMULÁRIO DE INCLUSÃO DA MATÉRIA (Destaque quando no modo incluir-materia) */}
            <div
              className={`space-y-3 p-4 rounded-xl border ${
                modalBlocoModo === 'incluir-materia'
                  ? 'bg-emerald-950/20 border-emerald-700/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                  : 'bg-blue-950/20 border-blue-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center">
                  <i className="fa-solid fa-file-circle-plus text-emerald-400 mr-2 text-sm"></i>
                  <span>Dados da Nova Matéria / Lei</span>
                </h4>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded font-medium">
                  PDF ou TXT
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Nome da Matéria / Lei <span className="text-red-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={novoMateriaNomeNoBloco}
                    onChange={(e) => setNovoMateriaNomeNoBloco(e.target.value)}
                    placeholder="Ex: Lei 14.133/21 - Licitações e Contratos ou NR-35 Trabalho em Altura"
                    className="input-field text-xs"
                    autoFocus={modalBlocoModo === 'incluir-materia'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Arquivo da Lei (PDF ou TXT) <span className="text-red-400 font-bold">*</span>
                  </label>
                  <input
                    type="file"
                    ref={fileInputMateriaNoBlocoRef}
                    accept=".pdf,.txt,application/pdf,text/plain"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNovoMateriaArquivoNoBloco(e.target.files[0]);
                      }
                    }}
                    className="block w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-900/60 file:text-emerald-200 hover:file:bg-emerald-800 transition cursor-pointer"
                  />
                  {novoMateriaArquivoNoBloco && (
                    <div className="mt-1 text-xs text-emerald-400 flex items-center space-x-1.5">
                      <i className="fa-solid fa-circle-check"></i>
                      <span>
                        Arquivo pronto:{' '}
                        <b>{novoMateriaArquivoNoBloco.name}</b> (
                        {(novoMateriaArquivoNoBloco.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                  )}
                </div>

                {modalBlocoModo !== 'incluir-materia' && (
                  <button
                    type="button"
                    onClick={adicionarMateriaAoBlocoEditando}
                    disabled={carregandoMateriaNoBloco}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-900/30 disabled:opacity-50 w-full sm:w-auto"
                  >
                    {carregandoMateriaNoBloco ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin text-sm"></i>
                        <span>Processando matéria...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-plus text-sm"></i>
                        <span>Adicionar Matéria ao Bloco</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* SEÇÃO 2: DADOS BÁSICOS DO BLOCO */}
            <div className="space-y-3 bg-[#0a0f1d] border border-[#1e293b] p-4 rounded-xl">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center">
                <i className="fa-solid fa-pen text-blue-400 mr-1.5"></i> Dados do Bloco
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Nome do Bloco <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editBlocoNome}
                    onChange={(e) => setEditBlocoNome(e.target.value)}
                    placeholder="Ex: 02_Licitações Contratos Custos"
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Descrição / Ementa
                  </label>
                  <textarea
                    rows={2}
                    value={editBlocoDescricao}
                    onChange={(e) => setEditBlocoDescricao(e.target.value)}
                    placeholder="Descrição opcional dos temas cobertos por este bloco..."
                    className="input-field text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: MATÉRIAS JÁ VINCULADAS */}
            <div className="space-y-2.5 bg-[#0a0f1d] border border-[#1e293b] p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center">
                  <i className="fa-solid fa-book-bookmark text-[#eab308] mr-1.5"></i>
                  <span>Matérias e Leis Cadastradas neste Bloco</span>
                  <span className="ml-2 text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.2 rounded-full font-mono">
                    {materias.filter((m) => String(m.blocoId) === String(blocoEditando.id)).length} vinculada(s)
                  </span>
                </h4>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {materias.filter((m) => String(m.blocoId) === String(blocoEditando.id)).length === 0 ? (
                  <div className="text-gray-500 text-xs italic py-3 text-center bg-[#131b2e]/60 rounded-lg border border-[#1e293b]/60">
                    Nenhuma matéria vinculada a este bloco ainda.
                  </div>
                ) : (
                  materias
                    .filter((m) => String(m.blocoId) === String(blocoEditando.id))
                    .map((m) => (
                      <div
                        key={m.id}
                        className="bg-[#131b2e] border border-[#1e293b] p-2.5 rounded-lg flex items-center justify-between gap-2 hover:border-gray-700 transition"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center space-x-1.5">
                            <i className="fa-solid fa-file-pdf text-red-400 text-xs"></i>
                            <span className="font-semibold text-xs text-white truncate max-w-xs md:max-w-md block">
                              {m.nome}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400 truncate flex items-center space-x-2">
                            <span>{m.arquivoNome}</span>
                            {m.tamanhoBytes && (
                              <span className="text-[10px] text-gray-500">
                                ({(m.tamanhoBytes / 1024).toFixed(0)} KB)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => baixarDocumentoMateria(m)}
                            className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-[#101726] rounded transition shrink-0 cursor-pointer"
                            title={`Baixar documento original (${m.arquivoNome || m.nome})`}
                            aria-label="Baixar documento"
                          >
                            <i className="fa-solid fa-download text-xs"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => removerMateriaDoBloco(m.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#101726] rounded transition shrink-0"
                            title="Excluir matéria deste bloco"
                          >
                            <i className="fa-solid fa-trash text-xs"></i>
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-[#1e293b]">
              <button
                type="button"
                onClick={() => setBlocoEditando(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarEdicaoBloco}
                disabled={carregandoMateriaNoBloco}
                className={`text-xs py-2.5 px-4 rounded-xl font-semibold flex items-center space-x-1.5 transition shadow-lg disabled:opacity-50 ${
                  modalBlocoModo === 'incluir-materia' || Boolean(novoMateriaNomeNoBloco || novoMateriaArquivoNoBloco)
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                    : 'btn-primary'
                }`}
              >
                {carregandoMateriaNoBloco ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin text-sm"></i>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk mr-1"></i>
                    <span>
                      {modalBlocoModo === 'incluir-materia'
                        ? 'Salvar Matéria no Bloco'
                        : novoMateriaNomeNoBloco || novoMateriaArquivoNoBloco
                        ? 'Salvar Alterações e Incluir Matéria'
                        : 'Salvar Alterações do Bloco'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal de Edição de Matéria */}
      {materiaEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#1e293b] pb-3">
              <h3 className="text-base font-bold text-white flex items-center">
                <i className="fa-solid fa-pen-to-square text-[#eab308] mr-2"></i> Editar Matéria / Lei
              </h3>
              <button
                onClick={() => setMateriaEditando(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1e293b] transition"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Vincular ao Bloco
                </label>
                <select
                  value={editMateriaBlocoId}
                  onChange={(e) => setEditMateriaBlocoId(e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="">-- Sem Bloco / Geral --</option>
                  {blocos.map((bl) => (
                    <option key={bl.id} value={bl.id}>
                      {bl.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Nome da Matéria / Lei <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editMateriaNome}
                  onChange={(e) => setEditMateriaNome(e.target.value)}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#1e293b]">
              <button
                onClick={() => setMateriaEditando(null)}
                className="btn-secondary text-xs py-2 px-3.5"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicaoMateria}
                className="btn-primary text-xs py-2 px-3.5"
              >
                <i className="fa-solid fa-floppy-disk mr-1.5"></i> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud & Supabase Settings Modal (Admin Gated) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={() => {
          carregarDadosDoBanco();
        }}
      />

      {/* Authentication Modal (Login & Account Creation) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={async (user) => {
          setCurrentUser(user);
          setActiveTab('desempenho');
          setModoVisualizacaoDesempenho('recuperacao');
          const qLocaisRaw = localStorage.getItem(STORAGE_KEYS.QUESTOES);
          if (!qLocaisRaw || qLocaisRaw === '[]') {
            try {
              await hidratarCacheLocalDoSupabase();
            } catch (err) {
              console.warn('Aviso ao hidratar no onSuccess do AuthModal:', err);
            }
          }
          await carregarDadosDoBanco();
        }}
      />

      {/* Modal de Conferência e Sorteio do Simulado Oficial (FAFIPA Curitiba) */}
      <ModalConferenciaSimulado
        aberto={modalSimuladoAberto}
        onClose={() => {
          if (!gerandoSimulado) setModalSimuladoAberto(false);
        }}
        distribuicao={distribuicaoSimulado}
        onSortearNovamente={sortearNovamenteSimulado}
        modoFonte={modoFonteSimulado}
        onChangeModoFonte={(modo) => setModoFonteSimulado(modo)}
        onIniciarSimulado={iniciarSimuladoReal}
        iniciando={gerandoSimulado}
        progressoGeracao={progressoSimulado}
        mapaDisponibilidadeBanco={mapaDisponibilidadeBanco}
        materias={materias}
      />

      {/* Loading Overlay com Progresso 0 a 100% e Frases Temáticas Rotativas Requeridas */}
      <LoadingSimulado
        aberto={gerandoSimulado || Boolean(gerandoStatus.loading)}
        titulo={gerandoSimulado ? 'Gerando Simulado da Prova Real' : 'Gerando Sessão de Questões'}
        subtitulo={
          gerandoSimulado
            ? 'FAFIPA Paramétrico · Prova Oficial Curitiba (40Q)'
            : `${gerarBanca || 'FAFIPA Paramétrico'} · ${gerarAssunto || 'Questões'}`
        }
        mensagemSubetapa={gerandoSimulado ? progressoSimulado : gerandoStatus.mensagem}
        progressoPct={progressoSimuladoPct}
      />

      {/* Modal de Geração em Escala (Lote de 500 Questões FAFIPA) */}
      <ModalGeradorLoteEscala
        isOpen={isModalLoteEscalaOpen}
        sessaoInicialPadrao={sessaoInicialLote}
        onClose={() => setIsModalLoteEscalaOpen(false)}
        onConcluido={async () => {
          setIsModalLoteEscalaOpen(false);
          await atualizarMetricasSemResetarFiltros();
          setActiveTab('sessoes');
          setFiltroTipoSessao('sessao_escala');
          setFiltroStatusSessao('todos');
        }}
      />

      {/* Modal de Upload Inteligente de Provas em PDF */}
      <ModalUploadProvaPdf
        isOpen={isUploadProvaModalOpen}
        onClose={() => setIsUploadProvaModalOpen(false)}
        onProvaSalva={handleProvaSalva}
      />

      {/* Modal / Janela Flutuante para Selecionar Manualmente Categoria no EAP FAFIPA */}
      <ModalReclassificarQuestaoEap
        isOpen={Boolean(questaoParaReclassificar)}
        questao={questaoParaReclassificar}
        onClose={() => setQuestaoParaReclassificar(null)}
        onSalvar={handleSalvarReclassificacaoEap}
      />
    </div>
  );
}
