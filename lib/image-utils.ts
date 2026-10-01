/**
 * Utilidad para comprimir y redimensionar comprobantes antes de subirlos.
 * Reduce fotos de cámara/móvil de 5-15MB a ~100-180KB en alta legibilidad,
 * evitando los límites de payload de Server Actions y Vercel (4.5MB).
 */
export async function compressImageClient(
  file: File,
  maxWidth: number = 1280,
  maxHeight: number = 1280,
  quality: number = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Si no es imagen, retornar error
    if (!file.type.startsWith("image/")) {
      return reject(new Error("El archivo no es una imagen válida"));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcular escala proporcional
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(event.target?.result as string);
        }

        // Suavizado de bordes para que los números de la boleta se lean nítidos
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a JPEG optimizado
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };

      img.onerror = (err) => {
        console.warn("Error al cargar imagen en canvas, usando original", err);
        resolve(event.target?.result as string);
      };
    };

    reader.onerror = (err) => reject(err);
  });
}
