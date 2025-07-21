export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white pt-16 pb-20">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
            <span className="block">Illuminate Your</span>
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI Transformation
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600">
            Like the candlefish that lights up ocean depths, we illuminate the path through AI complexity. 
            Powered by Claude Sonnet 4 with 2M thinking tokens.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#pricing"
              className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Get started
            </a>
            <a href="#demo" className="text-base font-semibold leading-6 text-gray-900">
              Live demo <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-indigo-600">2M</p>
              <p className="mt-1 text-sm text-gray-600">Input Tokens/min</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600">400K</p>
              <p className="mt-1 text-sm text-gray-600">Output Tokens/min</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-indigo-600">99.9%</p>
              <p className="mt-1 text-sm text-gray-600">Uptime SLA</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl">
        <div
          className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-indigo-300 to-purple-300 opacity-30"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </section>
  );
}