import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0a0a0f] flex flex-col items-center justify-center p-8">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-blue w-96 h-96 -top-48 left-1/4" style={{ animationDelay: '0s' }} />
        <div className="orb orb-cyan w-80 h-80 bottom-0 -right-40" style={{ animationDelay: '2s' }} />
        <div className="orb orb-purple w-72 h-72 top-1/4 -left-36" style={{ animationDelay: '4s' }} />
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute inset-0 bg-radial-glow" />

      {/* Content */}
      <div className="relative z-10 max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-3 gradient-text-animated">
            Welcome to AIReady
          </h1>
          <p className="text-slate-400 text-lg">
            Sign in to track your codebase AI readiness
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          <LoginForm />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-slate-500">secure authentication</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            New to AIReady?{' '}
            <a href="/" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Learn more
            </a>
          </p>
        </div>

        {/* Features preview */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          {[
            { icon: '📊', label: 'Track Trends' },
            { icon: '🎯', label: 'Benchmark' },
            { icon: '🤖', label: 'AI Insights' },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-xs text-slate-400">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}