import Footer from "./Footer";
import Header from "./Header";
import Head from "next/head";

type LayoutProps = {
  children?: React.ReactNode;
  title?: string;
};

const Layout = ({ children, title }: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{title || "Scorekeeper"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex flex-col h-full mt-3 container px-10 lg:px-52 mx-auto">
          <div className="flex-grow">{children}</div>
          <Footer />
        </main>
      </div>
    </>
  );
};

export default Layout;
