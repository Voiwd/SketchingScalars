import { useState } from 'react'
import './App.css'
import SketchCanvas from './components/SketchCanvas'

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function App() {
  const [prediction, setPrediction] = useState(null)

  return (
    <div className="app">
      <main className="canvas-area">
        <SketchCanvas onPrediction={setPrediction} />
      </main>

      <aside className="digits-panel">
        <h2 className="panel-title">Dígitos</h2>
        <ul className="digits-list">
          {DIGITS.map((digit) => (
            <li
              key={digit}
              className={`digit-item ${prediction === digit ? 'digit-item--predicted' : ''}`}
            >
              {digit}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}

export default App
