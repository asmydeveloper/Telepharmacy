import Shell from './Shell';
import './styles.css';
import Runtime from '@/components/Runtime';
export const metadata = { title: 'MITRAREE คอนโซลร้าน · ปรึกษาเภสัชกร' };
export default function Page() {
  return (
    <>
      <Shell />
      <Runtime prelude={['/runtime/consultation-data.js']} src="/runtime/console.js" />
    </>
  );
}
