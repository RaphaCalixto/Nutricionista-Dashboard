/**
 * Utilitários para processamento e otimização de imagens no cliente
 */

/**
 * Converte um arquivo de imagem (PNG, JPG, etc.) para WebP de alta performance
 * Reduz a resolução e tamanho mantendo fundo transparente ou nítido para assinaturas e logos
 */
export function convertImageToWebP(
  file: File,
  maxWidth = 600,
  maxHeight = 250,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensionamento proporcional mantendo aspecto
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Limpa com transparência
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        try {
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          // Caso o navegador antigo retorne PNG por fallback, ainda é aceito
          resolve(webpDataUrl);
        } catch (err) {
          resolve(canvas.toDataURL('image/png'));
        }
      };
      img.onerror = (err) => reject(new Error('Erro ao carregar a imagem para processamento: ' + err));
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(new Error('Erro ao ler arquivo: ' + err));
    reader.readAsDataURL(file);
  });
}
