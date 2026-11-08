import Shell from './Shell';
import './styles.css';
import Runtime from '@/components/Runtime';
export const metadata = { title: 'ผังทุกจอ ปรึกษาเภสัชกร' };
export default function Page() {
  return (
    <>
      <Shell />
      <Runtime src="/runtime/screens.js" />
    </>
  );
}
