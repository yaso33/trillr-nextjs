import '@testing-library/jest-dom'
import React from 'react'

// For tests compiled with the classic JSX transform (`React.createElement`),
// ensure `React` is available globally to avoid "React is not defined" errors.
;(globalThis as any).React = React
