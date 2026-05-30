import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { useThemeStore } from './store/themeStore'
import './index.css'

const initialTheme = useThemeStore.getState().theme
document.documentElement.setAttribute('data-theme', initialTheme)

useThemeStore.subscribe((state) => {
  document.documentElement.setAttribute('data-theme', state.theme)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
