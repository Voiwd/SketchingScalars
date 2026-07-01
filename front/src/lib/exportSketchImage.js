import { Box } from 'tldraw'

export const SKETCH_PAGE_SIZE = 280
export const EXPORT_PIXEL_SIZE = 28

/**
 * Exporta o conteúdo do canvas como PNG 28×28 (formato MNIST).
 *
 * @param {import('@tldraw/editor').Editor} editor
 * @returns {Promise<{ blob: Blob, width: number, height: number, dataUrl: string }>}
 */
export async function exportSketchImage(editor) {
  const ids = [...editor.getCurrentPageShapeIds()]

  const { blob, width, height } = await editor.toImage(ids, {
    format: 'png',
    bounds: new Box(0, 0, SKETCH_PAGE_SIZE, SKETCH_PAGE_SIZE),
    scale: EXPORT_PIXEL_SIZE / SKETCH_PAGE_SIZE,
    pixelRatio: 1,
    padding: 0,
    background: true,
    darkMode: false,
  })

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

  return { blob, width, height, dataUrl }
}
