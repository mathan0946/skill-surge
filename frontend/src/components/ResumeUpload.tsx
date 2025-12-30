import { useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';

interface ResumeUploadProps {
  onUpload: (text: string) => void;
  isLoading?: boolean;
}

export function ResumeUpload({ onUpload, isLoading }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        await processFile(file);
      }
    },
    [onUpload]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setFileName(file.name);
    
    // Read file as text (for demo purposes)
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onUpload(text);
    };
    reader.readAsText(file);
  };

  const handlePasteText = () => {
    const sampleResume = `
John Doe
Senior Software Engineer

EXPERIENCE
Senior Frontend Engineer | Tech Corp | 2021-Present
- Built React applications with TypeScript
- Led team of 5 developers
- Implemented CI/CD pipelines

Software Engineer | StartupXYZ | 2019-2021
- Developed Node.js microservices
- Created REST APIs with Express
- Managed PostgreSQL databases

SKILLS
- JavaScript, TypeScript, Python
- React, Vue.js, Node.js
- PostgreSQL, MongoDB, Redis
- AWS, Docker, Kubernetes
- System Design, Agile

EDUCATION
BS Computer Science | State University | 2019
`;
    setFileName('sample_resume.txt');
    onUpload(sampleResume);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
              ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}
              ${isLoading ? 'pointer-events-none opacity-50' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-gray-400">Analyzing your resume with AI...</p>
              </div>
            ) : fileName ? (
              <div className="flex flex-col items-center gap-4">
                <FileText className="w-12 h-12 text-green-500" />
                <p className="text-white font-medium">{fileName}</p>
                <p className="text-gray-400 text-sm">File uploaded successfully!</p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">
                  Drag and drop your resume here
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Supports PDF, DOC, DOCX, or TXT files
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Browse Files
                  </Button>
                  <Button variant="outline" onClick={handlePasteText}>
                    Use Sample Resume
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
