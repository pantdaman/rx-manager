export default function AIDisclaimer() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8 text-gray-900">AI Disclaimer</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">AI Technology Usage</h2>
          <p className="text-gray-900 text-sm">
            PrescriptAI uses artificial intelligence and machine learning technologies to process prescriptions, extract information, and generate medicine schedules. While we strive for accuracy, please note that our AI systems are assistive tools and not a replacement for professional medical advice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Limitations and Accuracy</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-900 text-sm">
            <li>Our AI may not recognize all handwriting styles or prescription formats</li>
            <li>OCR accuracy depends on image quality and clarity</li>
            <li>Translation services are automated and may not capture medical nuances perfectly</li>
            <li>Always verify the extracted information with your original prescription</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Medical Advice Disclaimer</h2>
          <p className="text-gray-900 text-sm">
            The information provided by PrescriptAI is for convenience and organizational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions about your medical condition or treatment.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">User Responsibility</h2>
          <p className="text-gray-900 text-sm">
            Users are responsible for verifying all information extracted by our AI systems. In case of any discrepancy between the AI-generated information and your original prescription, always follow your original prescription and consult your healthcare provider.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Continuous Improvement</h2>
          <p className="text-gray-900 text-sm">
            Our AI systems are continuously learning and improving. We welcome your feedback to help us enhance the accuracy and reliability of our services. Please report any inconsistencies or errors to{' '}
            <a href="mailto:tnapnamad@gmail.com" className="text-blue-600 hover:underline">
              tnapnamad@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
} 