import { useCallback, useMemo, useRef, useState } from 'react'
import {
  DefaultColorStyle,
  DefaultSizeStyle,
  DefaultStylePanel,
  StylePanelButtonPicker,
  StylePanelSection,
  StylePanelSizePicker,
  Tldraw,
  useStylePanelContext,
  useTranslation,
} from 'tldraw'
import 'tldraw/tldraw.css'
import { exportSketchImage, SKETCH_PAGE_SIZE } from '../lib/exportSketchImage'
import './SketchCanvas.css'

const MONO_COLORS = [
  { value: 'black', icon: 'color' },
  { value: 'white', icon: 'color' },
]

const SKETCH_TOOLS = ['select', 'draw', 'eraser']

const TLDRAW_OPTIONS = {
  maxPages: 1,
  createTextOnCanvasDoubleClick: false,
  spacebarPanning: false,
  rightClickPanning: false,
  camera: {
    isLocked: true,
    wheelBehavior: 'none',
    zoomSteps: [1],
    panSpeed: 0,
    zoomSpeed: 0,
    constraints: {
      bounds: { x: 0, y: 0, w: SKETCH_PAGE_SIZE, h: SKETCH_PAGE_SIZE },
      padding: { x: 0, y: 0 },
      origin: { x: 0.5, y: 0.5 },
      initialZoom: 'fit-max-100',
      baseZoom: 'fit-max-100',
      behavior: 'fixed',
    },
  },
}

const TLDRAW_COMPONENTS = {
  Minimap: null,
  PageMenu: null,
  NavigationPanel: null,
  ZoomMenu: null,
  HelpMenu: null,
  MainMenu: null,
  ActionsMenu: null,
  QuickActions: null,
  SharePanel: null,
  MenuPanel: null,
  StylePanel: SketchStylePanel,
}

const TLDRAW_OVERRIDES = {
  tools(_editor, tools) {
    return Object.fromEntries(
      SKETCH_TOOLS.filter((id) => tools[id]).map((id) => [id, tools[id]]),
    )
  },
}

function MonoColorPicker() {
  const { styles } = useStylePanelContext()
  const msg = useTranslation()
  const color = styles.get(DefaultColorStyle)

  if (color === undefined) return null

  return (
    <StylePanelButtonPicker
      title={msg('style-panel.color')}
      uiType="color"
      style={DefaultColorStyle}
      items={MONO_COLORS}
      value={color}
    />
  )
}

function SketchStylePanel(props) {
  return (
    <DefaultStylePanel {...props}>
      <StylePanelSection>
        <MonoColorPicker />
        <StylePanelSizePicker />
      </StylePanelSection>
    </DefaultStylePanel>
  )
}

function configureEditor(editor) {
  editor.setCurrentTool('draw')
  editor.setStyleForNextShapes(DefaultColorStyle, 'black')
  editor.setStyleForNextShapes(DefaultSizeStyle, 'm')
  editor.setCameraOptions(TLDRAW_OPTIONS.camera)
  editor.setCamera(editor.getCamera(), { immediate: true })
}

export default function SketchCanvas() {
  const editorRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleMount = useCallback((editor) => {
    editorRef.current = editor
    configureEditor(editor)
  }, [])

  const handleExport = useCallback(async () => {
    const editor = editorRef.current
    if (!editor || isExporting) return

    setIsExporting(true)
    try {
      const { dataUrl } = await exportSketchImage(editor)
      setPreviewUrl(dataUrl)
    } finally {
      setIsExporting(false)
    }
  }, [isExporting])

  const handleClear = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return

    const ids = [...editor.getCurrentPageShapeIds()]
    if (ids.length > 0) {
      editor.deleteShapes(ids)
    }
    setPreviewUrl(null)
  }, [])

  const options = useMemo(() => TLDRAW_OPTIONS, [])
  const components = useMemo(() => TLDRAW_COMPONENTS, [])
  const overrides = useMemo(() => TLDRAW_OVERRIDES, [])

  return (
    <div className="sketch-canvas-wrap">
      <Tldraw
        colorScheme="light"
        options={options}
        components={components}
        overrides={overrides}
        onMount={handleMount}
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
      </div>
    </div>
  )
}
