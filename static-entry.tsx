import { createRoot } from 'react-dom/client';
import Home from './app/page';
import './app/globals.css';

document.documentElement.style.setProperty('--font-geist-sans', 'Arial, Helvetica, sans-serif');
document.documentElement.style.setProperty('--font-geist-mono', 'monospace');
createRoot(document.getElementById('root')!).render(<Home />);
