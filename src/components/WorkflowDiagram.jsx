/**
 * WorkflowDiagram — Mini horizontal node diagram
 * Shows a sequence of labeled nodes connected by lines.
 * Supports optional per-node status for execution visualization.
 */

const STATUS_COLORS = {
  pending:     'var(--border-light)',
  running:     'var(--accent)',
  completed:   'var(--green)',
  interrupted: 'var(--red)',
  failed:      'var(--red)',
  default:     'var(--accent)',
}

export default function WorkflowDiagram({ steps = [], statusMap = {} }) {
  const NODE_W = 88
  const NODE_H = 32
  const GAP = 36
  const totalW = steps.length * NODE_W + (steps.length - 1) * GAP
  const SVG_H = NODE_H + 8

  return (
    <div className="wf-diagram-wrap">
      <svg
        width={totalW}
        height={SVG_H}
        viewBox={`0 0 ${totalW} ${SVG_H}`}
        style={{ display: 'block', maxWidth: '100%' }}
      >
        {steps.map((step, idx) => {
          const x = idx * (NODE_W + GAP)
          const cx = x + NODE_W / 2
          const cy = SVG_H / 2
          const color = STATUS_COLORS[statusMap[step] || 'default']

          return (
            <g key={idx}>
              {/* Connector line to previous node */}
              {idx > 0 && (
                <line
                  x1={x - GAP}
                  y1={cy}
                  x2={x}
                  y2={cy}
                  stroke="var(--border-light)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Node box */}
              <rect
                x={x}
                y={cy - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx="6"
                fill="var(--bg-raised)"
                stroke={color}
                strokeWidth="1.5"
              />

              {/* Node label */}
              <text
                x={cx}
                y={cy + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontFamily="var(--sans)"
                fontWeight="600"
                fill={color}
              >
                {step.length > 10 ? step.slice(0, 10) + '…' : step}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
