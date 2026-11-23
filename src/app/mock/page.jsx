import MockStudio from './MockStudio';
import './studio.css';
import '@/styles/figma-tokens.css';
import '@/styles/tokens.css';

export const metadata = { title: 'Mock Studio | MITRAREE' };

export default function Page() {
  return <MockStudio />;
}
