import { useCallback, useEffect, useRef, useState } from 'react'
import { exportSketchImage } from '../lib/exportSketchImage'
import './SketchCanvas.css'

const CANVAS_SIZE = 280
const BRUSH_SIZE = 24
const API_ENDPOINT = 'http://127.0.0.1:8000/'

export default function SketchCanvas({ onPrediction }) {
  const canvasRef = useRef(null)
  const isDrawingRef = useRef(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [isExporting, setIsExporting] = useState(false)

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    canvas.width = CANVAS_SIZE
    canvas.height = CANVAS_SIZE
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#000000'
    context.lineWidth = BRUSH_SIZE
    context.globalAlpha = 0.95
  }, [])

  useEffect(() => {
    resizeCanvas()
  }, [resizeCanvas])

  const getPoint = useCallback((event) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    }
  }, [])

  const startDrawing = useCallback(
    (event) => {
      event.preventDefault()
      const point = getPoint(event)
      if (!point) return

      const context = canvasRef.current?.getContext('2d')
      if (!context) return

      isDrawingRef.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
      context.beginPath()
      context.moveTo(point.x, point.y)
      context.lineTo(point.x, point.y)
      context.stroke()
      context.globalCompositeOperation = 'source-over'
    },
    [getPoint],
  )

  const draw = useCallback(
    (event) => {
      if (!isDrawingRef.current) return

      const point = getPoint(event)
      if (!point) return

      const context = canvasRef.current?.getContext('2d')
      if (!context) return

      context.lineWidth = BRUSH_SIZE - 1
      context.lineTo(point.x, point.y)
      context.stroke()
      context.lineWidth = BRUSH_SIZE
    },
    [getPoint],
  )

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false
    canvasRef.current?.getContext('2d')?.closePath()
  }, [])

  const uploadSketch = useCallback(async (blob) => {
    const formData = new FormData()
    formData.append('file', blob, 'sketch.png')

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || 'Falha ao enviar a imagem para a API.')
    }

    const data = await response.json()
    return data
  }, [])

  const handleExport = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || isExporting) return

    setIsExporting(true)
    setError(null)

    try {
      const { dataUrl, blob } = await exportSketchImage(canvas)
      setPreviewUrl(dataUrl)

      const result = await uploadSketch(blob)
      if (onPrediction) {
        onPrediction(result.prediction)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao enviar a imagem.')
    } finally {
      setIsExporting(false)
    }
  }, [isExporting, onPrediction, uploadSketch])

  const handleClear = useCallback(() => {
    resizeCanvas()
    setPreviewUrl(null)
    setError(null)
    if (onPrediction) {
      onPrediction(null)
    }
  }, [onPrediction, resizeCanvas])

  return (
    <div className="sketch-canvas-wrap">
      <canvas
        ref={canvasRef}
        className="sketch-canvas"
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        onPointerCancel={stopDrawing}
      />

      <div className="sketch-canvas-actions">
        <button type="button" className="sketch-action-btn" onClick={handleClear}>
          Limpar
        </button>
        <button
          type="button"
          className="sketch-action-btn sketch-action-btn--primary"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? 'Exportando…' : 'Exportar 28×28'}
        </button>

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Pré-visualização exportada 28×28"
            className="sketch-export-preview"
            width={28}
            height={28}
          />
        )}

        {error && <div className="sketch-error">{error}</div>}
      </div>
    </div>
  )
}
