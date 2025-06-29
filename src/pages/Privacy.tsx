import { DashboardNav } from "@/components/DashboardNav";
import { TopNav } from "@/components/TopNav";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="lg:pl-64">
        <TopNav />
        <main>
          <div className="max-w-2xl mx-auto py-12 px-4">
            <Link to="/support" className="flex items-center text-muted-foreground hover:text-foreground group mb-4">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="group-hover:underline">Back to Support</span>
            </Link>
            <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
            <p className="mb-4 text-sm text-gray-600">
              Last updated: 7 June 2024
            </p>
            <p className="mb-4">
              Wanderlust Compass (“we”, “us”, or “our”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.
            </p>
            <h2 className="text-lg font-semibold mt-6 mb-2">1. Information We Collect</h2>
            <ul className="list-disc ml-6 mb-4">
              <li>
                <strong>Personal Information:</strong> When you register, we may collect your name, email address, and other contact details.
              </li>
              <li>
                <strong>Usage Data:</strong> We may collect information about how you use the app, such as pages visited, features used, and device information.
              </li>
              <li>
                <strong>Uploaded Content:</strong> Any files, notes, or data you upload or create within the app.
              </li>
            </ul>
            <h2 className="text-lg font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc ml-6 mb-4">
              <li>To provide and maintain our services</li>
              <li>To communicate with you about your account or support requests</li>
              <li>To improve our app and user experience</li>
              <li>To comply with legal obligations</li>
            </ul>
            <h2 className="text-lg font-semibold mt-6 mb-2">3. Sharing Your Information</h2>
            <p className="mb-4">
              We do not sell your personal information. We may share your information with trusted third-party service providers who assist us in operating our app, as well as when required by law.
            </p>
            <h2 className="text-lg font-semibold mt-6 mb-2">4. Data Security</h2>
            <p className="mb-4">
              We implement reasonable security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
            <h2 className="text-lg font-semibold mt-6 mb-2">5. Your Rights</h2>
            <p className="mb-4">
              You may access, update, or delete your personal information at any time by contacting us. If you are in the EU/UK, you have additional rights under GDPR.
            </p>
            <h2 className="text-lg font-semibold mt-6 mb-2">6. Children's Privacy</h2>
            <p className="mb-4">
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>
            <h2 className="text-lg font-semibold mt-6 mb-2">7. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify users of any changes by updating the date at the top of this page.
            </p>
            <h2 className="text-lg font-semibold mt-6 mb-2">8. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@yourdomain.com" className="text-blue-600 hover:underline">support@yourdomain.com</a>.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
} 