import { Link } from "react-router-dom";
import { DashboardNav } from "@/components/DashboardNav";
import { TopNav } from "@/components/TopNav";

export default function Support() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="lg:pl-64">
        <TopNav />
        <main>
          <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-2xl font-bold mb-4">Support</h1>
            <p className="mb-4">If you need help or have any questions, please contact our support team at <a href="mailto:support@yourdomain.com" className="text-blue-600 hover:underline">support@yourdomain.com</a>.</p>
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Legal</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 