import { useState } from 'react';
import { Button } from './button';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Input } from './input';
import { Label } from './label';
import { Checkbox } from './checkbox';

interface EmailNotificationProps {
  type: 'ORDER_CONFIRMATION' | 'SHIPPING_UPDATE' | 'LOW_STOCK_ALERT' | 'PROMOTION';
  data: any;
  onSent?: () => void;
}

export function EmailNotification({ type, data, onSent }: EmailNotificationProps) {
  const [sending, setSending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    setSending(true);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      toast({
        title: "Email sent",
        description: "The notification has been sent successfully"
      });
      
      onSent?.();
    } catch (error) {
      console.error('Email error:', error);
      toast({
        title: "Send failed",
        description: "There was a problem sending the email",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSend}
          disabled={sending}
          className="w-[200px]"
        >
          <Send className="mr-2 h-4 w-4" />
          {sending ? 'Sending...' : 'Send Notification'}
        </Button>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="preview"
            checked={previewMode}
            onCheckedChange={(checked) => setPreviewMode(!!checked)}
          />
          <Label htmlFor="preview">Preview Mode</Label>
        </div>
      </div>

      {previewMode && (
        <div className="border rounded-lg p-4 mt-4 space-y-4">
          <h3 className="font-semibold">Email Preview</h3>
          <div className="space-y-2">
            <Label>Type</Label>
            <Input value={type} disabled />
          </div>
          <div className="space-y-2">
            <Label>Data</Label>
            <pre className="bg-muted p-2 rounded text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}