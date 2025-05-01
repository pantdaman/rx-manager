export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Privacy Policy</h1>
      
      <div className="space-y-1">
        <section className="bg-white p-5 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Data Privacy Commitment</h2>
          <p className="text-gray-900 mb-4 text-sm" >
            PrescriptAI is committed to protecting your privacy. We operate on a strict no-storage policy for your personal and medical information.
          </p>
        </section>

        <section className="bg-white p-5 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">How We Handle Your Data</h2>
          <ul className="list-disc pl-6 space-y-3 text-gray-900 text-sm">
            <li><strong>No Storage Policy:</strong> We do not store any prescription images, personal information, or patient/doctor details.</li>
            <li><strong>Temporary Processing:</strong> Prescription data is only temporarily processed to extract medicine information.</li>
            <li><strong>Medicine Information:</strong> Only medicine names, dosages, and schedules are extracted and temporarily used for LLM processing.</li>
            <li><strong>Session-Only Use:</strong> All extracted information exists only during your active session and is immediately discarded afterward.</li>
          </ul>
        </section>

        <section className="bg-white p-5 ">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Data Security</h2>
          <p className="text-gray-900 mb-4 text-sm">
            While your data is being processed:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-900 text-sm">
            <li>All data transmission is encrypted</li>
            <li>No data is stored on our servers</li>
            <li>Information is processed in memory only</li>
            <li>Data is automatically cleared after processing</li>
          </ul>
        </section>

        <section className="bg-white p-5 rounded-lg ">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Contact Us</h2>
          <p className="text-gray-900 text-sm">
            If you have any questions about our privacy practices, please contact us at{' '}
            <a href="mailto:tnapnamad@gmail.com" className="text-blue-600 hover:underline">
              tnapnamad@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
} 