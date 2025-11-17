/**
 * Results Display Component
 * Shows extraction results in multiple formats: JSON, CSV, HTML, Table view
 */

import { useState, useEffect } from 'react'
import { Card } from './ui'

interface ResultsDisplayProps {
  documentId: string
  result?: any
  onClose: () => void
}

interface FormattedData {
  data: any
  success: boolean
}

export function ResultsDisplay({ documentId, onClose }: ResultsDisplayProps) {
  const [format, setFormat] = useState<string>('table')
  const [formattedData, setFormattedData] = useState<FormattedData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFormatted = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/documents/${documentId}/formatted?format=${format}`)
        if (!response.ok) throw new Error('Failed to fetch formatted data')
        const data = await response.json() as FormattedData
        setFormattedData(data)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (documentId) {
      fetchFormatted()
    }
  }, [documentId, format])

  const handleExport = async (exportFormat: string) => {
    try {
      const response = await fetch(`/api/export/${documentId}?format=${exportFormat}`)
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `extraction_${documentId}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed'
      setError(errorMessage)
    }
  }

  return (
    <div className="results-display">
      <Card>
        <div className="results-header">
          <h2>📊 Extraction Results</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Format Selector */}
        <div className="format-selector">
          <div className="buttons-group">
            <button
              className={`format-btn ${format === 'table' ? 'active' : ''}`}
              onClick={() => setFormat('table')}
            >
              📋 Table View
            </button>
            <button
              className={`format-btn ${format === 'json' ? 'active' : ''}`}
              onClick={() => setFormat('json')}
            >
              {} JSON
            </button>
            <button
              className={`format-btn ${format === 'csv' ? 'active' : ''}`}
              onClick={() => setFormat('csv')}
            >
              📊 CSV
            </button>
            <button
              className={`format-btn ${format === 'html' ? 'active' : ''}`}
              onClick={() => setFormat('html')}
            >
              🌐 HTML
            </button>
            <button
              className={`format-btn ${format === 'xml' ? 'active' : ''}`}
              onClick={() => setFormat('xml')}
            >
              ≡ XML
            </button>
          </div>

          <div className="export-buttons">
            <button className="export-btn" onClick={() => handleExport('json')}>
              ⬇️ JSON
            </button>
            <button className="export-btn" onClick={() => handleExport('csv')}>
              ⬇️ CSV
            </button>
            <button className="export-btn" onClick={() => handleExport('html')}>
              ⬇️ HTML
            </button>
            <button className="export-btn" onClick={() => handleExport('xml')}>
              ⬇️ XML
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && <div style={{ color: 'red', padding: '10px', background: '#ffe0e0', borderRadius: '4px' }}>{error}</div>}

        {/* Loading */}
        {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Loading formatted data...</div>}

        {/* Content Display */}
        {!loading && formattedData && (
          <div className="results-content">
            {format === 'table' && <TableView data={formattedData.data} />}
            {format === 'json' && <JSONView data={formattedData.data} />}
            {format === 'csv' && <CSVView data={formattedData.data} />}
            {format === 'html' && <HTMLView data={formattedData.data} />}
            {format === 'xml' && <XMLView data={formattedData.data} />}
          </div>
        )}
      </Card>

      <style>{`
        .results-display {
          margin-top: 20px;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 15px;
        }

        .results-header h2 {
          margin: 0;
          font-size: 20px;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #000;
        }

        .format-selector {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }

        .buttons-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .format-btn {
          padding: 8px 14px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
          font-weight: 500;
        }

        .format-btn:hover {
          border-color: #007bff;
          background: #f0f7ff;
        }

        .format-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .export-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-left: auto;
        }

        .export-btn {
          padding: 8px 12px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: background 0.2s;
        }

        .export-btn:hover {
          background: #218838;
        }

        .results-content {
          overflow-x: auto;
          background: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .format-selector {
            flex-direction: column;
          }

          .export-buttons {
            margin-left: 0;
          }

          .buttons-group {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Table View Component
 */
function TableView({ data }: { data: any }) {
  return (
    <div className="table-view">
      {data.sections && data.sections.map((section: any, idx: number) => (
        <div key={idx} className="table-section">
          <h3>{section.title}</h3>
          {section.data && section.data.length > 0 ? (
            <table className="results-table">
              <thead>
                <tr>
                  {section.columns && section.columns.map((col: string) => (
                    <th key={col}>{humanize(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.data.map((item: any, itemIdx: number) => (
                  <tr key={itemIdx}>
                    {section.columns && section.columns.map((col: string) => (
                      <td key={col}>
                        {col === 'confidence' ? (
                          <ConfidenceBadge value={item[col]} />
                        ) : (
                          String(item[col] || '-')
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No {section.title.toLowerCase()} found</p>
          )}
        </div>
      ))}

      <style>{`
        .table-view {
          width: 100%;
        }

        .table-section {
          margin-bottom: 25px;
        }

        .table-section h3 {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .results-table th {
          background: #f0f0f0;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #ddd;
          font-size: 13px;
        }

        .results-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #e0e0e0;
          font-size: 13px;
          color: #555;
        }

        .results-table tr:hover {
          background: #f5f5f5;
        }

        .no-data {
          color: #999;
          font-style: italic;
          padding: 20px;
          text-align: center;
        }
      `}</style>
    </div>
  )
}

/**
 * JSON View Component
 */
function JSONView({ data }: { data: any }) {
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  
  return (
    <div className="json-view">
      <pre>{jsonStr}</pre>
      <style>{`
        .json-view pre {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}

/**
 * CSV View Component
 */
function CSVView({ data }: { data: any }) {
  const csvStr = typeof data === 'string' ? data : JSON.stringify(data)
  
  return (
    <div className="csv-view">
      <textarea readOnly value={csvStr} rows={10} />
      <style>{`
        .csv-view textarea {
          width: 100%;
          background: #f5f5f5;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          resize: vertical;
        }
      `}</style>
    </div>
  )
}

/**
 * HTML View Component
 */
function HTMLView({ data }: { data: any }) {
  return (
    <div className="html-view">
      <iframe
        srcDoc={typeof data === 'string' ? data : ''}
        style={{
          width: '100%',
          height: '600px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
        title="HTML Preview"
      />
    </div>
  )
}

/**
 * XML View Component
 */
function XMLView({ data }: { data: any }) {
  const xmlStr = typeof data === 'string' ? data : JSON.stringify(data)
  
  return (
    <div className="xml-view">
      <pre>{xmlStr}</pre>
      <style>{`
        .xml-view pre {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.5;
          border: 1px solid #ddd;
        }
      `}</style>
    </div>
  )
}

/**
 * Confidence Badge Component
 */
function ConfidenceBadge({ value }: { value: number }) {
  const percentage = Math.round((value || 0) * 100)
  let color = '#28a745'
  if (percentage < 50) color = '#dc3545'
  else if (percentage < 70) color = '#ffc107'

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 8px',
        background: color,
        color: 'white',
        borderRadius: '3px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}
    >
      {percentage}%
    </span>
  )
}

/**
 * Humanize field names
 */
function humanize(str: string) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c: string) => c.toUpperCase())
    .trim()
}

export default ResultsDisplay
