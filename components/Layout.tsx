import Footer from "./Footer";
import Header from "./Header";

type LayoutProps = {
  children?: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col items-center h-screen w-screen">
      <Header />
      <main className="flex flex-col h-screen mt-3 container px-10 lg:px-52 mx-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
