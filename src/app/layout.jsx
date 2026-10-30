export const metadata = {
  title: 'MITRAREE ปรึกษาเภสัชกร',
  description: 'ต้นแบบแอปลูกค้าและคอนโซลร้าน MITRAREE',
};
export const viewport = {
  width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#F5F1EA',
};
export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
