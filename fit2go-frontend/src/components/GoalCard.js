import React, { useState } from 'react';

const GoalCard = ({ goal, onEdit, onDelete, onProgressUpdate, progressInput, setProgressInput, loading, GoalProgressRing }) => {
  const [expanded, setExpanded] = useState(false);
  const progress = typeof goal.progress === 'number' ? goal.progress : 0;
  const target = typeof goal.target === 'number' ? goal.target : 0;
  const percent = target > 0 ? Math.min(100, (progress / target) * 100) : 0;
  return (
    <div className="goal-card-modern" style={{ boxShadow: '0 4px 24px rgba(59,130,246,0.08)', borderRadius: 16, marginBottom: 24, background: goal.achieved ? '#d1fae5' : '#fff', border: goal.achieved ? '2px solid #10B981' : '1px solid #E5E7EB', transition: 'background 0.5s' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: 20 }}>
        <GoalProgressRing percent={percent} achieved={goal.achieved} />
        <div style={{ flex: 1, marginLeft: 24 }}>
          <h4 style={{ margin: 0, color: '#3B82F6', fontWeight: 700 }}>{goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Goal</h4>
          <div style={{ fontSize: 16, margin: '6px 0' }}><b>Target:</b> {target} {goal.unit}</div>
          <div style={{ fontSize: 15 }}><b>Progress:</b> {progress} / {target} {goal.unit}</div>
          <div style={{ fontSize: 15 }}><b>Status:</b> {goal.achieved ? <span style={{ color: '#10B981' }}>Achieved! 🎉</span> : 'In Progress'}</div>
          <div style={{ fontSize: 14, color: '#6B7280' }}><b>Deadline:</b> {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : ''}</div>
        </div>
        <button onClick={() => setExpanded(e => !e)} style={{ marginLeft: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#A855F7' }}>{expanded ? '▲' : '▼'}</button>
      </div>
      {expanded && (
        <div style={{ padding: '0 24px 20px 24px', borderTop: '1px solid #E5E7EB' }}>
          {goal.description && <div style={{ margin: '12px 0', fontSize: 15 }}><b>Description:</b> {goal.description}</div>}
          {/* Placeholder for detailed plan */}
          <div style={{ margin: '12px 0', fontSize: 15 }}><b>Plan:</b> <span style={{ color: '#6366F1' }}>[Weekly workout plan or nutrition plan here]</span></div>
          {/* Placeholder for history */}
          <div style={{ margin: '12px 0', fontSize: 15 }}><b>Recent Activity:</b> <span style={{ color: '#6366F1' }}>[Recent workouts or logs here]</span></div>
          {/* Quick actions */}
          {!goal.achieved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
              <input
                type="number"
                placeholder={`Add progress (${goal.unit})`}
                value={progressInput}
                onChange={e => setProgressInput(e.target.value)}
                style={{ width: 100 }}
                disabled={loading}
              />
              <button className="primary" style={{ padding: '4px 12px' }} onClick={() => onProgressUpdate(goal)} disabled={loading}>Update</button>
            </div>
          )}
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button className="action-edit" onClick={onEdit} disabled={loading}>Edit</button>
            <button className="action-delete" onClick={onDelete} disabled={loading}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalCard; 