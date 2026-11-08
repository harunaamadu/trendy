import React from 'react';
import { LayoutTemplate, ExternalLink } from 'lucide-react';
import { Dialog } from './ui/dialog';

interface TemplateReferenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TemplateReferenceModal: React.FC<TemplateReferenceModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Design Template Reference"
      description="Original layout blueprint provided for the Trendy minimalist e-commerce store"
      maxWidth="4xl"
    >
      <div className="space-y-4">
        <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 flex items-center justify-between">
          <span>
            Layout structure: Top announcement bar • Header navigation • Hero section • Dual promo cards • 4-column product grid with category pills • Bento promotional grid • Triple mini lists • Newsletter subscription • Instagram Lookbook • Value perks • Footer
          </span>
          <a
            href="/assets/aistudio/a6ff1e5d1d11e367454662613f33d333_96308278.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 ml-3 inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700"
          >
            <span>Full Image</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="max-h-[600px] overflow-y-auto rounded-2xl border border-stone-200 bg-stone-100 flex justify-center p-2">
          <img
            src="/assets/aistudio/a6ff1e5d1d11e367454662613f33d333_96308278.jpg"
            alt="Design Template Reference"
            className="w-full max-w-2xl rounded-xl shadow-md object-contain"
          />
        </div>
      </div>
    </Dialog>
  );
};
