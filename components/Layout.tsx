import Footer from "./Footer";
import Header from "./Header";

type LayoutProps = {
  children?: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-col h-full mt-3 container px-10 lg:px-52 mx-aut">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
