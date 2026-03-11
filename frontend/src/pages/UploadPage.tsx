import UploadZone from '../components/upload/UploadZone';

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Tailor Your Resume</h2>
        <p className="text-gray-500 mt-2">Upload your resume and we'll help you stand out for the job.</p>
      </div>
      <UploadZone />
    </div>
  );
}
