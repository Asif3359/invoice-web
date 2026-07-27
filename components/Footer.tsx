export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Invoice SaaS</h3>
            <p className="mt-2 text-sm text-slate-400">
              Streamline your invoicing, payments, and inventory management.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Product</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-slate-200">Features</a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-200">Pricing</a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-200">Integrations</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Company</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-slate-200">About</a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-200">Careers</a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-200">Blog</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Support</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-slate-200">Help Center</a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-200">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-200">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Invoice SaaS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}