/**
 * Utilitário de otimização e compressão automática de imagens
 * Converte imagens pesadas (PNG, JPG, HEIC, etc.) para formato WebP leve
 * preservando nitidez visual para prontuários e fotos de evolução.
 */

export interface OptimizeImageOptions {
  maxDimension?: number; // Largura ou altura máxima em pixels (padrão: 1280px)
  maxSizeBytes?: number;  // Limite em bytes para acionar compressão (padrão: 500 KB)
  quality?: number;       // Qualidade da compressão de 0 a 1 (padrão: 0.82)
}

export interface OptimizedImageResult {
  dataUrl: string;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  originalFormat: string;
  optimizedFormat: string;
  originalFormattedSize: string;
  optimizedFormattedSize: string;
  savedPercent: number;
  wasCompressed: boolean;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function optimizeImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxDimension = 1280,
    maxSizeBytes = 500 * 1024, // 500 KB limite sensato
    quality = 0.82,
  } = options;

  if (!file.type.startsWith('image/')) {
    throw new Error('O arquivo selecionado não é uma imagem válida.');
  }

  // Limite máximo de segurança para evitar travar o navegador
  const ABSOLUTE_MAX_INPUT_BYTES = 25 * 1024 * 1024; // 25 MB
  if (file.size > ABSOLUTE_MAX_INPUT_BYTES) {
    throw new Error(`Imagem muito pesada (${formatBytes(file.size)}). O limite máximo de upload é de 25 MB.`);
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      const needsResize = width > maxDimension || height > maxDimension;
      const needsSizeCompression = file.size > maxSizeBytes;

      // Calcular novas dimensões mantendo proporção
      if (needsResize) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Falha ao inicializar o renderizador de imagem.'));
        return;
      }

      // Suavização de alta qualidade
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Tenta exportar em WebP (melhor algoritmo de compressão para web moderna)
      let outputFormat = 'image/webp';
      let dataUrl = canvas.toDataURL(outputFormat, quality);

      // Se o navegador não suportar WebP (retorna png padrão), usa JPEG
      if (!dataUrl.startsWith('data:image/webp')) {
        outputFormat = 'image/jpeg';
        dataUrl = canvas.toDataURL(outputFormat, quality);
      }

      // Estimar tamanho em bytes a partir do Base64
      // Base64 tem ~4/3 do tamanho dos bytes reais
      const head = dataUrl.indexOf(',') + 1;
      const base64Length = dataUrl.length - head;
      const optimizedSizeBytes = Math.round((base64Length * 3) / 4);

      // Se por algum motivo o original era menor que 100KB e não precisava redimensionar
      if (!needsResize && !needsSizeCompression && optimizedSizeBytes >= file.size) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const rawUrl = (e.target?.result as string) || dataUrl;
          resolve({
            dataUrl: rawUrl,
            originalSizeBytes: file.size,
            optimizedSizeBytes: file.size,
            originalFormat: file.type.replace('image/', '').toUpperCase(),
            optimizedFormat: file.type.replace('image/', '').toUpperCase(),
            originalFormattedSize: formatBytes(file.size),
            optimizedFormattedSize: formatBytes(file.size),
            savedPercent: 0,
            wasCompressed: false,
          });
        };
        reader.onerror = () => reject(new Error('Erro ao ler a imagem.'));
        reader.readAsDataURL(file);
        return;
      }

      const savedBytes = Math.max(0, file.size - optimizedSizeBytes);
      const savedPercent = Math.round((savedBytes / file.size) * 100);

      resolve({
        dataUrl,
        originalSizeBytes: file.size,
        optimizedSizeBytes,
        originalFormat: file.type.replace('image/', '').toUpperCase() || 'DESCONHECIDO',
        optimizedFormat: outputFormat.replace('image/', '').toUpperCase(),
        originalFormattedSize: formatBytes(file.size),
        optimizedFormattedSize: formatBytes(optimizedSizeBytes),
        savedPercent,
        wasCompressed: true,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Não foi possível carregar a imagem selecionada.'));
    };

    img.src = objectUrl;
  });
}
