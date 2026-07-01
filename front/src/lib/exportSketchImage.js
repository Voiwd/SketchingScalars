export const EXPORT_PIXEL_SIZE = 28

/**
 * Exporta o conteúdo do canvas como PNG 28×28.
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<{ blob: Blob, width: number, height: number, dataUrl: string }>}
 */
export async function exportSketchImage(canvas) {
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = EXPORT_PIXEL_SIZE
  exportCanvas.height = EXPORT_PIXEL_SIZE

  const context = exportCanvas.getContext('2d')
  if (!context) {
    throw new Error('Não foi possível criar o contexto do canvas de exportação.')
  }

  context.imageSmoothingEnabled = false
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
  context.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height)

  const blob = await new Promise((resolve, reject) => {
    exportCanvas.toBlob((value) => {
      if (value) {
        resolve(value)
        return
      }

      reject(new Error('Falha ao criar a imagem exportada.'))
    }, 'image/png')
  })

  const dataUrl = exportCanvas.toDataURL('image/png')

  return { blob, width: EXPORT_PIXEL_SIZE, height: EXPORT_PIXEL_SIZE, dataUrl }
}
