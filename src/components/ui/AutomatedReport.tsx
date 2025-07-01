import { useState } from 'react';
import { Button } from './button';
import { FileDown, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface AutomatedReportProps {
  type: string;
  onGenerated?: (url: string) => void;
}

export function AutomatedReport({ type, onGenerated }: AutomatedReportProps) {
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState('7d');
  const { toast } = useToast();

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`/api/reports/${type}?range=${dateRange}`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Failed to generate report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${dateRange}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      onGenerated?.(url);
      
      toast({
        title: "Report generated",
        description: "Your report has been generated successfully"
      });
    } catch (error) {
      console.error('Report error:', error);
      toast({
        title: "Generation failed",
        description: "There was a problem generating the report",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="mr-2 h-4 w-4" />
          )}
          {generating ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>
    </div>
  );
}