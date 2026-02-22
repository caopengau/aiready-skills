export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white">
      <div className="container mx-auto px-4 py-2 text-center text-sm text-slate-600">
        AIReady © {year} AIReady. Open source under MIT License.
      </div>
    </footer>
  );
}
