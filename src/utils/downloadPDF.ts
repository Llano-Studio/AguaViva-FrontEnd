import { saveAs } from "file-saver";

interface DownloadPDFOptions {
  url: string;
  filename: string;
  baseURL?: string;
  showLogs?: boolean;
}

export const downloadPDF = async (options: DownloadPDFOptions): Promise<void> => {
  const { url, filename, baseURL = "http://localhost:3000", showLogs = false } = options;

  try {
    // Verificar que tenemos una URL válida
    if (!url) {
      throw new Error("No se recibió URL de descarga");
    }

    // Construir URL completa si es necesario
    const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
    
    if (showLogs) {
      console.log("URL completa:", fullUrl);
    }

    // Realizar la petición
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      },
    });

    if (showLogs) {
      console.log("Response de fetch:", response);
      console.log("Status de respuesta:", response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (showLogs) {
        console.log("Error del servidor:", errorText.substring(0, 500));
      }
      throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (showLogs) {
      console.log("Tipo de contenido:", contentType);
    }

    // Verificar que sea un PDF
    if (contentType && !contentType.includes("application/pdf")) {
      const errorText = await response.text();
      if (showLogs) {
        console.log("Contenido (no PDF):", errorText.substring(0, 500));
      }
      throw new Error(`Archivo no válido. Esperado: PDF, Recibido: ${contentType}`);
    }

    const blob = await response.blob();
    if (showLogs) {
      console.log("Blob recibido:", blob);
      console.log("Tamaño del blob:", blob.size, "bytes");
    }

    if (blob.size === 0) {
      throw new Error("El archivo descargado está vacío");
    }

    // Descargar el archivo
    saveAs(blob, filename);

  } catch (error) {
    console.error("Error al descargar PDF:", error);
    throw error; // Re-lanzar el error para que lo maneje quien llama la función
  }
};