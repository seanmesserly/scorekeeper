const Footer = () => {
  return (
    <footer className="text-gray-600">
      <hr className="mt-3" />
      <div className="flex items-center justify-center py-3">
        Check out this project's source
        <a
          className="ml-1 font-medium text-purple-500 hover:text-purple-700"
          href="https://github.com/seanmesserly/scorekeeper"
          target="_blank"
        >
          here
        </a>
        !
      </div>
    </footer>
  );
};

export default Footer;
