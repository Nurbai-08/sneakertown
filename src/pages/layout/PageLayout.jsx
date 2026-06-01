import { Header } from '../../widgets/Header/Header.jsx';
import { Footer } from '../../widgets/Footer/Footer.jsx';

export const PageLayout = ({ children }) => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);
