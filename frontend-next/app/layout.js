import "./globals.css";

export const metadata = {
  title: "БьютиШоп Чили",
  description: "BeautyShop Chile storefront",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
