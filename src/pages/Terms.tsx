import { DashboardNav } from "@/components/DashboardNav";
import { TopNav } from "@/components/TopNav";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
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
            <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
            <p className="mb-4 text-sm text-gray-600">
              Last updated: 7 June 2024
            </p>
            <p className="mb-4">
              Welcome to Wanderlust Compass! By accessing or using our website and services, you agree to be bound by these Terms of Service. Please read them carefully.
            </p>
            <h2 className="text-lg font-semibold mt-6 mb-2">1. Use of Service</h2>
            <p className="mb-4">
              You must be at least 18 years old to use this service. You agree to use the service only for lawful purposes and in accordance with these Terms.
            </p>
            <h2 className="text-lg font-semibold mt-6 mb-2">2. User Accounts</h2>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
            <h2 className="text-lg font-semibold mt-6 mb-2">3. Content</h2>
            <p className="mb-4">
              You retain ownership of any content you upload or create on the platform. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content as part of the service.
            </p>
            <h2 className="text-lg font-semibold mt-6 mb-2">4. Prohibited Activities</h2>
            <ul className="list-disc ml-6 mb-4">
              <li>Violating any laws or regulations</li>
              <li>Infringing on intellectual property rights</li>
              <li>Uploading harmful or malicious content</li>
              <li>Attempting to gain unauthorized access to the service</li>
            </ul>
            <h2 className="text-lg font-semibold mt-6 mb-2">5. Termination</h2>
            <p className="mb-4">
              We reserve the right to suspend or terminate your access to the service at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users.
            </p>
            <h2 className="text-lg font-semibold mt-6 mb-2">6. Disclaimer</h2>
            <p className="mb-4">
              The service is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free.
            </p>
            <h2 className="text-lg font-semibold mt-6 mb-2">7. Limitation of Liability</h2>
            <p className="mb-4">
              To the fullest extent permitted by law, Wanderlust Compass and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.
            </p>
            <h2 className="text-lg font-semibold mt-6 mb-2">8. Changes to Terms</h2>
            <p className="mb-4">
              We may update these Terms from time to time. We will notify users of any changes by updating the date at the top of this page. Continued use of the service after changes constitutes acceptance of the new Terms.
            </p>
            <h2 className="text-lg font-semibold mt-6 mb-2">9. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us at <a href="mailto:support@yourdomain.com" className="text-blue-600 hover:underline">support@yourdomain.com</a>.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
} 