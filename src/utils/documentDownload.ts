import { Materia } from '../types';
import { idbCarregarMaterias } from '../services/materiaStorage';

/**
 * Converte uma string base64 (pura ou data URI) em um Blob com o MIME type correto.
 */
export function base64ParaBlob(base64: string, mimeType: string = 'application/pdf'): Blob {
  const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64.trim();
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Realiza o download do documento exatamente como foi imputado como premissa.
 * Busca o arquivo em memória ou no IndexedDB local.
 */
export async function baixarDocumentoMateria(materia: Materia): Promise<boolean> {
  let base64 = materia.arquivoBase64;
  let tipo = materia.arquivoTipo || 'application/pdf';
  let nomeArquivo = materia.arquivoNome || `${materia.nome}.pdf`;

  // Se não estiver em memória, tenta recuperar do IndexedDB
  if (!base64 && typeof window !== 'undefined') {
    try {
      const idbList = await idbCarregarMaterias();
      const local = idbList.find(
        (im) =>
          String(im.id) === String(materia.id) ||
          im.nome === materia.nome ||
          (im.arquivoNome && im.arquivoNome === materia.arquivoNome)
      );
      if (local?.arquivoBase64) {
        base64 = local.arquivoBase64;
        if (local.arquivoTipo) tipo = local.arquivoTipo;
        if (local.arquivoNome) nomeArquivo = local.arquivoNome;
      }
    } catch (e) {
      console.warn('Erro ao buscar base64 da matéria no IndexedDB:', e);
    }
  }

  // 1. Download via Base64 original (arquivo binário exato imputado)
  if (base64) {
    try {
      const blob = base64ParaBlob(base64, tipo);
      dispararDownloadNavegador(blob, nomeArquivo);
      return true;
    } catch (e) {
      console.error('Erro ao converter base64 para download:', e);
    }
  }

  // 2. Fallback para arquivo de texto se for TXT ou se apenas o texto foi persistido
  if (materia.arquivoTexto) {
    try {
      const nomeFinal = nomeArquivo.toLowerCase().endsWith('.txt')
        ? nomeArquivo
        : `${nomeArquivo.replace(/\.[^/.]+$/, '')}.txt`;
      const blob = new Blob([materia.arquivoTexto], { type: 'text/plain;charset=utf-8' });
      dispararDownloadNavegador(blob, nomeFinal);
      return true;
    } catch (e) {
      console.error('Erro ao criar arquivo de texto para download:', e);
    }
  }

  if (typeof window !== 'undefined') {
    alert(
      `O arquivo binário de "${nomeArquivo}" não foi encontrado neste navegador. Se você cadastrou em outro dispositivo, envie o PDF novamente neste aparelho.`
    );
  }
  return false;
}

/**
 * Dispara o download de um Blob no navegador via elemento <a> temporário.
 */
function dispararDownloadNavegador(blob: Blob, nomeArquivo: string) {
  if (typeof window === 'undefined' || !window.URL) return;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => window.URL.revokeObjectURL(url), 3000);
}
