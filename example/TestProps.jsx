// Test React component to verify object/array props work
// This file can be used in a test Slidev presentation

import React from 'react'

export default function TestProps({ 
  title = 'Default Title',
  count = 0,
  config = {},
  items = [],
  nested = null
}) {
  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #42b883', 
      borderRadius: '8px',
      fontFamily: 'system-ui',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{ marginTop: 0, color: '#42b883' }}>Props Test Component</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <strong>Title (string):</strong> {title}
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <strong>Count (number):</strong> {count}
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <strong>Config (object):</strong>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '8px', 
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <strong>Items (array):</strong>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '8px', 
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(items, null, 2)}
        </pre>
      </div>
      
      {nested && (
        <div style={{ marginBottom: '16px' }}>
          <strong>Nested (object):</strong>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '8px', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(nested, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ 
        marginTop: '20px', 
        padding: '12px', 
        background: '#e8f5e9', 
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        ✅ If you can see all props above, the fix is working!
      </div>
    </div>
  )
}

