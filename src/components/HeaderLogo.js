export default function HeaderLogo({ showTitle = false }) {
  return (
    <a href="/">
      <img
        className="h-full inline-block pt-1 pb-1"
        src="/genie2.png"
        alt="logo"
      />
      {showTitle && (
        <div className="pl-2 align-middle font-extrabold text-white text-lg hidden xl:inline-block">
          3DGenie
        </div>
      )}
    </a>
  );
}
