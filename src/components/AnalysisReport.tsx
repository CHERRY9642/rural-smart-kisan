
import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Shield, Leaf, TestTube, Microscope } from 'lucide-react';

interface Metadata {
  crop_type: string;
  language: string;
  ai_source: string;
  confidence: string;
  timestamp: string;
}

interface AnalysisReportProps {
  analysis: string;
  metadata: Metadata;
}

const Section = ({ title, content, icon: Icon }: { title: string; content: string[], icon: React.ElementType }) => (
  <AccordionItem value={title} className="border-b-0 mb-2">
    <AccordionTrigger className="bg-gray-100 hover:bg-gray-200/70 rounded-lg p-4">
        <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5 text-primary" />
            <span className="font-semibold text-lg text-gray-800">{title}</span>
        </div>
    </AccordionTrigger>
    <AccordionContent className="prose prose-sm max-w-none p-4 bg-white rounded-b-lg">
      {content.map((line, i) => (
        <p key={i} dangerouslySetInnerHTML={{ __html: line }} />
      ))}
    </AccordionContent>
  </AccordionItem>
);

const AnalysisReport: React.FC<AnalysisReportProps> = ({ analysis, metadata }) => {
  const sections = analysis.split('---\n\n').map(section => {
    const [title, ...content] = section.trim().split('\n\n');
    const cleanedContent = content.map(c => 
      c.trim()
       .replace(/\*\*/g, '')
       .replace(/\*/g, '&bull;')
       .replace(/\n/g, '<br/>')
    );
    return { title: title.replace(/[#*]/g, '').trim(), content: cleanedContent };
  });

  const getIconForTitle = (title: string) => {
    if (title.includes('DISEASE')) return TestTube;
    if (title.includes('TREATMENT')) return Shield;
    if (title.includes('PREVENTION')) return Leaf;
    return Microscope;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Alert className="bg-blue-50 border-blue-200">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Analysis Complete!</AlertTitle>
        <AlertDescription className="text-blue-700">
          Review the detailed report below.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-500">Crop</p>
              <p className="font-bold text-gray-800">{metadata.crop_type}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-500">Confidence</p>
              <Badge variant={metadata.confidence === 'high' ? 'default' : 'secondary'}>{metadata.confidence}</Badge>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-500">Language</p>
              <p className="font-bold text-gray-800">{metadata.language}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-500">Source</p>
              <p className="font-bold text-gray-800">{metadata.ai_source}</p>
          </div>
      </div>

      <Accordion type="single" collapsible defaultValue={sections[0]?.title} className="w-full space-y-2">
        {sections.map(({ title, content }) => (
          <Section key={title} title={title} content={content} icon={getIconForTitle(title)} />
        ))}
      </Accordion>

      <div className="text-xs text-gray-400 text-center pt-4">
        Report generated at {new Date(metadata.timestamp).toLocaleString()}
      </div>
    </motion.div>
  );
};

export default AnalysisReport;
